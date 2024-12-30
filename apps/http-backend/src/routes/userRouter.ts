import { Request, Response } from "express";
import {Router} from "express";
import client from "@repo/db/client"
import { userMiddleware } from "../middlewares/userMiddleware";

const userRouter = Router()

userRouter.get("/",userMiddleware,async(req:any,res:any)=>{
   try{
    const userId = req.userId;
    if(!userId){
      return res.status(400).json({
        message:"user id is required"
      })
    }
    const user = await client.user.findUnique({
      where:{
        id:userId
      }
    })
    if(!user){
      return res.status(404).json({
        message:"user not found"
      })
    }
    res.status(200).json({
      message:"user fetched successfully",
      user
    })
   }catch(error){
    res.status(500).json({
      message:"internal server error"
    })
   }
})

export default userRouter;
