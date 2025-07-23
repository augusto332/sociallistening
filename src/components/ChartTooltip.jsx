import React from "react";

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="bg-white/30 backdrop-blur-md rounded-md shadow-md px-2 py-1 text-xs text-white">
      {label && <p className="font-medium mb-0">{label}</p>}
      <p>{payload[0].value}</p>
    </div>
  );
}
