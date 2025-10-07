import {create} from 'zustand'
import axios from 'axios'
import { BACKEND_URL } from '../App';


interface Room {
    _id : string;
    roomName : string;  
    ownerName : string;
    isPrivate : boolean;
    maxPLayers : number;
    players : string[];
    gameMode : string;
}

interface RoomState {
    rooms : Room[];
    currentRoom : Room | null;  
    isLoading : boolean;
    error : string | null;

    fetchRooms : () => Promise<void>;
    createRoom : (roomData: { roomName: string; ownerName: string; isPrivate: boolean; maxPLayers: number; gameMode: string }) => Promise<void>;
    joinRoom : (roomName: string) => Promise<void>;
    leaveRoom : (roomId: string, username: string) => Promise<void>;
}

const Api_Base = BACKEND_URL + "/api/rooms"
export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,

  fetchRooms: async () => {
    set({ isLoading: true })
    try {
      const res = await axios.get(Api_Base)
      set({ rooms: res.data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  createRoom: async (roomData) => {
    set({ isLoading: true })
    try {
      const res = await axios.post(Api_Base, roomData)
      set((state) => ({
        rooms: [...state.rooms, res.data],
        currentRoom: res.data,
        isLoading: false,
      }))
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  joinRoom: async (roomName) => {
    set({ isLoading: true })
    try {
      const res = await axios.post(`${Api_Base}/join`, { roomName })
      set({ currentRoom: res.data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  leaveRoom: async (roomId, username) => {
    set({ isLoading: true })
    try {
      await axios.post(`${Api_Base}/leave`, { roomId, username })
      set({ currentRoom: null, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },
}))
