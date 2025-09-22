"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import ChartTooltip from "./ChartTooltip"

export default function ActiveSourcesBarChart({
  data = [],
  loading = false,
  className = "",
  height = 350, // altura controlable
}) {
  const platformColors = {
    youtube: "#FF0000",
    reddit: "#FF5700",
    twitter: "#1DA1F2",
    instagram: "#E4405F",
    facebook: "#1877F2",
    tiktok: "#000000",
    linkedin: "#0A66C2",
    default: "#6366F1",
  }

  const processedData = useMemo(() => {
    if (!data.length) return []
    return data
      .map((item) => ({
        ...item,
        fill: platformColors[item.name.toLowerCase()] || platformColors.default,
        displayName: item.name.charAt(0).toUpperCase() + item.name.slice(1),
      }))
      .sort((a, b) => b.count - a.count)
  }, [data])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="w-6 h-6 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
        <span className="ml-2 text-sm text-slate-400">Cargando datos...</span>
      </div>
    )
  }

  if (!processedData.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>
  }

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={processedData}
          margin={{ top: 10, right: 20, bottom: 20, left: 30 }}
          barCategoryGap="10%"   // ← más espacio entre barras
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="count"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="displayName"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#6366F1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
