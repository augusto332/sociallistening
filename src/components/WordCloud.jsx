"use client"

import { useLayoutEffect, useEffect, useRef, useState, useCallback } from "react"
import ReactWordCloud from "react-d3-cloud"

export default function WordCloud({ words = [] }) {
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)
  const [dimensions, setDimensions] = useState(null)

  // 🔑 Medir tamaño inicial
  useLayoutEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      if (width >= 300 && height >= 200) {
        setDimensions({
          width: Math.round(width),
          height: Math.round(height),
        })
      }
    }
  }, [])

  // 🔑 Observer para cambios de tamaño después del render
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width >= 300 && height >= 200) {
        setDimensions({
          width: Math.round(width),
          height: Math.round(height),
        })
      }
    })

    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // 🔑 Forzar re-cálculo al segundo tick (por si arranca en 0x0)
  useEffect(() => {
    const id = setTimeout(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        if (width >= 300 && height >= 200) {
          setDimensions({
            width: Math.round(width),
            height: Math.round(height),
          })
        }
      }
    }, 100)
    return () => clearTimeout(id)
  }, [])

  // 🔑 Tamaño balanceado
  const fontSizeMapper = useCallback(
    (word) => Math.log2(word.value) * 6 + 12,
    []
  )

  // 🔑 Todas horizontales
  const rotate = useCallback(() => 0, [])

  // Tooltip
  const handleWordMouseEnter = (event, word) => {
    if (!tooltipRef.current) return
    tooltipRef.current.style.display = "block"
    tooltipRef.current.querySelector(".tooltip-text").textContent = word.text
    tooltipRef.current.querySelector(".tooltip-value").textContent = `${word.value} menciones`
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
      {dimensions && (
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
      )}

      {/* Tooltip */}
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
