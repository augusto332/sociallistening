"use client"

import { useMemo } from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import ChartTooltip from "./ChartTooltip"

export default function TagMentionsBarChart({
  data = [],
  loading = false,
  className = "",
  height = 350, // altura controlable como en ActiveSourcesBarChart
}) {
  const processedData = useMemo(() => {
    if (!data.length) return []
    return [...data]
      .map((item) => ({
        displayName: item.tag, // usamos displayName como en ActiveSources
        count: item.count,
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
          margin={{ top: 10, right: 20, bottom: 20, left: 5 }}
          barCategoryGap="10%" // espacio entre barras
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
