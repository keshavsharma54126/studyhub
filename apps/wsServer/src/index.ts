import WebSocket, { WebSocketServer } from "ws";
import { User } from "./user";


const ws = new WebSocketServer({
  port: 8081,
});

console.log("web socket server started");

ws.on("connection", (ws: WebSocket) => {
  console.log("user connected");
 
  let user = new User(ws)
  ws.on("error", console.error);
  ws.on("close", () => {
   console.log("user disconnected");
   user.destory()
  });
});
