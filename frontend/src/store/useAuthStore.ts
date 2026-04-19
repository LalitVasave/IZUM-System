import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name?: string;
  email: string;
  role: 'student' | 'driver' | 'admin';
}


interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => {
        set({ token, user });
      },

      clearAuth: () => {
        set({ token: null, user: null });
      },

      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: 'izum-auth', // key in localStorage
    }
  )
);

export default useAuthStore;
