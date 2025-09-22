import React from "react"
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

export default function TagMentionsBarChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>
  }

  const sortedData = [...data]
    .map((item) => ({
      tag: item.tag,
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 10, right: 20, bottom: 10, left: 80 }}
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
            dataKey="tag"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
