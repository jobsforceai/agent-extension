import { create } from "zustand";
import { persist } from "zustand/middleware";

type ProfileState = {
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  clearAuthToken: () => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      authToken: null,
      setAuthToken: (token) => set({ authToken: token }),
      clearAuthToken: () => set({ authToken: null }),
    }),
    {
      name: "auth-storage", // key in localStorage
    }
  )
);