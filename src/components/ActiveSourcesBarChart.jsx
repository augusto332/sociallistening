import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import ChartTooltip from "./ChartTooltip";

export default function ActiveSourcesBarChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>;
  }

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
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
            dataKey="name"
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
