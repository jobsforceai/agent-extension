function getCompanyImageUrl(): string | null {
  const imageWrapper = document.querySelector(".ivm-image-view-model")

  if (imageWrapper) {
    const img = imageWrapper.querySelector("img")
    return img?.getAttribute("src") || null
  }

  return null
}

export { getCompanyImageUrl }
