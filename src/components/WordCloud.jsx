"use client"

import { useLayoutEffect, useEffect, useRef, useState, useCallback } from "react"
import ReactWordCloud from "react-d3-cloud"

export default function WordCloud({ words = [] }) {
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 700, height: 300 })

  // 🔑 Calcular tamaño inicial antes de pintar (evita parpadeo)
  useLayoutEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      if (width >= 300 && height >= 200) {
        setDimensions({
          width: Math.max(300, Math.round(width)),
          height: Math.max(200, Math.round(height)),
        })
      }
    }
  }, [])

  // 🔑 Observer para cambios de tamaño después del render
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width < 300 || height < 200) return // ignorar glitches
      setDimensions({
        width: Math.max(300, Math.round(width)),
        height: Math.max(200, Math.round(height)),
      })
    })

    if (containerRef.current) observer.observe(containerRef.current)
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current)
    }
  }, [])

  // 🔑 Tamaño balanceado
  const fontSizeMapper = useCallback(
    (word) => Math.log2(word.value) * 6 + 12,
    []
  )

  // 🔑 Todas horizontales
  const rotate = useCallback(() => 0, [])

  // Tooltip con ref (sin re-render)
  const handleWordMouseEnter = (event, word) => {
    if (!tooltipRef.current) return
    tooltipRef.current.style.display = "block"
    tooltipRef.current.querySelector(".tooltip-text").textContent = word.text
    tooltipRef.current.querySelector(
      ".tooltip-value"
    ).textContent = `${word.value} menciones`
  }

  const handleWordMouseLeave = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = "none"
    }
  }

  if (!words.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <ReactWordCloud
        data={words}
        width={dimensions.width}
        height={dimensions.height}
        font="Inter"
        fontSize={fontSizeMapper}
        rotate={rotate}
        padding={1}
        onWordMouseOver={handleWordMouseEnter}
        onWordMouseOut={handleWordMouseLeave}
      />

      {/* Tooltip con ref */}
      <div
        ref={tooltipRef}
        style={{ display: "none" }}
        className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm 
                   border border-slate-700/50 rounded-lg px-3 py-2 z-10 pointer-events-none"
      >
        <p className="tooltip-text text-sm font-medium text-white"></p>
        <p className="tooltip-value text-xs text-slate-400"></p>
      </div>
    </div>
  )
}
