"use client"

import { useCallback, useEffect, useRef, useState } from "react"

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
  const { threshold = 0.6, rootMargin = "0px", triggerOnce = true } = options
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
   const [element, setElement] = useState<HTMLDivElement | null>(null) // Usamos estado para o elemento

  useEffect(() => {
    console.log(element)
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting

        console.log("[v0] Element intersecting:", isVisible, "threshold:", entry.intersectionRatio)

        if (isVisible && (!triggerOnce || !hasTriggered)) {
          setIsIntersecting(true)
          if (triggerOnce) {
            setHasTriggered(true)
          }
        } else if (!triggerOnce) {
          setIsIntersecting(isVisible)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [element, threshold, rootMargin, triggerOnce, hasTriggered])

    const ref = useCallback((node: HTMLDivElement) => {
    if (node) {
      setElement(node)
    }
  }, [])


  return { ref, isIntersecting }
}
