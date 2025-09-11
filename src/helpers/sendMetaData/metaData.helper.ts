import type { SaveJobBody, SaveJobSelectorProps } from "~data/types"
import { extractJobDetailsText } from "~helpers/score/jobDetails.helper"

import { getCompanyNameAndLogo } from "~helpers/company/nameAndLogo.helper"
import { getJobLocation } from "~helpers/company/location.helper"
import { getJobTitle } from "~helpers/job/title.helper"

// New function to scrape JSON-LD
const scrapeJsonLd = (): Partial<SaveJobBody> => {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]')
  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent)
      // Check if it's a JobPosting schema
      if (json["@type"] === "JobPosting") {
        const company = json.hiringOrganization || {}
        const location = json.jobLocation?.address?.addressLocality || json.jobLocation?.address?.name || ""

        // Extract all relevant data
        return {
          jobTitle: json.title,
          jobDescription: json.description,
          companyName: company.name,
          companyLogo: company.logo,
          companyUrl: company.sameAs || company.url,
          location: location
        }
      }
    } catch (error) {
      console.error("Jobsforce: Error parsing JSON-LD:", error)
    }
  }
  return {} // Return empty object if no JobPosting found
}

async function getMetaData(props: SaveJobSelectorProps): Promise<SaveJobBody> {
  // 1. Try to get data from JSON-LD first
  const jsonLdData = scrapeJsonLd()

  // 2. Fallback to selector-based scraping for missing fields
  const jobTitle =
    jsonLdData.jobTitle || getJobTitle(props.jobTitleSelector).jobTitle || ""
  const jobDescription =
    jsonLdData.jobDescription ||
    (await extractJobDetailsText(`${props.jobDescriptionSelector}`)) ||
    ""
  const { companyName, companyLogo } = getCompanyNameAndLogo(
    props.imageUrlSelector,
    props.companyNameSelector
  )
  const location =
    jsonLdData.location || getJobLocation(props.locationSelector)

  return {
    jobTitle,
    jobLink: window.location.href,
    jobDescription,
    companyName: jsonLdData.companyName || companyName,
    companyLogo: jsonLdData.companyLogo || companyLogo,
    companyUrl: jsonLdData.companyUrl,
    location
  }
}

export { getMetaData }
