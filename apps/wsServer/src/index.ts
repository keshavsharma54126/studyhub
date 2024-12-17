import WebSocket, { WebSocketServer } from "ws";
import { User } from "./user";
import {parse} from "url";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
const ws = new WebSocketServer({
  port: 8081,
});

console.log("web socket server started");

ws.on("connection", (ws: WebSocket,request) => {
 try{
  console.log("user connected");
  const {query} = parse(request.url||"",true);
  const token = query.token as string;

  const decoded = jwt.verify(token,JWT_SECRET);
  if(!decoded){
    throw new Error("Invalid Token");
  }

  const {userId,username} = decoded as any;
  
  let user = new User(ws,userId,username)
  ws.on("error", console.error);
  ws.on("close", () => {
   console.log("user disconnected");
   user.destory()
  });
 }catch(err){
  console.log(err);
  ws.close(1008,"Authentication Error");
 }
});
