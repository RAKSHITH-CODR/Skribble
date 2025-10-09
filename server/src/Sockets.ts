import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

const WORDS_LIST = ["cat", "dog", "house", "car", "tree", "sun", "moon", "book", "phone", "computer"];
const ROUND_TIME = 80; // seconds - match frontend expectation

interface Player {
    userId: string;
    username: string;
    score: number;
    isHost: boolean;
    isDrawing: boolean;
    hasGuessed: boolean;
    socketId: string;
}

interface GameRoom {
    id: string;
    players: Player[];
    currentDrawer: string | null;
    currentWord: string;
    round: number;
    maxRounds: number;
    gameStarted: boolean;
    roundStartTime: number;
    guessedPlayers: string[];
    timeLeft: number;
    roundTimer: NodeJS.Timeout | null;
}

interface DrawingAction {
    roomName: string;
    type: 'draw' | 'clear' | 'undo';
    x?: number;
    y?: number;
    color?: string;
    lineWidth?: number;
    drawing?: boolean;
}

const gameRooms: Record<string, GameRoom> = {};

export function initSocket(server: http.Server) {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] },
        pingInterval: 25000,
        pingTimeout: 60000,
        maxHttpBufferSize: 1e6,
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Unauthorized"));
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as { 
                id: string; 
                username: string; 
            };
            socket.data.userId = decoded.id;
            socket.data.username = decoded.username;
            next();
        } catch (err) {
            return next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.data.username, socket.id);

        // JOIN ROOM - Fixed to match frontend
        socket.on("joinRoom", (data) => {
            const { roomId } = data;
            
            if (!roomId) {
                socket.emit("error", { message: "Room ID is required" });
                return;
            }

            socket.join(roomId);
            
            // Initialize room if it doesn't exist
            if (!gameRooms[roomId]) {
                gameRooms[roomId] = {
                    id: roomId,
                    players: [],
                    currentDrawer: null,
                    currentWord: "",
                    round: 0,
                    maxRounds: 3,
                    gameStarted: false,
                    roundStartTime: 0,
                    guessedPlayers: [],
                    timeLeft: ROUND_TIME,
                    roundTimer: null
                };
            }

            const gameRoom = gameRooms[roomId];
            
            // Check if player already exists
            const existingPlayerIndex = gameRoom.players.findIndex(p => p.userId === socket.data.userId);
            
            if (existingPlayerIndex === -1) {
                // Add new player
                const newPlayer: Player = {
                    userId: socket.data.userId,
                    username: socket.data.username,
                    score: 0,
                    isHost: gameRoom.players.length === 0, // First player is host
                    isDrawing: false,
                    hasGuessed: false,
                    socketId: socket.id
                };
                
                gameRoom.players.push(newPlayer);
                
                // Notify others about new player
                socket.to(roomId).emit("playerJoined", newPlayer);
            } else {
                // Update existing player's socket ID
                gameRoom.players[existingPlayerIndex].socketId = socket.id;
            }

            // Send room info to the joining player
            socket.emit("roomJoined", {
                roomId,
                players: gameRoom.players,
                gameState: gameRoom.gameStarted ? 'playing' : 'waiting',
                currentDrawer: gameRoom.currentDrawer,
                round: gameRoom.round,
                timeLeft: gameRoom.timeLeft
            });

            console.log(`${socket.data.username} joined room ${roomId}`);
        });

        // LEAVE ROOM - Fixed to match frontend
        socket.on("leaveRoom", (data) => {
            const { roomId } = data;
            
            if (!roomId || !gameRooms[roomId]) return;
            
            socket.leave(roomId);
            
            const gameRoom = gameRooms[roomId];
            const playerIndex = gameRoom.players.findIndex(p => p.userId === socket.data.userId);
            
            if (playerIndex !== -1) {
                gameRoom.players.splice(playerIndex, 1);
                
                // Notify others about player leaving
                socket.to(roomId).emit("playerLeft", socket.data.userId);
                
                // If room is empty, clean it up
                if (gameRoom.players.length === 0) {
                    if (gameRoom.roundTimer) {
                        clearTimeout(gameRoom.roundTimer);
                    }
                    delete gameRooms[roomId];
                } else {
                    // If the leaving player was the host, assign new host
                    const wasHost = gameRoom.players.find(p => p.userId === socket.data.userId)?.isHost;
                    if (wasHost && gameRoom.players.length > 0) {
                        gameRoom.players[0].isHost = true;
                    }
                }
            }
            
            console.log(`${socket.data.username} left room ${roomId}`);
        });

        // START GAME - Fixed to match frontend
        socket.on("startGame", (data) => {
            const { roomId } = data;
            
            if (!roomId || !gameRooms[roomId]) {
                socket.emit("error", { message: "Room not found" });
                return;
            }

            const gameRoom = gameRooms[roomId];
            const player = gameRoom.players.find(p => p.userId === socket.data.userId);
            
            if (!player?.isHost) {
                socket.emit("error", { message: "Only host can start the game" });
                return;
            }

            if (gameRoom.players.length < 2) {
                socket.emit("error", { message: "Need at least 2 players to start" });
                return;
            }

            gameRoom.gameStarted = true;
            gameRoom.round = 1;
            gameRoom.currentDrawer = gameRoom.players[0].userId;
            
            // Reset all players
            gameRoom.players.forEach(p => {
                p.score = 0;
                p.isDrawing = false;
                p.hasGuessed = false;
            });

            io.to(roomId).emit("gameStarted", {
                roomId,
                currentDrawer: gameRoom.players.find(p => p.userId === gameRoom.currentDrawer),
                round: gameRoom.round
            });

            startNewRound(io, roomId);
        });

        // DRAWING ACTIONS - Fixed to match frontend
        socket.on("drawingAction", (data: DrawingAction) => {
            const { roomName: roomId } = data;
            
            if (!gameRooms[roomId]) return;
            
            const gameRoom = gameRooms[roomId];
            const player = gameRoom.players.find(p => p.userId === socket.data.userId);
            
            // Only current drawer can draw
            if (gameRoom.currentDrawer !== socket.data.userId) return;
            
            // Broadcast drawing action to all other players in room
            socket.to(roomId).emit("drawingAction", {
                ...data,
                playerId: socket.data.userId
            });
        });

        // SEND MESSAGE - Fixed to match frontend
        socket.on("sendMessage", (data) => {
            const { roomId, message, isGuess } = data;
            
            if (!gameRooms[roomId]) return;
            
            const gameRoom = gameRooms[roomId];
            const player = gameRoom.players.find(p => p.userId === socket.data.userId);
            
            if (!player) return;

            if (isGuess && gameRoom.gameStarted && gameRoom.currentWord) {
                handleGuess(io, socket, roomId, message, gameRoom);
            } else {
                // Regular chat message
                io.to(roomId).emit("messageReceived", {
                    playerId: socket.data.userId,
                    username: socket.data.username,
                    message,
                    timestamp: new Date(),
                    isGuess: false
                });
            }
        });

        // DISCONNECT - Handle cleanup
        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.data.username);
            
            // Find and remove player from all rooms
            Object.keys(gameRooms).forEach(roomId => {
                const gameRoom = gameRooms[roomId];
                const playerIndex = gameRoom.players.findIndex(p => p.socketId === socket.id);
                
                if (playerIndex !== -1) {
                    gameRoom.players.splice(playerIndex, 1);
                    socket.to(roomId).emit("playerLeft", socket.data.userId);
                    
                    // Clean up empty rooms
                    if (gameRoom.players.length === 0) {
                        if (gameRoom.roundTimer) {
                            clearTimeout(gameRoom.roundTimer);
                        }
                        delete gameRooms[roomId];
                    }
                }
            });
        });
    });

    return io;
}

