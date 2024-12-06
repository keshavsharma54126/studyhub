import {Router,Request,Response} from "express"

const sessionRouter = Router();

sessionRouter.post("/",(req:Request,res:Response)=>{
  try{
    res.status(200).json({
        message:"session created successfully"
    })
  }catch(error){
    res.status(500).json({
        message:"internal server error"
    })
  }
})

export default sessionRouter;