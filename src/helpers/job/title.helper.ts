function getJobTitle(jobTitleSelector): { jobTitle?: string | null } {
  const jobTitle = document.querySelector(`${jobTitleSelector}`)?.textContent

  return { jobTitle }
}

export { getJobTitle }
