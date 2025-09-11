import cssText from "data-text:~style.css"
import { useState, useRef, useEffect } from "react"
import logo from "~assets/jobsforce_logo.jpeg"
import Overlay from "~components/Overlay"

// If you're using Plasmo overlay, exporting getStyle injects your CSS correctly
export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (_match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize
    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")
  styleElement.textContent = updatedCssText
  return styleElement
}

const PlasmoOverlay = () => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ top: 40 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ y: 0 })

  const toggleOverlay = () => setIsOverlayOpen((s) => !s)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    dragOffset.current = { y: e.clientY - buttonPosition.top }

    // Avoid disabling pointer events globally if not needed:
    document.body.style.userSelect = "none"
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const newTop = e.clientY - dragOffset.current.y
    const maxTop = window.innerHeight - 60 // 60px button height
    const constrainedTop = Math.max(10, Math.min(newTop, maxTop - 10))
    setButtonPosition({ top: constrainedTop })
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    document.body.style.userSelect = ""
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMoveGlobal = (e: MouseEvent) => handleMouseMove(e)
    const handleMouseUpGlobal = (e: MouseEvent) => handleMouseUp(e)

    document.addEventListener("mousemove", handleMouseMoveGlobal, { passive: false })
    document.addEventListener("mouseup", handleMouseUpGlobal, { passive: false })
    document.addEventListener("mouseleave", handleMouseUpGlobal)

    return () => {
      document.removeEventListener("mousemove", handleMouseMoveGlobal)
      document.removeEventListener("mouseup", handleMouseUpGlobal)
      document.removeEventListener("mouseleave", handleMouseUpGlobal)
    }
  }, [isDragging])

  return (
    <div>
      {/* Floating Button */}
      {!isOverlayOpen && (
        <div
          ref={dragRef}
          className="fixed right-0 z-[9999] bg-white rounded-full w-[60px] h-[60px] cursor-grab active:cursor-grabbing shadow-[0_4px_12px_rgba(0,0,0,0.3)] flex items-center justify-center border"
          style={{ top: `${buttonPosition.top}px` }}
          onClick={toggleOverlay}
          onMouseDown={handleMouseDown}
        >
          <img src={logo} alt="logo" className="h-14 w-14 rounded-full" />
        </div>
      )}

      {/* Overlay */}
      {isOverlayOpen && <Overlay closeOverlay={toggleOverlay} isSupported={true} />}
    </div>
  )
}

export default PlasmoOverlay
