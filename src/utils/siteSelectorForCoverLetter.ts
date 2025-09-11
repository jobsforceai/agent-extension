export const getCoverLetterSelector = (url: string): string | null => {
  if (url.includes("apply.workable.com") || url.includes("jobs.workable.com")) {
    return 'textarea[data-ui="cover_letter"]'
  }
  if (url.includes("linkedin.com/jobs/")) {
    return "#cover-letter-textarea"
  }
  if (url.includes("indeed.com")) {
    return 'textarea[name="coverletter"]'
  }
  if (url.includes("greenhouse.io")) {
    return 'textarea[id="cover_letter_text"]'
  }
  // Add other supported websites here
  // ...

  return null
}
