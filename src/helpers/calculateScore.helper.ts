import Fuse from "fuse.js"

import { useProfileStore } from "~stores/profileStore"
import { useResumeStore } from "~stores/resumeStore"

const API_URL = `${process.env.PLASMO_PUBLIC_WEBAPP_URL}/api/v1/extension/ai/compute-score`

async function calculateScore(jobDetails: string, authToken: string) {
  try {
    const { profileDetails } = useProfileStore.getState()
    const selectedResume = useResumeStore.getState().getSelectedResume()

    const userData = profileDetails.userDetails
    const skillsData = selectedResume.skills
    const projectsData = selectedResume.projects

    // 1. Fetch JD skills and count from the API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ jobDetails: jobDetails })
    })

    if (!response.ok) {
      throw new Error("Failed to fetch job description skills.")
    }

    const apiResult = await response.json()

    if (!apiResult.success || !apiResult.data) {
      throw new Error(
        apiResult.message || "Invalid response from compute-score API"
      )
    }

    const { JDcount, skills } = apiResult.data

    // 2. Collect user keywords
    let allUserRelevantKeywords: {
      keyword: string
      yearsOfExperience?: number
    }[] = []

    if (skillsData && skillsData.length > 0) {
      allUserRelevantKeywords.push(
        ...skillsData.map((s) => ({
          keyword: s.skill,
          yearsOfExperience: s.yearsOfExperience
        }))
      )
    }

    if (projectsData && projectsData.length > 0) {
      projectsData.forEach((project) => {
        if (project.technologiesUsed) {
          allUserRelevantKeywords.push(
            ...project.technologiesUsed.map((tech) => ({
              keyword: tech,
              yearsOfExperience: 1
            }))
          )
        }

        if (project.description) {
          const descriptionWords = project.description
            .toLowerCase()
            .split(/[\s,.;:!/?()"'-\s]+/g)
            .filter(
              (word) =>
                word.length > 2 &&
                ![
                  "the",
                  "and",
                  "for",
                  "with",
                  "a",
                  "an",
                  "of",
                  "in",
                  "to",
                  "is",
                  "was",
                  "were",
                  "this",
                  "that",
                  "used",
                  "made"
                ].includes(word)
            )

          allUserRelevantKeywords.push(
            ...descriptionWords.map((word) => ({
              keyword: word,
              yearsOfExperience: 0.5
            }))
          )
        }
      })
    }

    // 3. Normalize user keywords
    const uniqueUserKeywordsMap = new Map<
      string,
      { keyword: string; yearsOfExperience: number }
    >()

    allUserRelevantKeywords.forEach(({ keyword, yearsOfExperience }) => {
      const normalized = keyword.toLowerCase().trim()
      const currentYears = yearsOfExperience || 0

      if (
        !uniqueUserKeywordsMap.has(normalized) ||
        currentYears > uniqueUserKeywordsMap.get(normalized)!.yearsOfExperience
      ) {
        uniqueUserKeywordsMap.set(normalized, {
          keyword,
          yearsOfExperience: currentYears
        })
      }
    })

    const finalUserKeywords = Array.from(uniqueUserKeywordsMap.values())
    const normalizedJDSkills = skills.map((s) => s.toLowerCase())

    const fuse = new Fuse(normalizedJDSkills, {
      includeScore: true,
      threshold: 0.2,
      ignoreLocation: true,
      findAllMatches: true
    })

    let totalScore = 0
    let matchedSkills = []
    let numberOfMatchedSkills = 0
    const matchedJDSkillItems = new Set<string>()

    finalUserKeywords.forEach(({ keyword: userKeyword, yearsOfExperience }) => {
      const result = fuse.search(userKeyword)

      if (result.length > 0 && result[0].score <= 0.2) {
        const matchedJDSkillItem = result[0].item as string

        if (!matchedJDSkillItems.has(matchedJDSkillItem)) {
          matchedJDSkillItems.add(matchedJDSkillItem)

          const originalJDSkill =
            skills[normalizedJDSkills.indexOf(matchedJDSkillItem)]
          const skillScore = 1 * (yearsOfExperience || 1)

          totalScore += skillScore

          matchedSkills.push({
            skill: originalJDSkill,
            userSkill: userKeyword,
            score: skillScore,
            matchScore: result[0].score
          })

          numberOfMatchedSkills++
        }
      }
    })

    const totalUserSkills = skillsData ? skillsData.length : 0
    const matchPercentage =
      Math.round((numberOfMatchedSkills / JDcount) * 100) || 0

    return {
      matchedSkills,
      matchPercentage,
      numberOfMatchedSkills,
      JDcount,
      skills,
      totalUserSkills,
      normalizedJDSkills
    }
  } catch (error) {
    console.error("Error calculating score:", error)
    return {
      matchedSkills: [],
      matchPercentage: 0,
      numberOfMatchedSkills: 0,
      JDcount: 0,
      skills: [],
      totalUserSkills: 0,
      normalizedJDSkills: []
    }
  }
}

export { calculateScore }
