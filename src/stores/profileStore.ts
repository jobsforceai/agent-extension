import axios from "axios"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { UserData } from "~data/types"
import { profileAPI } from "~services/api"


type ProfileState = {
  profileDetails: UserData | null
  statusDetails: any | null
  loading: boolean
  error: string | null
  setProfileDetails: (data: UserData) => void
  fetchProfile: () => Promise<void>
  fetchStatusDetails: () => Promise<void>
  clearProfileDetails: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchProfileIfNeeded: () => Promise<void>
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profileDetails: null,
      statusDetails: null,
      loading: false,
      error: null,
      setProfileDetails: (data) => set({ profileDetails: data, error: null }),
      clearProfileDetails: () => set({ profileDetails: null }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Fetch methods
      fetchProfile: async () => {
        try {
          set({ loading: true, error: null })

          const profileDetails = await profileAPI.getProfile()

          set((state) => ({ ...state, profileDetails, loading: false }))

          console.log("Profile data fetched successfully:", profileDetails)
        } catch (error) {
          console.error("Error fetching profile data:", error)

          let errorMessage = "Unknown error occurred"

          if (axios.isAxiosError(error)) {
            if (error.code === "ECONNABORTED") {
              errorMessage = "Request timeout - please check your connection"
            } else if (error.response) {
              errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`
            } else if (error.request) {
              errorMessage = "Network error - unable to reach server"
            } else {
              errorMessage = `Request error: ${error.message}`
            }
          } else {
            errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred"
          }

          set({ error: errorMessage, loading: false })
        }
      },
      fetchStatusDetails: async () => {
        try {
          set({ loading: true, error: null })

          const statusDetails = await profileAPI.getStatus()

          set((state) => ({ ...state, statusDetails, loading: false }))

          console.log(
            "Form filled status fetched succesffully: ",
            statusDetails
          )
        } catch (error) {
          console.error("Error fetching profile data:", error)
          set({ error: error, loading: false })
        }
      },
      fetchProfileIfNeeded: async () => {
        const state = get()

        // If we already have profile data, don't fetch again
        if (state.profileDetails) {
          return
        }

        try {
          set({ loading: true, error: null })

          // Use the API service
          const finalUserProfileData = await profileAPI.getProfile()
          console.log("finalUserProfileData: ", finalUserProfileData)

          set((state) => ({
            ...state,
            profileDetails: finalUserProfileData,
            loading: false
          }))
        } catch (error) {
          console.error("Error fetching profile data:", error)

          let errorMessage = "Unknown error occurred"

          if (axios.isAxiosError(error)) {
            if (error.code === "ECONNABORTED") {
              errorMessage = "Request timeout - please check your connection"
            } else if (error.response) {
              errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`
            } else if (error.request) {
              errorMessage = "Network error - unable to reach server"
            } else {
              errorMessage = `Request error: ${error.message}`
            }
          } else {
            errorMessage =
              error instanceof Error ? error.message : "Unknown error occurred"
          }

          set({ error: errorMessage, loading: false })
        }
      }
    }),
    {
      name: "profile-storage", // key in localStorage
      partialize: (state) => ({ profileDetails: state.profileDetails }) // only persist profile data, not loading/error states
    }
  )
)
