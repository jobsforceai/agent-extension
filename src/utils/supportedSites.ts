// This list is for sites where we support Autofill.
export const SUPPORTED_AUTOFILL_SITES = [
  // "linkedin.com/",
  "boards.greenhouse.io",
  "job-boards.greenhouse.io",
  "workable.com",
  "ashbyhq.com",
  "lever.co",
  "jobs.eu.lever.co",
  "myworkdayjobs.com",
  "careers.employinc.com",
  "apply.talemetry.com/application",
  "www.smartrecruiterscareers.com",
  "jobs.smartrecruiters.com",
  "zohorecruit.com",
  // "jobsforce.ai",
  // "portal.jobsforce.ai",
  "glassdoor.com/Job"
]

// This list is strictly for AutoApply.
export const SUPPORTED_AUTOAPPLY_SITES = ["linkedin.com/jobs"]

// This list is for sites where the floating button should always be visible.
export const ALWAYS_VISIBLE_SITES = ["linkedin.com"]


export const isSupportedAutofillSite = (url: string): boolean => {
  return SUPPORTED_AUTOFILL_SITES.some((site) => url.includes(site))
}

export const isSupportedAutoapplySite = (url:string): boolean => {
  return SUPPORTED_AUTOAPPLY_SITES.some((site) => url.includes(site))
}

export const isSiteAlwaysVisible = (url: string): boolean => {
    return ALWAYS_VISIBLE_SITES.some((site) => url.includes(site));
}
