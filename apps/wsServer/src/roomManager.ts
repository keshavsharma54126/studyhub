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

    addUser(user:User){
        this.rooms.set(user.id,user);
    }

    removeUser(user:User){
        this.rooms.delete(user.id);
    }

    broadcast(roomId:string,data:any){
        this.rooms.get(roomId)?.forEach((user:User)=>{
            user.send(data);
        })
    }


}