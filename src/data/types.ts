// types.ts

export interface UserDetails {
  _id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  currentLocation: string
  contact: string
  DOB: string // ISO Date String
  profilePicture: string
  github: string
  linkedin: string
  portfolio: string
  otherLink: string
  currentCTC: number
  expectedCTC: number
  visaStatus: string
  authorizedToWorkInUS: boolean
  userEthnicity: string
  requiresVisaSponsorship: boolean
  disability: boolean
  LGBTQ: boolean
  gender: string
  isVeteran: boolean
  jobsToApplyDaily: number
  createdAt: string // ISO Date String
  updatedAt: string // ISO Date String
  __v: number
}

export interface Skill {
  _id: string
  skill: string
  yearsOfExperience: number
  __v: number
}

export interface Experience {
  _id: string
  positionTitle: string
  company: string
  location: string
  experienceType: string
  currentlyWorking: boolean
  startMonth: string
  startYear: number
  endMonth: string
  endYear: number
  description: string
  __v: number
  createdAt: string // ISO Date String
  updatedAt: string // ISO Date String
}

export interface Education {
  _id: string
  schoolName: string
  major: string
  degreeType: string
  gpa: number
  startMonth: string
  startYear: number
  endMonth: string
  endYear: number
  description: string
  __v: number
  createdAt: string // ISO Date String
  updatedAt: string // ISO Date String
}

export interface Project {
  _id: string
  projectName: string
  description: string
  url: string | null
  technologiesUsed: string[]
  startDate: string
  endDate: string
  __v: number
  createdAt: string // ISO Date String
  updatedAt: string // ISO Date String
}

export interface Resume {
  _id: string
  userId: string
  originalName: string
  s3Url: string
  isPrimary: boolean
  skills: Skill[]
  experience: Experience[]
  education: Education[]
  projects: Project[]
  importantLinks: Record<string, unknown>
  createdAt: string
  updatedAt: string
  __v: number
  universalResume?: UniversalResume
}

export interface UniversalResume {
  _id: string
  userId: string
  parentResumeId: string
  originalName: string
  s3Url: string
}

export interface UserData {
  userDetails: UserDetails
  resume: Resume[] // Changed from enrichedResumes to match your usage
}

export interface Subscription {
  autofill: boolean
  autoapply: boolean
  agentapply: {
    hasAgentApply: boolean
    jobsLeft: number
    isAgentPlanActive: boolean
  }
}

export interface SubscriptionResponse {
  isAuthExt: {
    autofill: boolean
    autoapply: boolean
  }
  isAuthWeb: {}
  isAuthAgent: {
    isAuthAgent: boolean
    jobsLeft: number
    isAgentPlanActive: boolean
  }
}

export interface SaveJobBody {
  jobId?: string
  jobTitle?: string
  jobDescription?: string
  jobLink?: string
  imageUrl?: string
  companyName?: string
  companyUrl?: string
  companyLogo?: string
  location?: string
  sourceType?: string
}

export interface SaveJobSelectorProps {
  jobTitleSelector?: string
  jobDescriptionSelector?: string
  jobLinkSelector?: string
  imageUrlSelector?: string
  companyNameSelector?: string
  compnayUrlSelector?: string
  companyLogoSelector?: string
  locationSelector?: string
  sourceType?: string
}

export interface DropdownResumeItem {
  id: string
  name: string
  type: "regular" | "universal"
  resume: Resume // The actual resume data (parent resume for universal)
  universalResume?: UniversalResume // Only present for universal items
}

export interface FormFilledPercentage {
  data: {
    userDetailsStatus: {
      formFilledPercentage: number
      missingFields: string[]
    }
  }
}
