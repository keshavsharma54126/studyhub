import {Router,Request,Response, application} from "express"
import { sessionSchema } from "../types/types";
import { userMiddleware } from "../middlewares/userMiddleware";
import client from "@repo/db/client";
import multer from "multer"
import amqp from "amqplib"

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
    const parsedData = sessionSchema.safeParse(req.body);
    if(!parsedData.success){
      return res.status(400).json({
        message:"invalid input"
      })
    }
    const {title,startTime} = parsedData.data;
    const userId = req.userId;
    if(!userId){
      return res.status(400).json({
        message:"unauthorized"
      })
    }
    const session = await client.session.create({
      data:{
        userId,
        title,
        startTime,
        status:SessionStatus.PENDING
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
    const userId = req.params.userId;
    if(!userId){
      return res.status(400).json({
        message:"unauthorized"
      })
    }
    const sessions = await client.session.findMany({
      where:{
        userId
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
        status:SessionStatus.ACTIVE
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
    const session = await client.session.update({
      where:{
        id:sessionId
      },
      data:{
        status:SessionStatus.INACTIVE
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

sessionRouter.post("/session/:sessionId/slides/uplaod",userMiddleware,async(req:any,res:any)=>{
  try{
    const sessionId = req.params.sessionId;
    const {pdfUrl} = req.body;
    if(!pdfUrl || !sessionId){
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
    channel?.sendToQueue(QUEUE_NAME,Buffer.from(JSON.stringify({pdfUrl,sessionId})))
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
  const images = await client.image.findMany({
    where:{
      sessionId
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

export default sessionRouter;