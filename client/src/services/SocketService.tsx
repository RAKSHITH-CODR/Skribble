import { io,Socket } from "socket.io-client";
import { BACKEND_URL } from "../App";

interface DrawingAction {
    roomName : string;
    type : 'draw' | 'clear' | 'undo';
    x?: number;
    y?: number;
    color?: string;
    lineWidth?: number;
    drawing?: boolean;
}

export interface Player {
    id : string;
    username : string;
    score : number;
    isHost : boolean;
    isDrawing : boolean;
    hasGuessed : boolean;
}

class SocketService {
    private socket: Socket | null = null;
    private token : string | null = null;

    connect(token: string) {
        this.token = token;
        this.socket = io(BACKEND_URL, {
            auth: { token },
            transports: ['websocket'],
        });

     this.socket.on("connect", () => {
            console.log("Connected to server with socket id:", this.socket?.id);
        });

        this.socket.on("disconnect", (reason) => {
            console.log("Disconnected from server. Reason:", reason);
        });

        this.socket.on("connect_error", (err) => {
            console.error("Connection error:", err.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.token = null;
        }
 
    }
    
    getSocket() {
        return this.socket;
    }
    
    joinRoom(roomName: string) {
        if (this.socket) {
            this.socket.emit("joinRoom", roomName);
        }
    }
    
    leaveRoom(roomName: string) {
        if(this.socket){
            this.socket.emit("leaveRoom", roomName);    
        }
    }

    createRoom(roomName: string) {
        if(this.socket){
            this.socket.emit("createRoom", roomName);    
        }
    }

    startGame(roomName: string){
        if(this.socket){
            this.socket.emit("startGame", roomName);    
        }
    }


    sendMessage(roomName: string, message: string, isGuess: boolean = false) {
        if (this.socket) {
            this.socket.emit("send_message", { roomName, message, isGuess });
        }
    }


    sendDrawingAction(action: DrawingAction) {
        if(this.socket){
            this.socket.emit("drawing_action", action);
        }
    }
    

    //Room based events 

    setupRoomListeners(callbacks:{
        onRoomJoined?: (data:{roomName:string,players:Player[]}) => void;
        onPlayerJoined?: (player:Player) => void;
        onPlayerLeft?: (playerId:string) => void;
        onRoomCreated?: (data:{roomName:string}) => void;
        onError?: (message:string) => void;
    }) {
        if(!this.socket) return;
        if(callbacks.onRoomJoined){
            this.socket.on("room_joined", callbacks.onRoomJoined);
        }   
        if(callbacks.onPlayerJoined){
            this.socket.on("player_joined", callbacks.onPlayerJoined);
        }
        if(callbacks.onPlayerLeft){
            this.socket.on("player_left", callbacks.onPlayerLeft);
        }
        if(callbacks.onRoomCreated){
            this.socket.on("room_created", callbacks.onRoomCreated);
        }
        if(callbacks.onError){
            this.socket.on("error", callbacks.onError);
        }
    }



    //Setup Game Listeners onstarted onround ongameend oncorrectguess

    setupGameListeners(callbacks:{
        onGameStarted?: (data:{roomName:string,players:Player[]}) => void;
        onRoundStarted?: (data:{drawer:Player,roundNumber:number,wordLength:number,timeLimit:number}) => void;
        onGameEnded?: (data: { winner: Player, scores: Player[] }) => void;
        onCorrectGuess?: (data:{username:string,points:number,word:string}) => void;
    }) {
        if(!this.socket) return;
        if(callbacks.onGameStarted){
            this.socket.on("game_started", callbacks.onGameStarted);
        }
        if(callbacks.onRoundStarted){
            this.socket.on("round_started", callbacks.onRoundStarted);
        }
        if(callbacks.onGameEnded){
            this.socket.on("game_ended", callbacks.onGameEnded);
        }
        if(callbacks.onCorrectGuess){
            this.socket.on("correctGuess", callbacks.onCorrectGuess);
        }

    }
    
    
       setupDrawingListeners(callbacks: {
        onDrawingAction?: (action: DrawingAction) => void;
        onCanvasCleared?: () => void;
    }) {
        if (!this.socket) return;

        if (callbacks.onDrawingAction) {
            this.socket.on("drawing_action", callbacks.onDrawingAction);
        }
        if (callbacks.onCanvasCleared) {
            this.socket.on("canvas_cleared", callbacks.onCanvasCleared);
        }
    }

    setupChatListeners(callbacks: {
        onMessage?: (data: { player: Player, message: string, timestamp: Date, isGuess: boolean }) => void;
    }) {
        if (!this.socket) return;

        if (callbacks.onMessage) {
            this.socket.on("message_received", callbacks.onMessage);
        }
    }
  removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }



}

export default new SocketService();