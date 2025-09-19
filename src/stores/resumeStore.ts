// store/resumeStore.ts

import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { DropdownResumeItem, Resume } from "~data/types"

const createDropdownItems = (resumes: Resume[]): DropdownResumeItem[] => {
  const items: DropdownResumeItem[] = []

  resumes.forEach((resume) => {
    // Add the regular resume
    items.push({
      id: resume._id,
      name: resume.originalName,
      type: "regular",
      resume: resume
    })

    // Add universal resume if it exists
    if (resume.universalResume) {
      items.push({
        id: resume.universalResume._id,
        name: `${resume.universalResume.originalName} (Universal)`,
        type: "universal",
        resume: resume, // Parent resume data
        universalResume: resume.universalResume
      })
    }
  })

  return items
}

const findInitialItem = (
  items: DropdownResumeItem[]
): DropdownResumeItem | undefined => {
  // First try to find a primary regular resume
  const primary = items.find(
    (item) => item.type === "regular" && item.resume.isPrimary
  )
  if (primary) return primary

  // Otherwise return the first regular resume
  const firstRegular = items.find((item) => item.type === "regular")
  if (firstRegular) return firstRegular

  // Fallback to any item
  return items.length > 0 ? items[0] : undefined
}

type ResumeStoreState = {
  selectedItem: DropdownResumeItem | null
  dropdownItems: DropdownResumeItem[]
  initializeResumes: (resumes: Resume[]) => void
  setSelectedItem: (item: DropdownResumeItem) => void
  getSelectedResume: () => Resume | null
  getSelectedResumeWithCorrectUrl: () => Resume | null
}

export const useResumeStore = create<ResumeStoreState>()(
  persist(
    (set, get) => ({
      selectedItem: null,
      dropdownItems: [],

      initializeResumes: (resumes) => {
        const items = createDropdownItems(resumes)
        const currentState = get()

        // Check if an item is already selected
        const isAlreadySet = currentState.selectedItem !== null

        // Update dropdown items
        set({ dropdownItems: items })

        // Only initialize selection if no item is set and new items are available
        if (!isAlreadySet && items.length > 0) {
          const initialItem = findInitialItem(items)
          if (initialItem) {
            set({ selectedItem: initialItem })
          }
        }
      },

      setSelectedItem: (item) => set({ selectedItem: item }),

      getSelectedResume: () => {
        const state = get()
        return state.selectedItem ? state.selectedItem.resume : null
      },

      getSelectedResumeWithCorrectUrl: () => {
        const state = get()
        if (!state.selectedItem) return null

        const { selectedItem } = state

        // If it's a regular resume, return as is
        if (selectedItem.type === "regular") {
          return selectedItem.resume
        }

        // If it's a universal resume, return parent resume data but with universal resume's URL
        if (selectedItem.type === "universal" && selectedItem.universalResume) {
          return {
            ...selectedItem.resume, // Parent resume data (skills, education, experience, etc.)
            s3Url: selectedItem.universalResume.s3Url, // Universal resume's URL
            originalName: selectedItem.universalResume.originalName, // Universal resume's name
            _id: selectedItem.universalResume._id // Universal resume's ID
          }
        }

        return selectedItem.resume
      }
    }),
    {
      name: "resume-selection-storage",
      partialize: (state) => ({ selectedItem: state.selectedItem })
    }
  )
)
