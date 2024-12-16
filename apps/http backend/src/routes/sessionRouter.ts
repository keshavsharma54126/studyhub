import {Router,Request,Response, application} from "express"
import { sessionSchema } from "../types/types";
import { userMiddleware } from "../middlewares/userMiddleware";
import client from "@repo/db/client";
import amqp from "amqplib";
//@ts-ignore
import { AccessToken } from 'livekit-server-sdk';

export const SessionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672"
const QUEUE_NAME = "upload-pdf"

let channel:amqp.Channel|null = null;

async function initializeRabbitMQ(){
  try{
    const connection = await amqp.connect(RABBITMQ_URL)
    channel = await connection.createChannel()
    await channel.assertQueue(QUEUE_NAME,{
      durable:true
    })
  }catch(error){
    console.error("Error initializing RabbitMQ:", error);
    setTimeout(initializeRabbitMQ,1000)
  }
}

initializeRabbitMQ()

const sessionRouter = Router();

sessionRouter.post("/session", userMiddleware, async (req:any, res: any) => {
  try {
    console.log(req.body)
    const parsedData = sessionSchema.safeParse(req.body);
    console.log(parsedData)
    if(!parsedData.success){
      return res.status(400).json({
        message:"invalid input"
      })
    }
    const {title,description,sessionDate,sessionCode} = parsedData.data;
    const userId = req.userId;
    if(!userId){
      return res.status(400).json({
        message:"unauthorized"
      })
    }

    const session = await client.session.create({
      data:{
        title,
        description,
        startTime:new Date(sessionDate),
        secretCode:sessionCode,
        userId
      }
    })
    res.status(200).json({
        message:"session created successfully",
        sessionId:session.id
    })
  }catch(error){
    res.status(500).json({
        message:"internal server error"
    })
  }
})

sessionRouter.get("/sessions",userMiddleware,async(req:any,res:any)=>{
  try{
    const userId = req.userId;
    if(!userId){
      return res.status(400).json({
        message:"unauthorized"
      })
    }
    const sessions = await client.session.findMany({})
    res.status(200).json({
      sessions
    })

  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})


sessionRouter.get("/session/:sessionId",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.params.sessionId;
    const session = await client.session.findUnique({
      where:{
        id:sessionId
      }
    })
    res.status(200).json({
      session
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.get("/sessions/:userId",userMiddleware,async(req:any,res:any)=>{
  try{
    const userId = req.userId;
    if(!userId){
      return res.status(400).json({
        message:"unauthorized"
      })
    }
    const sessions = await client.session.findMany({
      where:{
        userId,
        status:{
          in:[SessionStatus.PENDING,SessionStatus.ACTIVE]
        }
      },
      select:{
        id:true,
        title:true,
        description:true,
        startTime:true,
        secretCode:true,
        status:true,
        slides:{
          select:{
            id:true
          }
        }
      },
      orderBy:{
        startTime:"desc"
      }
    })
    res.status(200).json({
      sessions
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.delete("/session/:sessionId",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.params.sessionId;
    const session = await client.session.delete({
      where:{
        id:sessionId
      }
    })
    if(!session){
      return res.status(400).json({
        message:"session not found"
      })
    }
    res.status(200).json({
      message:"session deleted successfully"
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.put("/session/:sessionId/start",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.params.sessionId;
    if(!sessionId){
      return res.status(400).json({
        message:"session id is required"
      })
    }
    const session = await client.session.update({
      where:{
        id:sessionId
      },
      data:{
        status:SessionStatus.ACTIVE,
        actualStartTime:new Date()
      }
    })
    res.status(200).json({
      message:"session started successfully",
      session
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.put("/session/:sessionId/end",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.params.sessionId;
    if(!sessionId){
      return res.status(400).json({
        message:"session id is required"
      })
    } 
    const endTime = new Date();
    const session = await client.session.update({
      where:{
        id:sessionId
      },
      data:{
        status:SessionStatus.INACTIVE,
        endTime:endTime
      }
    })
    res.status(200).json({
      message:"session ended successfully",
      session
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.post("/session/:sessionId/slides/upload",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.params.sessionId;
    const {pdfUrls} = req.body;
    if(!pdfUrls || !sessionId){
      return res.status(400).json({
        message:"pdfurl and sessionId  is required"
      })
    }


    if(!sessionId){
      return res.status(400).json({
        message:"session id is required"
      })
    }
    const session = await client.session.findUnique({
      where:{
        id:sessionId
      }
    })
    if(!session){
      return res.status(400).json({
        message:"session not found"
      })
    }
    channel?.sendToQueue(QUEUE_NAME,Buffer.from(JSON.stringify({pdfUrls,sessionId})))
    res.status(200).json({
      message:"pdf uploaded successfully"
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.get("/session/:sessionId/slides/images",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.params.sessionId;
  const images = await client.slide.findMany({
    where:{
      sessionId, 
    } 
  })
    res.status(200).json({
      images
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.post("/session/:sessionId/slides",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.paras.sessionId ;
    if(!sessionId){
      return res.status(400).json({
        message:"session id not available"
      })
    }
    const session = await client.session.findUnique({
      where:{
        id:sessionId
      }
    })
    if(!session){
      return res.status(400).json({
        message:"session not present"
      })
    }
    await client.slide.create({
      data:{
        sessionId,
        url:"https://img.freepik.com/free-vector/vector-paper-sheet-isolated-gray-background-with-red-pins_134830-1039.jpg?semt=ais_hybrid"
      }
    })
    return res.status(200).json({
      message:"empty sliide added successfully"
    })


  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.delete("/session/:sessionId/slides/:slideId",userMiddleware,async(req:any,res:any)=>{
  try{
    const slideId = req.params.slideId;
    const sessionId = req.params.sessionId;
    if(!slideId || !sessionId){
      return res.status(400).json({
        message:"slide id is required"
      })
    }

    await client.slide.delete({
      where:{
        id:slideId,
        sessionId:sessionId
      }
    })
    res.status(200).json({
      message:"slide deleted successfully"
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

const createToken = async (roomname:string,participantname:string) => {
  // If this room doesn't exist, it'll be automatically created when the first
  // participant joins
  const roomName = roomname;
  // Identifier to be used for participant.
  // It's available as LocalParticipant.identity with livekit-client SDK
  const participantName = participantname;

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: participantName,
    // Token to expire after 10 minutes
    ttl: '10m',
  });
  at.addGrant({ roomJoin: true, room: roomName });

  return await at.toJwt();
};

sessionRouter.get("/session/:sessionId/status",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.params.sessionId;
    const session = await client.session.findUnique({
      where:{
        id:sessionId
      }
    })
    if(!session){
      return res.status(400).json({
        message:"session not found"
      })
    }
    if(session.status === SessionStatus.INACTIVE){
      return res.status(200).json({
        message:"session ended"
      })
    }
    res.status(200).json({
      message:"session is active"
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

sessionRouter.post("/token",userMiddleware,async(req:any,res:any)=>{
  try{
    const userId = req.userId;
    const {roomName,participantName} = req.body;
    if(!userId){
      return res.status(400).json({
        message:"unauthorized"
      })
    }
    if(!roomName || !participantName){
      return res.status(400).json({
        message:"room name and participant name is required"
      })
    }
    const token = await createToken(roomName,participantName);
    res.status(200).json({
      token
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})  

export default sessionRouter;
