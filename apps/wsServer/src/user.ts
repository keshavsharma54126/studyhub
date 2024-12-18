import { WebSocket } from "ws";
import client from "@repo/db/client";
import { RoomManager } from "./roomManager";

export class User{
    public userId?:string;
    public username?:string;
    public ws:WebSocket;
    public x:number;
    public y:number;
    public isHost?:boolean;

    constructor(ws:WebSocket,userId:string,username:string){
        this.ws = ws;
        this.x = 0;
        this.y = 0;
        this.userId = userId;
        this.username = username;
        this.initHandler();
    }

    initHandler(){
        this.ws.on("message",async (data:any)=>{
            const message = JSON.parse(data)
            console.log("message received",message);
            switch(message.type){
                case "SUBSCRIBE_ADMIN":
                    console.log("subscribe admin received",message);
                    const adminsessionId = message.payload.sessionId;
                    const adminsession = await client.session.findUnique({
                        where:{
                            id:adminsessionId
                        }
                    })
                    if(!adminsession){
                        this.ws.close(1008,"Session not found");
                        return;
                    }

                    if(adminsession.userId!==this.userId){
                        this.ws.close(1008,"User is not host");
                        return;
                    }
                    this.isHost = true;
                    RoomManager.getInstance().addUser(this,adminsessionId);
                    RoomManager.getInstance().broadcast(adminsessionId,this,{
                        sessionId:adminsessionId,
                        type:"ADMIN_SUBSCRIBED",
                        payload:{
                            message:"Admin subscribed to session",
                            userId:this.userId
                        }
                    });
                    break;

                case "SUBSCRIBE_USER":
                    console.log("subscribe user received",message);
                    const userSessionId = message.payload.sessionId;
                    const userSession = await client.session.findUnique({
                        where:{
                            id:userSessionId
                        }
                    })

                    if(!userSession){
                        this.ws.close(1008,"Session not found");
                        return;
                    }
                    this.isHost = false;
                    RoomManager.getInstance().addUser(this,userSessionId);
                    RoomManager.getInstance().broadcast(userSessionId,this,{
                        sessionId:userSessionId,
                        type:"USER_SUBSCRIBED",
                        payload:{
                            message:"User subscribed to session",
                            userId:this.userId
                        }
                    });
                    break;

                case "STROKE":
                    console.log("stroke received",message);
                    const strokeSessionId = message.payload.sessionId;
                    if(this.isHost){
                        RoomManager.getInstance().broadcast(strokeSessionId,this,{
                            sessionId:strokeSessionId,
                            type:"STROKE_RECEIVED",
                            payload:message.payload
                        });
                    }
                    break;

                case "CLEAR":
                    console.log("clear received",message);
                    const clearSessionId = message.payload.sessionId;
                    if(this.isHost){
                        RoomManager.getInstance().broadcast(clearSessionId,this,{
                            sessionId:clearSessionId,
                            type:"CLEAR_RECEIVED",
                            payload:{
                            message:"Admin cleared the canvas",
                            userId:this.userId
                        }
                    });
                    }
                    break;

                case "SLIDE_CHANGE":
                    console.log("slide change received",message);
                    const slideChangeSessionId = message.payload.sessionId;
                    if(this.isHost){
                        RoomManager.getInstance().broadcast(slideChangeSessionId,this,{
                            sessionId:slideChangeSessionId,
                            type:"SLIDE_CHANGE_RECEIVED",
                            payload:message.payload
                        });
                    }
                    break;

                case "CHAT_MESSAGE":
                    console.log("chat message sent")
                    const chatSessionId = message.payload.sessionId;
                    RoomManager.getInstance().broadcast(chatSessionId,this,{
                        sessionId:chatSessionId,
                        type:"CHAT_MESSAGE_RECEIVED",
                        payload:message.payload
                    });
                    break;

            }
        })
    }

    destory(){
        this.ws.close();
    }

    send(data:any){
        this.ws.send(JSON.stringify(data));
    }
}