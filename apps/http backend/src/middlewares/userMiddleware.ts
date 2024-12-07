import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export const userMiddleware = (req: any, res: any, next: any) => {

  const token = req.cookies.Authentication
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
   req.user = {
      id: decoded.userId,
    };
    next();
  } catch (error) {
    return res.status(400).json({
      message: "unauthorized",
    });
  }
};