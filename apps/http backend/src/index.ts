import express from "express";
import {Request,Response} from "express"
import authRouter from "./routes/authRouter"
import sessionRouter from "./routes/sessionRouter"
import cors from "cors"
import userRouter from "./routes/userRouter";
const app = express();

app.use(cors({
  origin:"http://localhost:3000",
  credentials:true
}))

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/sessions",sessionRouter)
app.use("/api/v1/user",userRouter)
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
