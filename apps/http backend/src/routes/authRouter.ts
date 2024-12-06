import {Router,Request,Response} from "express"

const authRouter = Router();

authRouter.post("/signup",(req:Request,res:Response)=>{
  try{
    res.status(200).json({
        message:"user signed up successfully"
    })
  }catch(error){
    res.status(500).json({
        message:"internal server error"
    })
  }
})

export default authRouter;