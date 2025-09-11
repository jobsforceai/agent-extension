/**
 * @returns the jobdetails full content
 * @usage const jobdetails = extractJobDetailsText()
 */

import { delay } from "~helpers/delay.helper"



async function extractJobDetailsText(selector: string) {
  const maxRetries = 30 // Increased from 15
  const retryDelay = 700 // Increased from 500
  await delay(500) // Initial delay

  for (let i = 0; i < maxRetries; i++) {
    const jobDetailsDiv = document.querySelector(selector)

    if (jobDetailsDiv) {
      const clone = jobDetailsDiv.cloneNode(true) as HTMLElement

      // Remove unwanted elements
      clone
        .querySelectorAll("button, svg, li-icon, script, style")
        .forEach((el) => el.remove())

      const text = clone.innerText.trim()

      if (text.length > 50) {
        // Reduced minimum length requirement
        const lowerText = text.toLowerCase()
        return lowerText
      } else {
        console.log(`Text too short (${text.length} chars), retrying...`)
      }
    }

    await delay(retryDelay)
  }

  console.warn("⚠️ Failed to extract full job details after waiting.")

  // Try alternative selectors as fallback
  const fallbackSelectors = [
    "article",
    'div[class*="_app-description_"]',
    ".job-details-jobs-unified-top-card__job-description",
    '[data-ui="job-description"]',
    ".job-description",
    ".description",
    "main"
  ]

  for (const fallbackSelector of fallbackSelectors) {
    const element = document.querySelector(fallbackSelector)
    if (element) {
      const text = element.innerText.trim()
      if (text.length > 50) {
        return text.toLowerCase()
      }
    }
  }

  console.error("All extraction methods failed")
  return null // Return null instead of empty string to indicate failure
}

export { extractJobDetailsText }
