import {Router,Request,Response, application} from "express"
import { sessionSchema } from "../types/types";
import { userMiddleware } from "../middlewares/userMiddleware";
import client from "@repo/db/client";
import amqp from "amqplib";
//@ts-ignore
import { AccessToken, EgressClient, EncodedFileType, S3Upload, SegmentedFileOutput } from 'livekit-server-sdk';

const egressClient = new EgressClient(process.env.LIVEKIT_URL!,process.env.LIVEKIT_API_KEY!,process.env.LIVEKIT_API_SECRET!)

export const SessionStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672"
const QUEUE_NAME = "upload-pdf"

let channel:amqp.Channel|null = null;

if(!process.env.REGION || !process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY){
    throw new Error("Missing environment variables")
}

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

export const sessionRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Session management endpoints
 * 
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         secretCode:
 *           type: string
 *         status:
 *           type: string
 *           enum: [PENDING, ACTIVE, INACTIVE]
 *         userId:
 *           type: string
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /session:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - sessionDate
 *               - sessionCode
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               sessionDate:
 *                 type: string
 *                 format: date-time
 *               sessionCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *       400:
 *         description: Invalid input or unauthorized
 *       500:
 *         description: Internal server error
 */

sessionRouter.post("/session", userMiddleware, async (req:any, res: any) => {
  try {
    const parsedData = sessionSchema.safeParse(req.body);
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

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get all sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       400:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /session/{sessionId}:
 *   get:
 *     summary: Get a specific session by ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /sessions/{userId}:
 *   get:
 *     summary: Get all active and pending sessions for a user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user's sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       400:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /ended/{userId}:
 *   get:
 *     summary: Get all ended sessions for a user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of ended sessions
 *       500:
 *         description: Internal server error
 */

sessionRouter.get("/ended/:userId",userMiddleware,async(req:any,res:any)=>{
  try{
    const userId = req.params.userId;
    const sessions = await client.session.findMany({
      where:{
        userId,
        status:SessionStatus.INACTIVE
      },
      select:{
        id:true,
        title:true,
        description:true,
        slides:{
          select:{
            id:true,
            url:true
          }
        },
        startTime:true,
        endTime:true
      },orderBy:{
        endTime:"desc"
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

/**
 * @swagger
 * /session/{sessionId}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       400:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /session/{sessionId}/start:
 *   put:
 *     summary: Start a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session started successfully
 *       400:
 *         description: Session ID is required
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /session/{sessionId}/end:
 *   put:
 *     summary: End a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session ended successfully
 *       400:
 *         description: Session ID is required
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /session/{sessionId}/slides/upload:
 *   post:
 *     summary: Upload slides to a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pdfUrls
 *             properties:
 *               pdfUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: PDF uploaded successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /session/{sessionId}/slides/images:
 *   get:
 *     summary: Get all slides images for a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of slide images
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /session/{sessionId}/slides:
 *   post:
 *     summary: Add an empty slide to a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Empty slide added successfully
 *       400:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /session/{sessionId}/slides/{slideId}:
 *   delete:
 *     summary: Delete a slide from a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: slideId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slide deleted successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

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

/**
 * @swagger
 * /session/tojoin/{sessionToJoin}:
 *   get:
 *     summary: Join a session using session code
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionToJoin
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */

sessionRouter.get("/session/tojoin/:sessionToJoin", userMiddleware, async(req:any, res:any) => {
  try {
    const sessionCode = req.params.sessionToJoin;
    
    const session = await client.session.findUnique({
      where: {
        secretCode: sessionCode
      },
      select: {
        id: true
      }
    });
    
    if (!session) {
      return res.status(404).json({
        message: "session not found"
      });
    }
    
    res.status(200).json({
      sessionId: session.id
    });
  } catch(error) {
    console.error(error);
    res.status(500).json({
      message: "internal server error"
    });
  }
});

/**
 * @swagger
 * /session/{sessionId}/status:
 *   get:
 *     summary: Get session status
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session status
 *       400:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */

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

const createToken = async (roomname:string,participantname:string,isHost:boolean) => {
  // If this room doesn't exist, it'll be automatically created when the first
  // participant joins
  const roomName = roomname;
  // Identifier to be used for participant.
  // It's available as LocalParticipant.identity with livekit-client SDK
  const participantName = participantname;

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: isHost ? "host" : participantName,
    // Token to expire after 10 minutes
    ttl: '10h',
  });
  at.addGrant({ roomJoin: true, room: roomName,canPublish:true,canPublishData:true });

  return await at.toJwt();
};

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Generate a LiveKit token for room access
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomName
 *               - participantName
 *               - sessionId
 *             properties:
 *               roomName:
 *                 type: string
 *               participantName:
 *                 type: string
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 isHost:
 *                   type: boolean
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */

sessionRouter.post("/token",userMiddleware,async(req:any,res:any)=>{
  try{
    const userId = req.userId;
    const {roomName,participantName,sessionId} = req.body;
    if(!userId){
      return res.status(400).json({
        message:"unauthorized"
      })
    }
    if(!roomName || !participantName || !sessionId){
      return res.status(400).json({
        message:"room name and participant name is required"
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
    const isHost = session.userId === userId;
    const token = await createToken(roomName,participantName,isHost);
    res.status(200).json({
      token,
      isHost
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})  

/**
 * @swagger
 * /session/{sessionId}/recording:
 *   get:
 *     summary: Get session recordings
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session recordings retrieved successfully
 *       400:
 *         description: Session recording not found
 *       500:
 *         description: Internal server error
 */

sessionRouter.get("/session/:sessionId/recording",userMiddleware,async(req:any,res:any)=>{
   try{
    const sessionId = req.params.sessionId;
    const sessionRecording = await client.sessionRecording.findMany({
      where:{
        sessionId
      },
      orderBy:{
        timestamp:"asc"
      }
    })
    if(!sessionRecording){
      console.log("session recording not found")
      return res.status(400).json({
        message:"session recording not found"
      })
    }
    res.status(200).json({
      sessionRecording
    })
   }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
   }
})

/**
 * @swagger
 * /session/{sessionId}/start-recording:
 *   post:
 *     summary: Start recording a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recording started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 egressId:
 *                   type: string
 *       400:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */

sessionRouter.post("/session/:sessionId/start-recording", userMiddleware, async(req:any, res:any) => {
  try {
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

    const output = {
      segments: new SegmentedFileOutput({
        filenamePrefix: `studyhub/recordings/${sessionId}-recording`,
        playlistName: `studyhub/recordings/${sessionId}.m3u8`,
        livePlaylistName: `studyhub/recordings/${sessionId}-live.m3u8`,
        segmentDuration: 5,
        output: {
          case: "s3",
          value: {
            bucket: process.env.BUCKET_NAME,
            accessKey: process.env.ACCESS_KEY_ID,
            secret: process.env.SECRET_ACCESS_KEY,
            region: process.env.REGION,
            forcePathStyle: true
          }
        }
      })
    }

    const response = await egressClient.startRoomCompositeEgress(sessionId, output);
    console.log("response",response)

    return res.status(200).json({
      message: "recording started successfully",
      egressId: response.egressId
    });
  } catch(error) {
    console.error("Recording start error:", error);
    res.status(500).json({
      message:"internal server error"
    });
  }
});

/**
 * @swagger
 * /session/{sessionId}/stop-recording:
 *   post:
 *     summary: Stop recording a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - egressId
 *             properties:
 *               egressId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recording stopped successfully
 *       500:
 *         description: Internal server error
 */

sessionRouter.post("/session/:sessionId/stop-recording",userMiddleware,async(req:any,res:any)=>{
  try{
    const egressId = req.body.egressId;
    console.log("egressId",egressId)
    await egressClient.stopEgress(egressId);
    res.status(200).json({
      message:"recording stopped successfully"
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

