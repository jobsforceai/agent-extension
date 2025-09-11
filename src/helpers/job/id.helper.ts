function getCurrentJobIdFromUrl(url: string) {
  const parsedUrl = new URL(url)
  const jobId = parsedUrl.searchParams.get("currentJobId")
  return jobId
}

export { getCurrentJobIdFromUrl }
