function getJobLocation(locationSelector: string): string | null {
  const locationElement = document.querySelector(`${locationSelector}`)

  if (locationElement) {
    const locationText = locationElement.textContent?.trim()
    return locationText || null
  }

  return null
}

export { getJobLocation }
