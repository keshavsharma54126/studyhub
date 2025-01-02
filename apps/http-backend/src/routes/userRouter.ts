import { Request, Response } from "express";
import {Router} from "express";
import client from "@repo/db/client"
import { userMiddleware } from "../middlewares/userMiddleware";

const userRouter = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 * 
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         username:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "user fetched successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
