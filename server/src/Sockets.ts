import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

const WORDS_LIST = ["cat", "dog", "house", "car", "tree", "sun", "moon", "book", "phone", "computer"];
const ROUND_TIME = 60; // seconds

interface GameRoom {
    players: { userId: string; username: string; score: number }[];
    currentDrawer: string;
    currentWord: string;
    round: number;
    maxRounds: number;
    gameStarted: boolean;
    roundStartTime: number;
    guessedPlayers: string[];
}

const gameRooms: Record<string, GameRoom> = {};

export function initSocket(server: http.Server) {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] },
        pingInterval: 25000,
        pingTimeout: 60000,
        maxHttpBufferSize: 1e6,
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Unauthorized"));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as { id: string; username: string };
            socket.data.userId = decoded.id;
            socket.data.username = decoded.username;
            next();
        } catch (err) {
            return next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.data.username);

        socket.on("joinRoom", (roomName) => {
            socket.join(roomName);
            console.log(`${socket.data.username} joined room ${roomName}`);
            io.to(roomName).emit("notification", `${socket.data.username} joined the room`);
        });

        socket.on("leaveRoom", (roomName) => {
            socket.leave(roomName);
            console.log(`${socket.data.username} left room ${roomName}`);
            io.to(roomName).emit("notification", `${socket.data.username} left the room`);
        });

        // Drawing actions
        socket.on("DrawingAction", (data) => {
            const { roomName, type, x, y, color, lineWidth, drawing } = data;
            socket.to(roomName).emit("DrawingAction", {
                user: socket.data.username,
                type,
                x,
                y,
                color,
                lineWidth,
                drawing,
            });
        });

        // Chat and guessing
        socket.on("message", (data) => {
            const { roomName, message, isGuess } = data;
            const gameRoom = gameRooms[roomName];
            if (!gameRoom) return;

            if (isGuess && gameRoom.currentWord) {
                const isCorrect = message.toLowerCase() === gameRoom.currentWord.toLowerCase();
                const alreadyGuessed = gameRoom.guessedPlayers.includes(socket.data.username);

                if (isCorrect && !alreadyGuessed && socket.data.userId !== gameRoom.currentDrawer) {
                    const points = calculatePoints(gameRoom);
                    gameRoom.guessedPlayers.push(socket.data.username);

                    const player = gameRoom.players.find((p) => p.userId === socket.data.userId);
                    if (player) player.score += points;

                    io.to(roomName).emit("correctGuess", {
                        username: socket.data.username,
                        points,
                        word: gameRoom.currentWord,
                    });

                    if (gameRoom.guessedPlayers.length === gameRoom.players.length - 1) {
                        endRound(io, roomName);
                    }
                } else {
                    io.to(roomName).emit("message", {
                        userId: socket.data.userId,
                        username: socket.data.username,
                        message,
                        isGuess: true,
                        timestamp: Date.now(),
                    });
                }
            } else {
                io.to(roomName).emit("message", {
                    userId: socket.data.userId,
                    username: socket.data.username,
                    message,
                    isGuess: false,
                    timestamp: Date.now(),
                });
            }
        });

        // Start Game
        socket.on("startGame", (roomName) => {
            const room = io.sockets.adapter.rooms.get(roomName);
            console.log(room, io.sockets.adapter);
            if (!room) return;

            const players = Array.from(room)
                .map((socketId) => {
                    const sock = io.sockets.sockets.get(socketId);
                    return sock
                        ? { userId: sock.data.userId, username: sock.data.username, score: 0 }
                        : null;
                })
                .filter(Boolean) as { userId: string; username: string; score: number }[];

            if (!players.length) return;

            gameRooms[roomName] = {
                players,

                //@ts-ignore
                currentDrawer: players[0].userId,
                currentWord: "",
                round: 1,
                maxRounds: 3,
                gameStarted: true,
                roundStartTime: 0,
                guessedPlayers: [],
            };

            startNewRound(io, roomName);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.data.username);
        });
    });

    return io;
}


function startNewRound(io: Server, roomName: string) {
    const gameRoom = gameRooms[roomName];
    if (!gameRoom) return;
//@ts-ignore
    gameRoom.currentWord = WORDS_LIST[Math.floor(Math.random() * WORDS_LIST.length)];
    gameRoom.roundStartTime = Date.now();
    gameRoom.guessedPlayers = [];

    const drawerSocket = Array.from(io.sockets.sockets.values()).find(
        (s) => s.data.userId === gameRoom.currentDrawer
    );
    if (drawerSocket) drawerSocket.emit("yourTurn", { word: gameRoom.currentWord });

    io.to(roomName).emit("roundStart", {
        round: gameRoom.round,
        drawer: gameRoom.players.find((p) => p.userId === gameRoom.currentDrawer)?.username,
        wordLength: gameRoom.currentWord.length,
    });

    setTimeout(() => {
        if (gameRooms[roomName]) endRound(io, roomName);
    }, ROUND_TIME * 1000);
}

function endRound(io: Server, roomName: string) {
    const gameRoom = gameRooms[roomName];
    if (!gameRoom) return;

    io.to(roomName).emit("roundEnd", {
        word: gameRoom.currentWord,
        scores: gameRoom.players,
    });

    if (gameRoom.round < gameRoom.maxRounds) {
        gameRoom.round++;
        const currentIndex = gameRoom.players.findIndex((p) => p.userId === gameRoom.currentDrawer);
        //@ts-ignore
        gameRoom.currentDrawer = gameRoom.players[(currentIndex + 1) % gameRoom.players.length].userId;

        setTimeout(() => startNewRound(io, roomName), 3000);
    } else {
        endGame(io, roomName);
    }
}

function endGame(io: Server, roomName: string) {
    const gameRoom = gameRooms[roomName];
    if (!gameRoom) return;

    const winner = gameRoom.players.reduce((prev, current) =>
        prev.score > current.score ? prev : current
    );

    io.to(roomName).emit("gameEnd", {
        winner,
        finalScores: gameRoom.players,
    });

    delete gameRooms[roomName];
}

function calculatePoints(gameRoom: GameRoom): number {
    const timeElapsed = (Date.now() - gameRoom.roundStartTime) / 1000;
    const timeBonus = Math.max(0, ROUND_TIME - timeElapsed) * 10;
    return Math.floor(100 + timeBonus);
}
