import React from "react";

export default function WordCloud({ words = [] }) {
  if (!words.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>;
  }

  const max = Math.max(...words.map((w) => w.value));

  return (
    <div className="flex flex-wrap gap-2">
      {words.map((w, i) => {
        const size = 0.75 + (w.value / max) * 1.25; // scale
        return (
          <span
            key={i}
            style={{ fontSize: `${size}rem` }}
            className="text-primary"
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
}
