import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Player {
    id: string;
    username: string;
    isHost: boolean;
    isDrawing: boolean;
    hasGuessed: boolean;
}

interface ChatMessage {
    playerId: string;
    username: string;
    message: string;
    timestamp: string;
    isGuess: boolean;
    isSystem?: boolean;
}

interface GameState {
    state: 'waiting' | 'playing' | 'ended';
    currentDrawer: Player | null;
    currentWord: string | null;
    wordLength: number;
    round: number;
    totalRounds: number;
    timeLimit: number;
    timeLeft: number;
}

interface RoomState {
    currentRoom: string | null;
    players: Player[];
    chatMessages: ChatMessage[];
    gameState: GameState;
    drawingData: any

    setCurrentRoom: (roomId: string | null) => void;
    setPlayers: (players: Player[]) => void;
    addPlayer: (player: Player) => void;
    removePlayer: (playerId: string) => void;
    updatePlayer: (playerId: string, updatedInfo: Partial<Player>) => void;


    setGameState: (gameState: GameState) => void;
    setCurrentDrawer: (drawer: Player | null) => void;
    setCurrentWord: (word: string | null) => void;
    setTimeLeft: (timeLeft: number) => void;
    onPlayerJoined: (player: Player) => void;


    addChatMessage: (message: ChatMessage) => void;
    clearChatMessages: () => void;

    setDrawingData: (data: any) => void;
    clearDrawingData: () => void;

    resetRoom: () => void;
}

export const initialGameState: GameState = {
    state: 'waiting',
    currentDrawer: null,
    currentWord: null,
    wordLength: 0,
    round: 0,
    totalRounds: 5,
    timeLimit: 60,
    timeLeft: 60
}

export const useRoomStore = create<RoomState>()(
    persist((set, get) => ({
        currentRoom: null,
        players: [],
        chatMessages: [],
        gameState: initialGameState,
        drawingData: [],

        setCurrentRoom: (roomId) => set({ currentRoom: roomId }),

        setPlayers: (players) => set({ players }),


        addPlayer: (player) => set((state) => ({
            players: [...state.players, player]
        })),

        removePlayer: (playerId) => set((state) => ({
            players: state.players.filter(p => p.id !== playerId)
        })),

        updatePlayer: (playerId, updates) => set((state) => ({
            players: state.players.map(p => p.id === playerId ? { ...p, ...updates } : p)
        })),

        setGameState: (newGameState) => set((state) => ({
            gameState: { ...state.gameState, ...newGameState }
        })),

        setCurrentDrawer: (player) => set((state) => ({
            gameState: { ...state.gameState, currentDrawer: player }
        })),

        setCurrentWord: (word, wordLength = 0) => set((state) => ({
            gameState: {
                ...state.gameState,
                currentWord: word,
                wordLength: wordLength
            }
        })),

        setTimeLeft: (time) => set((state) => ({
            gameState: { ...state.gameState, timeLeft: time }
        })),

        addChatMessage: (message) => set((state) => ({
            chatMessages: [...state.chatMessages, message]
        })),

        clearChatMessages: () => set({ chatMessages: [] }),

        setDrawingData: (data) => set((state) => ({
            drawingData: [...state.drawingData, data]
        })),

        clearDrawingData: () => set({ drawingData: [] }),
         onPlayerJoined(player) {
             const existingPlayer = get().players.find(p => p.id === player.id);
             if (!existingPlayer) {
                 get().addPlayer(player);
             } else {
                    get().updatePlayer(player.id, player);
             }
         },
        resetRoom: () => set({
            currentRoom: null,
            players: [],
            gameState: initialGameState,
            chatMessages: [],
            drawingData: []
        })
    }),

        {
            name: 'room-storage',
            skipHydration: true,
            partialize: (state) => ({
                currentRoom: state.currentRoom,
            })
        }
    )
);