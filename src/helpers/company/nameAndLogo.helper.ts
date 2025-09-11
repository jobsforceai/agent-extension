function getCompanyNameAndLogo(
  companyLogoSelector: string,
  companyNameSelector?: string
): {
  companyName: string | null
  companyLogo: string | null
} {
  let companyName: string | null = null
  if (companyNameSelector) {
    const companyNameElement = document.querySelector(companyNameSelector)
    companyName = companyNameElement?.textContent?.trim() || null
  }

  let companyLogo: string | null = null
  let companyLogoElement: HTMLImageElement | null = null

  // Strategy 1: Find logo using the specific company name from the page.
  if (companyName) {
    const allImages = Array.from(document.querySelectorAll("img"))
    // Filter them to find one whose alt text contains the company name.
    companyLogoElement =
      allImages.find((img) => img.alt && img.alt.includes(companyName)) || null
  }

  // Strategy 2: If the first strategy fails, use the generic selector provided for the site.
  if (!companyLogoElement && companyLogoSelector) {
    companyLogoElement = document.querySelector(
      companyLogoSelector
    ) as HTMLImageElement
  }

  if (companyLogoElement) {
    companyLogo = companyLogoElement.src || null
  }

  // Fallback for company name: if we couldn't get it from its own element,
  // try to infer it from the logo's alt text.
  if (!companyName && companyLogoElement) {
    companyName = companyLogoElement.alt?.replace(/logo/gi, "").trim() || null
  }

  return { companyName, companyLogo }
}

export { getCompanyNameAndLogo }
