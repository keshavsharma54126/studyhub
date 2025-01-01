import WebSocket, { WebSocketServer } from "ws";
import { User } from "./user";
import {parse} from "url";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import { Kafka } from "kafkajs";
import client from "@repo/db/client"

const kafka = new Kafka({
  clientId: "session-recorder",
  brokers: [process.env.KAFKA_BROKERS || "kafka:9092" || "localhost:29092"],
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
        console.log("consumer received message",message);
        if(message.value){
          const event = JSON.parse(message.value.toString());
          console.log("received event",message.value);
          const session = await client.session.findUnique({
            where:{
              id:event.sessionId
            }
          })
          if(!session){
            return;
          }
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
       console.log("event consumed and send to database",message.value);
      }
    })
  }catch(error){
    console.error("Error initializing Kafka consumer",error);
    setTimeout(initConsumer,5000);
  }
}

initConsumer();

const cleanupKafka = async()=>{
  try {
    // Disconnect existing connections
    await producer.disconnect();
    await consumer.disconnect();
    await admin.connect();

    // Delete the topic
    await admin.deleteTopics({
      topics: ["session-recorder"],
      timeout: 5000
    });
    await admin.disconnect();
    console.log("kafka topic deleted");

    // Wait a bit to ensure topic is fully deleted
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Recreate the topic with cleanup policy
    await admin.connect();
    await admin.createTopics({
      topics: [{
        topic: "session-recorder",
        numPartitions: 1,
        replicationFactor: 1,
        configEntries: [
          {
            name: "cleanup.policy",
            value: "delete"  // Use delete policy
          },
          {
            name: "retention.ms",
            value: "60000"   // Keep messages for 1 minute
          }
        ]
      }]
    });
    await admin.disconnect();
    console.log("kafka topic recreated with cleanup policy");

    // Reconnect producer and consumer
    await initKafka();
    await initConsumer();
  } catch (error) {
    console.error("Error cleaning up Kafka", error);
    setTimeout(cleanupKafka, 5000);
  }
}
const ws = new WebSocketServer({
  port: 8081,
});


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