// HELPER FUNCTIONS

function handleGuess(io: Server, socket: any, roomId: string, guess: string, gameRoom: GameRoom) {
    const isCorrect = guess.toLowerCase().trim() === gameRoom.currentWord.toLowerCase();
    const alreadyGuessed = gameRoom.guessedPlayers.includes(socket.data.userId);
    const isDrawer = socket.data.userId === gameRoom.currentDrawer;

    if (isCorrect && !alreadyGuessed && !isDrawer) {
        const points = calculatePoints(gameRoom);
        gameRoom.guessedPlayers.push(socket.data.userId);

        const player = gameRoom.players.find(p => p.userId === socket.data.userId);
        if (player) {
            player.score += points;
            player.hasGuessed = true;
        }

        io.to(roomId).emit("correctGuess", {
            username: socket.data.username,
            points,
            word: gameRoom.currentWord
        });

        // Check if all players have guessed
        const nonDrawerPlayers = gameRoom.players.filter(p => p.userId !== gameRoom.currentDrawer);
        if (gameRoom.guessedPlayers.length === nonDrawerPlayers.length) {
            endRound(io, roomId);
        }
    } else {
        // Wrong guess - send as regular message
        io.to(roomId).emit("messageReceived", {
            playerId: socket.data.userId,
            username: socket.data.username,
            message: guess,
            timestamp: new Date(),
            isGuess: true
        });
    }
}

