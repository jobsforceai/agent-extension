const formatDateForForm = (
  isoDateString: string | null | undefined,
  format: "month" | "date" = "date"
): string | null => {
  if (!isoDateString) return null
  try {
    const date = new Date(isoDateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")

    if (isNaN(date.getTime())) return null // Invalid date

    if (format === "month") {
      return `${month}/${year}`
    }
    return `${year}-${month}-${day}`
  } catch (e) {
    console.error("Error formatting date:", e, isoDateString)
    return null
  }
}
