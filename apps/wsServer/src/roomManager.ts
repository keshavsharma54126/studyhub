import { User } from "./user";

export class RoomManager{
    private rooms:Map<string,User[]> = new Map();
    static instance:RoomManager;

    private constructor(){
        this.rooms = new Map();
    }

    static getInstance(){
        if(!RoomManager.instance){
            RoomManager.instance = new RoomManager();
        }
        return RoomManager.instance;
    }

    addUser(user:User,sessionId:string){
        if(!this.rooms.has(sessionId)){
            this.rooms.set(sessionId,[user])
            return;
        }
        this.rooms.set(sessionId,[...(this.rooms.get(sessionId)?.filter((u)=>u.userId!==user.userId)??[]),user]);
    }

    public removeUser(sessionId:string,user:User){
        if(!this.rooms.has(sessionId)){
            return
        }
        this.rooms.set(sessionId,[...(this.rooms.get(sessionId)?.filter((u)=>u.userId!== user.userId)??[])]);
    }

    broadcast(sessionId:string,user:User,message:any){
        if(!this.rooms.has(sessionId)){
            
            return;
        }
        this.rooms.get(sessionId)?.forEach((u)=>{
            if(u.userId!==user.userId){
                u.send(message);
            }
        })
    }


}