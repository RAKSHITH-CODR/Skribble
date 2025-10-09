import { useEffect,useCallback } from "react";
import SocketService from "../services/SocketService";
import { useAuthStore } from "../context/AuthContext";
import { useRoomStore } from "../context/RoomContext";
import type { Player } from "../services/SocketService";
import type {GameState} from "./../context/RoomContext"

export const useSocket = ()=>{
    const {token,user} = useAuthStore();
    const {
        setCurrentRoom,setPlayers,addPlayer,removePlayer,setGameState,setCurrentDrawer,addChatMessage,setTimeLeft,setCurrentWord,setDrawingData,clearDrawingData,clearChatMessages,resetRoom,onPlayerJoined
    }= useRoomStore()


    useEffect(()=>{
        if(token && user){

            const socket = SocketService.connect(token);
            if(!socket) return;

            SocketService.setupRoomListeners({
                onRoomCreated : (data : {roomName:string})=>{
                    console.log("Room created with ID:", data.roomName);
                    SocketService.joinRoom(data.roomName);
                },
                onRoomJoined : (data : {roomName :string, players})=>{
                    console.log("Joined room:", data.roomName);
                    setCurrentRoom(data.roomName);
                    setPlayers(data.players.map(p=>({
                        id : p.id,
                        username : p.username,
                        isHost : p.isHost,  
                        isDrawing : p.isDrawing,
                        score : p.score,
                        hasGuessed : p.hasGuessed,
                    })));

                    if(data.gameState==='playing'){
                        setGameState({
                            state: 'playing',
                            round : data.round,
                            timeLeft : data.timeLeft || 60,
                            currentDrawer : data.currentDrawer,
                            currentWord : data.currentWord,
                            wordLength : data.wordLength,
                            totalRounds : data.totalRounds,
                            timeLimit : data.timeLimit,

                    });

                }

            }
                },
            
            onPlayerJoined : (player )=>{
                console.log("Player joined:", player.username);
                addPlayer({
                    id : player.id,
                    username : player.username,
                    isHost : player.isHost,  
                    isDrawing : player.isDrawing,
                    hasGuessed : player.hasGuessed,
                })
            },
            onPLayerLeft : (playerId)=>{
                console.log("Player left:", playerId);
                removePlayer(playerId);
            }, 

            onError : (message : string)=>{
                console.error("Socket error:", message);
                alert(message);
            },  
            });

            SocketService.setupGameListeners({

                onGameStarted : (data:GameState)=>{
                    console.log("Game started in room:", data.roomName);
                    setGameState({
                       state: 'playing',
                          round : 1,
                          timeLeft : data.timeLeft || 60,

                    })
                }
            )

              SocketService.setupChatListeners({
                onMessage: (data) => {
                    console.log('Message received:', data);
                    addChatMessage({
                        playerId: data.playerId,
                        username: data.username,
                        message: data.message,
                        timestamp: data.timestamp || new Date().toISOString(),
                        isGuess: data.isGuess || false
                    });
                }
            });

             // Setup drawing listeners
            SocketService.setupDrawingListeners({
                onDrawingAction: (action) => {
                    console.log('Drawing action received:', action);
                    setDrawingData(action);
                },
                onCanvasCleared: () => {
                    console.log('Canvas cleared');
                    setDrawingData({ type: 'clear' });
                }
            });
              return () => {
                console.log('Cleaning up socket listeners');
                SocketService.removeAllListeners();
                SocketService.disconnect();
            };

        }
    }

},[token,user]);



    // Socket actions
    const joinRoom = useCallback((roomId: string) => {
        console.log('Joining room:', roomId);
        socketService.joinRoom(roomId);
    }, []);

    const leaveRoom = useCallback((roomId: string) => {
        console.log('Leaving room:', roomId);
        socketService.leaveRoom(roomId);
        setCurrentRoom(null);
        setPlayers([]);
    }, []);

    const startGame = useCallback((roomId: string) => {
        console.log('Starting game in room:', roomId);
        socketService.startGame(roomId);
    }, []);

    const sendMessage = useCallback((roomId: string, message: string, isGuess: boolean = false) => {
        console.log('Sending message:', { roomId, message, isGuess });
        socketService.sendMessage(roomId, message, isGuess);
    }, []);

    const sendDrawingAction = useCallback((action: any) => {
        console.log('Sending drawing action:', action);
        socketService.sendDrawingAction(action);
    }, []);

    return {
        joinRoom,
        leaveRoom,
        startGame,
        sendMessage,
        sendDrawingAction,
        socket: socketService.getSocket()
    };
};