function startNewRound(io: Server, roomId: string) {
    const gameRoom = gameRooms[roomId];
    if (!gameRoom) return;

    gameRoom.currentWord = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
    gameRoom.roundStartTime = Date.now();
    gameRoom.guessedPlayers = [];
    gameRoom.timeLeft = ROUND_TIME;

    // Reset player states
    gameRoom.players.forEach(p => {
        p.isDrawing = p.userId === gameRoom.currentDrawer;
        p.hasGuessed = false;
    });

    // Send word to current drawer
    const drawerSocket = Array.from(io.sockets.sockets.values()).find(
        s => s.data.userId === gameRoom.currentDrawer
    );
    if (drawerSocket) {
        drawerSocket.emit("yourTurn", { word: gameRoom.currentWord });
    }

    // Notify all players about round start
    io.to(roomId).emit("roundStarted", {
        drawer: gameRoom.players.find(p => p.userId === gameRoom.currentDrawer),
        roundNumber: gameRoom.round,
        wordLength: gameRoom.currentWord.length,
        timeLimit: ROUND_TIME
    });

    // Start countdown timer
    const timer = setInterval(() => {
        gameRoom.timeLeft--;
        io.to(roomId).emit("timeUpdate", { timeLeft: gameRoom.timeLeft });
        
        if (gameRoom.timeLeft <= 0) {
            clearInterval(timer);
            endRound(io, roomId);
        }
    }, 1000);

    gameRoom.roundTimer = timer as any;
}

function endRound(io: Server, roomId: string) {
    const gameRoom = gameRooms[roomId];
    if (!gameRoom) return;

    if (gameRoom.roundTimer) {
        clearTimeout(gameRoom.roundTimer);
        gameRoom.roundTimer = null;
    }

    io.to(roomId).emit("roundEnded", {
        word: gameRoom.currentWord,
        scores: gameRoom.players.map(p => ({ 
            userId: p.userId, 
            username: p.username, 
            score: p.score 
        }))
    });

    if (gameRoom.round < gameRoom.maxRounds) {
        gameRoom.round++;
        
        // Next player becomes drawer
        const currentIndex = gameRoom.players.findIndex(p => p.userId === gameRoom.currentDrawer);
        const nextIndex = (currentIndex + 1) % gameRoom.players.length;
        gameRoom.currentDrawer = gameRoom.players[nextIndex].userId;

        // Start next round after delay
        setTimeout(() => {
            if (gameRooms[roomId]) { // Check if room still exists
                startNewRound(io, roomId);
            }
        }, 5000);
    } else {
        endGame(io, roomId);
    }
}

function endGame(io: Server, roomId: string) {
    const gameRoom = gameRooms[roomId];
    if (!gameRoom) return;

    const winner = gameRoom.players.reduce((prev, current) =>
        prev.score > current.score ? prev : current
    );

    io.to(roomId).emit("gameEnded", {
        winner,
        finalScores: gameRoom.players.map(p => ({ 
            userId: p.userId, 
            username: p.username, 
            score: p.score 
        }))
    });

    // Reset room to waiting state
    gameRoom.gameStarted = false;
    gameRoom.round = 0;
    gameRoom.currentDrawer = null;
    gameRoom.currentWord = "";
    gameRoom.guessedPlayers = [];
    
    gameRoom.players.forEach(p => {
        p.score = 0;
        p.isDrawing = false;
        p.hasGuessed = false;
    });
}

function calculatePoints(gameRoom: GameRoom): number {
    const timeElapsed = (Date.now() - gameRoom.roundStartTime) / 1000;
    const timeBonus = Math.max(0, ROUND_TIME - timeElapsed) * 2;
    const basePoints = 100;
    return Math.floor(basePoints + timeBonus);
}