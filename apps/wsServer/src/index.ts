import WebSocket, { WebSocketServer } from "ws";
import { User } from "./user";
import {parse} from "url";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { Kafka } from "kafkajs";
import client from "@repo/db/client"

const kafka = new Kafka({
  clientId: "session-recorder",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const admin = kafka.admin();

async function initKafka(){
  try{
    await producer.connect();
    console.log("kafka producer connected")
  }catch(error){
    console.error("Error initializing Kafka",error);
    setTimeout(initKafka,5000);
  }
}

initKafka();

const consumer = kafka.consumer({groupId:"session-recorder-group"});

async function initConsumer(){
  try{
    await consumer.connect();
    console.log("kafka consumer connected")
    await consumer.subscribe({topic:"session-recorder"})
    await consumer.run({
      eachMessage:async ({message})=>{
        if(message.value){
          const event = JSON.parse(message.value.toString());
          console.log("received event",event);
          await client.sessionRecording.create({
            data:{
              sessionId:event.sessionId,
              userId:event.userId,
              eventType:event.type,
              eventData:event.payload,
              timestamp:event.timestamp,
            }
          })
        }
       
      }
    })
  }catch(error){
    console.error("Error initializing Kafka consumer",error);
    setTimeout(initConsumer,5000);
  }
}

initConsumer();

const cleanupKafka = async()=>{
  try{
    await producer.disconnect();
    await consumer.disconnect();

    await admin.connect()
    await admin.deleteTopics({topics:["session-recorder"],timeout:5000})
    await admin.disconnect()
    console.log("kafka cleanup completed")

    await admin.createTopics({
      topics:[{
        topic:"session-recorder",
        numPartitions:1,
        replicationFactor:1
      }]
    })
    await admin.disconnect()
    console.log("kafka cleanup completed")
  }catch(error){
    console.error("Error cleaning up Kafka",error);
    setTimeout(cleanupKafka,5000);
  }
}
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
  
  let user = new User(ws,userId,username,producer)
  if(user){
    console.log("user websocket created")
  }
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

process.on("SIGINT",()=>{
  console.log("received SIGINT signal");
  cleanupKafka();
  process.exit(0);
})

process.on("SIGTERM",()=>{
  console.log("received SIGTERM signal");
  cleanupKafka();
  process.exit(0);
})