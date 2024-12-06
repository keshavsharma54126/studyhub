import WebSocket, { WebSocketServer } from "ws";


const ws = new WebSocketServer({
  port: 8081,
});

console.log("web socket server started");

ws.on("connection", (ws: WebSocket) => {
  console.log("user connected");
 

  ws.on("error", console.error);
  ws.on("close", () => {
   console.log("user disconnected");
  });
});
