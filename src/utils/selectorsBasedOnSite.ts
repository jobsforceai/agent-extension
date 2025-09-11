import type { SaveJobSelectorProps } from "~data/types"

export const selectorsBasedOnSite = (siteUrl: string): SaveJobSelectorProps => {
  if (siteUrl.includes("www.linkedin.com")) {
    return {
      jobTitleSelector: ".job-details-jobs-unified-top-card__job-title a",
      jobDescriptionSelector: "#job-details",
      imageUrlSelector: ".ivm-view-attr__img-wrapper img",
      companyNameSelector: ".job-details-jobs-unified-top-card__company-name a",
      locationSelector:
        ".job-details-jobs-unified-top-card__primary-description-container .tvm__text--low-emphasis"
    }
  }

  if (siteUrl.includes("apply.workable.com")) {
    return {
      jobTitleSelector: 'h1[data-ui="job-title"]',
      jobDescriptionSelector: '[role="main"]',
      imageUrlSelector: 'a[data-ui="company-logo"] img',
      locationSelector: '[data-ui="job-location"]'
    }
  }

  if (siteUrl.includes("jobs.workable.com")) {
    return {
      jobTitleSelector: 'h2[data-ui="overview-title"] strong',
      jobDescriptionSelector: 'div[class="jobBreakdown__job-breakdown--31MGR"]',
      imageUrlSelector: 'img[class="companyLogo__logo--1lwSh"]',
      locationSelector: 'span[data-ui="overview-location"]'
    }
  }

  if (siteUrl.includes("greenhouse.io")) {
    return {
      jobTitleSelector: "#app_body #header h1.app-title",
      jobDescriptionSelector: "#content",
      imageUrlSelector: "#logo img",
      locationSelector: "#app_body #header .location",
    };
  }

  if (siteUrl.includes("jobs.lever.co")) {
    return {
      jobTitleSelector: ".posting-header h2",
      jobDescriptionSelector: 'div[data-qa="job-description"]',
      imageUrlSelector: ".main-header-logo img",
      locationSelector: ".location"
    }
  }

  if (siteUrl.includes("zohorecruit.com")) {
    return {
      jobTitleSelector: "h2.job-title",
      jobDescriptionSelector: ".job-description",
      imageUrlSelector: ".company-logo-container img",
      locationSelector: ".job-location"
    }
  }
  // Default fallback
  return {
    jobTitleSelector: "h1",
    jobDescriptionSelector: ".job-description, .description",
    imageUrlSelector: ".company-logo img, .logo img",
    locationSelector: ".location, .job-location",
    sourceType: "unknown"
  }
}
