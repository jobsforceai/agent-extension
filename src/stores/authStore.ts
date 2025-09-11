import { create } from "zustand"

import { useProfileStore } from "./profileStore"

type AuthStoreState = {
  isAuthenticated: boolean
  authToken: string | null
  isInitialized: boolean
  setIsAuthenticated: (auth: boolean) => void
  setAuthToken: (token: string | null) => void
  clearAuth: () => void
  logout: () => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  isAuthenticated: false,
  authToken: null,
  isInitialized: false,

  setIsAuthenticated: (auth: boolean) => set({ isAuthenticated: auth }),

  setAuthToken: (token: string | null) => {
    set({
      authToken: token,
      isAuthenticated: !!token,
      isInitialized: true
    })
  },

  clearAuth: () => {
    chrome.storage.local.remove(["authToken"])
    set({ isAuthenticated: false, authToken: null, isInitialized: true })
  },

  logout: () => {
    chrome.storage.local.remove(["authToken"], () => {
      useProfileStore.getState().clearProfileDetails()
      set({ isAuthenticated: false, authToken: null, isInitialized: true })
    })
  },

  initializeAuth: async () => {
    const state = get()


    // Skip if already initialized
    if (state.isInitialized) {
      return
    }

    try {
      const result = await chrome.storage.local.get(["authToken"])
      const token = result.authToken
      set({
        authToken: token || null,
        isAuthenticated: !!token,
        isInitialized: true
      })
    } catch (error) {
      console.error("Failed to initialize auth:", error)
      set({ isAuthenticated: false, authToken: null, isInitialized: true })
    }
  }
}))

// Listen for storage changes to sync auth state across components
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.authToken) {
    const newToken = changes.authToken.newValue
    useAuthStore.getState().setAuthToken(newToken)
  }
})
