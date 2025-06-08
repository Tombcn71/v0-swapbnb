"use client"

import { useState, useEffect } from "react"

interface WindowSize {
  width: number | undefined
  height: number | undefined
  isMobile: boolean
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
    isMobile: false,
  })

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth
      setWindowSize({
        width,
        height: window.innerHeight,
        isMobile: width < 768, // Consider mobile if width is less than 768px (md breakpoint in Tailwind)
      })
    }

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Call handler right away so state gets updated with initial window size
    handleResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, []) // Empty array ensures that effect is only run on mount and unmount

  return windowSize
}
