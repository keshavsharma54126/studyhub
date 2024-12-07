import {Router,Request,Response} from "express"
import client from "@repo/db/client"
import {signinSchema, signupSchema} from "../types/types"
import * as bcrypt from "bcryptjs"
import { JWT_SECRET } from "../config";
import * as jwt from "jsonwebtoken"
const authRouter = Router();

authRouter.post("/signup", async (req: Request, res: Response): Promise<any> => {
  try {
    const parsedData = signupSchema.safeParse(req.body);
    if(!parsedData.success){
      return res.status(400).json({
        message:"invalid Input"
      })
    }
    const {email,passowrd,username} = req.body;
    
    const hashedPassword = await bcrypt.hash(passowrd,10);

    const existingUser = await client.users.findUnique({
      where:{
        email
      }
    })
    if(existingUser){
      return res.status(409).json({
        message:"user already exists"
      })
    }

    const user = await client.users.create({
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
        message:"internal server error"
    })
  }
})

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
    const existingUser = await client.users.findUnique({
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
export default authRouter;
