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

export default function PlatformBarChart({ data = [] }) {
  if (!data.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>;
  }

  const formatted = data.map((d) => ({
    name: d.platform,
    count: d.count,
  }));

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
