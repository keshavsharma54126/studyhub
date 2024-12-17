import { WebSocket } from "ws";
function getRandomId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

export class User{
    public id:string;
    public userId?:string;
    public ws:WebSocket;
    public x:number;
    public y:number;
    public roomId?:string;
    public isHost?:boolean;

    constructor(ws:WebSocket){
        this.id = getRandomId(); 
        this.ws = ws;
        this.x = 0;
        this.y = 0;
    }

    initHandler(){
        this.ws.on("message",(data:any)=>{
            console.log(data);
        })
    }

    destory(){
        this.ws.close();
    }

    send(data:any){
        this.ws.send(JSON.stringify(data));
    }
}