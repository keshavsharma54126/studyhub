type WebSocketHandlers = {
    onConnect?:()=>void;
    onDisconnect?:()=>void;
    onAdminJoined?:(message:any)=>void;
    onUserJoined?:(message:any)=>void;
    onStrokeReceived?:(message:any)=>void;
    onClearReceived?:(message:any)=>void;
    onChatMessageReceived?:(message:any)=>void;
    onSlideChangeReceived?:(message:any)=>void;
    onError?:(error:any)=>void;
}

export class RoomWebSocket{
    private ws:WebSocket|null = null;
    private handlers:WebSocketHandlers={};
    private url:string;
    private debug:boolean = false;
    private reconnectAttempts:number = 0;
    private maxReconnectAttempts:number = 10;

    constructor(url:string,debug:boolean=false){
        this.url = url;
        this.debug = debug;
    }

    connect(sessionId:string):Promise<void>{
        return new Promise((resolve,reject)=>{
            try{
                this.log("Connecting to WebSocketServer...");
                this.ws  = new WebSocket(this.url)

                this.ws.onopen = ()=>{
                    this.log("Connected to WebSocketServer");
                    this.handlers.onConnect?.();
                    
                    const joinMessage = {
                        type:"JOIN_SESSION",
                        sessionId
                    }
                    this.log("Sending JOIN_SESSION message to WebSocketServer");
                    this.send(JSON.stringify(joinMessage));
                    resolve()
                }
                this.ws.onclose = ()=>{
                    this.log("Disconnected from WebSocketServer");
                    this.handlers.onDisconnect?.();

                    if(this.ws?.readyState !== WebSocket.OPEN){
                        this.log("WebSocket connection closed unexpectedly");
                        this.attemptReconnect(sessionId)
                    }
                }

                this.ws.onerror = (error)=>{
                    this.log("WebSocket error:",error);
                    this.handlers.onError?.(error);
                }

                this.ws.onmessage = (event)=>{
                   try{
                    const data = JSON.parse(event.data);
                    this.log("Received message:",data);
                    this.handleMessage(event)
                   }catch(error){
                    this.log("Error parsing message:",error);
                    this.handlers.onError?.(error);
                   }
                }
            }catch(error){
                this.log("Error connecting to WebSocketServer:",error);
                reject(error);
            }


        })
    }

    public close(){
        if(this.ws){
            this.ws.close();
            this.ws = null
        }
    }

    private handleMessage(message:MessageEvent){
       try{
        const parsedMessage = JSON.parse(message.data);
        this.log("parsed message",message)
        switch(parsedMessage.type){
            case "ADMIN_SUBSCRIBED":
                console.log("admin subscribed",parsedMessage);
                this.handlers.onAdminJoined?.(parsedMessage);
                break;
            case "USER_SUBSCRIBED":
                console.log("user subscribed",parsedMessage);
                this.handlers.onUserJoined?.(parsedMessage);
                break;
            case "STROKE_SENT":
                console.log("stroke sent",parsedMessage);
                this.handlers.onStrokeReceived?.(parsedMessage);
                break;
            case "CLEAR_SENT":
                console.log("clear sent",parsedMessage);
                this.handlers.onClearReceived?.(parsedMessage);
                break;
            case "CHAT_MESSAGE_SENT":
                console.log("chat message sent",parsedMessage);
                this.handlers.onChatMessageReceived?.(parsedMessage);
                break;
            case "SLIDE_CHANGE_SENT":
                console.log("slide change sent",parsedMessage);
                this.handlers.onSlideChangeReceived?.(parsedMessage);
                break;
            default:
                this.log("Unknown message type:",parsedMessage.type);
                break;
        }
        
       }catch(error){
        this.log("Error parsing message:",error);
        this.handlers.onError?.(error);
       }
    }

    private attemptReconnect(sessionId:string) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.log(`Attempting to reconnect... ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            setTimeout(() => {
                this.connect(sessionId).catch(console.error);
            }, 1000 * this.reconnectAttempts); // Exponential backoff
        }
    }

    public send(message: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.log("Sending message:", message);
            this.ws.send(message);
        } else {
            this.log("Cannot send message - WebSocket not open, state:", this.ws?.readyState);
        }
    }

    public setHandlers(handlers:WebSocketHandlers){
        this.handlers = {...this.handlers,...handlers}
    }

    private log(...args:any[]){
        if(this.debug){
            console.log(...args);
        }
    }
}