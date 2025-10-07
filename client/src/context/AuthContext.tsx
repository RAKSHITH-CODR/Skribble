import { persist } from 'zustand/middleware';
import { create } from 'zustand';
import axios from 'axios';


interface User {
    id: string
    username: string
    email: string
    highestScore?: number
    totalGames?: number
    totalWins?: number
    photoUrl?: string
}


interface AuthState {
    token: string | null;
    user: User | null;
    setToken: (token: string | null) => void;
    setUser: (user: User | null) => void;
    isLoading: boolean;
    error: string | null;

    login: (credentials: { username: string, password: string }) => Promise<{ token: string, user: User } | void>;
    register: (credentials: { username: string, email: string, password: string }) => Promise<void>;
    logout: () => void;
}

const Api_Base = "http://localhost:3000/api/auth"


export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        login: async (credentials) => {
            set({ isLoading: true, error: null });

            try {
                const response = await axios.post(`${Api_Base}/login`, {
                    username: credentials.username,
                    password: credentials.password
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                const { token, user } = response.data;
                set({ token, user:user.user, isLoading: false });

                return { token, user:user.user };
            } catch (error) {
                set({ error: 'Login failed. Please try again.', isLoading: false });
            }
        },

        register: async (credentials) => {
            set({ isLoading: true, error: null });

            try {
                const response = await axios.post(`${Api_Base}/signup`, {
                    username: credentials.username,
                    email: credentials.email,
                    password: credentials.password
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                const { token, user } = response.data;
                set({ token, user:user.user, isLoading: false });
            } catch (error) {
                set({ error: 'Registration failed. Please try again.', isLoading: false });
            }
        },

        logout: () => {
            set({ token: null, user: null });
        },

        setToken: (token) => set({ token }),
        setUser: (user) => set({ user }),

    }), {
        name: 'auth-storage',
        skipHydration: true,
        partialize: (state) => ({ token: state.token, user: state.user }),

    })
)
