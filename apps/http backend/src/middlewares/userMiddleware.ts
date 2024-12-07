import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { NextFunction, Request,Response } from "express";

export const userMiddleware = (req: any, res: any, next: any) => {

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(400).json({
      message: "unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      username: string;
      userId:string;
    };
    console.log(decoded)
   if(!decoded.username || !decoded.userId){
    return res.status(400).json({
      message:"unauthorized"
    })
   }
   req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(400).json({
      message: "unauthorized",
    });
  }
};