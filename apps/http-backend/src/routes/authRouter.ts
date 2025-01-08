import {Router,Request,Response} from "express"
import * as dotenv from 'dotenv'
dotenv.config()
import client from "@repo/db/client"
import {signinSchema, signupSchema} from "../types/types"
import * as bcrypt from "bcryptjs"
import { JWT_SECRET } from "../config";
import * as jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library";
import { google } from 'googleapis'

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 * 
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *   
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication information is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 */

const authRouter = Router();

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
authRouter.post("/signup", async (req: Request, res: Response): Promise<any> => {
  try {
    const parsedData = signupSchema.safeParse(req.body);
    if(!parsedData.success){
      return res.status(400).json({
        message:"invalid Input"
      })
    }
    const {email,password,username} = req.body;
    
    const hashedPassword = await bcrypt.hash(password,10);

    const existingUser = await client.user.findUnique({
      where:{
        email
      }
    })
    if(existingUser){
      return res.status(409).json({
        message:"user already exists"
      })
    }

    const user = await client.user.create({
      data:{
        email,
        password:hashedPassword,
        username
      }
    })
    res.status(201).json({
        message:"user created successfully",
        userId:user.id,
        email:user.email
    })
  }catch(error){
    res.status(500).json({
        message:"internal server error",
        error:error
    })
  }
})

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: Authenticate existing user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
authRouter.post("/signin",async(req:Request,res:Response):Promise<any>=>{
  try{
    const parsedData = signinSchema.safeParse(req.body);
    if(!parsedData.success){
      return res.status(400).json({
        message:"invalid Input"
      })
    }
    const{email,password} = req.body; 
    if(!email || !password){
      return res.status(400).json({
        message:"Bad Request"
      })
    }
    const existingUser = await client.user.findUnique({
      where:{
        email,
      }
    })
    if(!existingUser){
      return res.status(401).json({
        message:"user not found"
      })
    }
    const isPasswordValid = await bcrypt.compare(password,existingUser.password);
    if(!isPasswordValid){
      return res.status(401).json({
        message:"invalid password"
      })
    }
    const token = await jwt.sign(
      {
        userId:existingUser.id,
        username:existingUser.username
      },
      JWT_SECRET,
      {
        expiresIn:"10h"
      }
    )
    res.status(200).json({
      message:"user signed in successfully",
      token:token,
      userId:existingUser.id,
    })

  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

const googleClientId = process.env.GOOGLE_CLIENT_ID ?? '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI ?? '';


if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
  throw new Error('Missing required Google OAuth environment variables');
}

const oauth2Client = new OAuth2Client(googleClientId, googleClientSecret, googleRedirectUri);

/**
 * @swagger
 * /google/url:
 *   get:
 *     summary: Get Google OAuth2 authentication URL
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Successfully generated Google auth URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 url:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: Failed to generate auth URL
 *       500:
 *         description: Internal server error
 */
authRouter.get("/google/url",async(req:Request,res:Response):Promise<any>=>{
  try{
    const authUrl = oauth2Client.generateAuthUrl({
      access_type:"offline",
      scope:["https://www.googleapis.com/auth/userinfo.email","https://www.googleapis.com/auth/userinfo.profile",],
      prompt:"consent",
      include_granted_scopes:true,
      response_type:"code"
    })
    console.log(authUrl);
    if(!authUrl){
      return res.status(400).json({
        message:"failed to generate auth url"
      })
    }
    res.status(200).json({
      message:"google auth url",
      url:authUrl
    })
  }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
  }
})

/**
 * @swagger
 * /google/callback:
 *   get:
 *     summary: Handle Google OAuth2 callback
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: The authorization code from Google
 *     responses:
 *       302:
 *         description: Redirects to frontend with authentication token
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             description: URL to redirect to
 *       400:
 *         description: Failed to get user info
 *       500:
 *         description: Authentication failed
 */
authRouter.get("/google/callback", async(req: Request, res: Response): Promise<any> => {
  try {
    const code = req.query.code as string;
    const {tokens} = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2"
    });
    
    const userInfo = await oauth2.userinfo.get();
    if (!userInfo.data.email) {
      return res.redirect(`${process.env.FRONTEND_URL}/signin?error=failed_to_get_user_info`);
    }

    const user = await client.user.findUnique({
      where: {
        email: userInfo.data.email
      }
    });

    let token;
    if (user) {
      await client.user.update({
        where: { id: user.id },
        data: {
          profilePicture: userInfo.data.picture || ""
        }
      });
      
      token = await jwt.sign({
        userId: user.id,
        username: user.username
      }, JWT_SECRET, {
        expiresIn: "10h"
      });
    } else {
      const newUser = await client.user.create({
        data: {
          email: userInfo.data.email,
          username: userInfo.data.name || "",
          googleId: userInfo.data.id,
          password: "",
          profilePicture: userInfo.data.picture || ""
        }
      });
      token = await jwt.sign({
        userId: newUser.id,
        username: newUser.username
      }, JWT_SECRET, {
        expiresIn: "10h"
      });
    }

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/signin?error=authentication_failed`);
  }
});

export default authRouter;
