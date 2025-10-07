import {io,Socket} from "socket.io-client";
import { BACKEND_URL } from "../App";
class SocketService {
    private socket:Socket|null=null;
    private token : string | null = null;

    connect(token: string){
        this.token = token;

        this.socket = io(BACKEND_URL, {
            auth: {
                token: this.token
            }
        });

        this.socket.on("connect", ()=>{
            console.log("Connected to server with socket id:", this.socket?.id);
        });

        this.socket.on("disconnect", (reason)=>{
            console.log("Disconnected from server. Reason:", reason);
        });

        this.socket.on("connect_error", (err)=>{
            console.error("Connection error:", err.message);
        });

        return this.socket;
    }

    disconnect(){
        if(this.socket){
            this.socket.disconnect();
            this.socket = null;
            this.token = null;
        }
    }


    getSocket(){
        return this.socket;
    }

    joinRoom(roomName:string){
        if(this.socket){
            this.socket.emit("join_room", {roomName});
        }
    }

    leaveRoom(roomName:string){
        if(this.socket){
            this.socket.emit("leave_room", {roomName});
        }
    }

    sendMessage(roomName: string,message: string,isGuess:boolean){
        if(this.socket){
            this.socket.emit("message", {roomName,message,isGuess});
        }
    }

    sendDrawingAction(roomName:string,type: string,x:number,y:number,color:string,lineWidth:number,drawing:boolean){
        if(this.socket){
            this.socket.emit("DrawingAction", {roomName,type,x,y,color,lineWidth,drawing});
    }
    }

    startGame(roomName:string){
        if(this.socket){
            this.socket.emit("startGame", {roomName});
        }
    }

    
    





}