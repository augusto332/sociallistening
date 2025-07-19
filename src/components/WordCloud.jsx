import React from "react";
import ReactWordCloud from "react-d3-cloud";

export default function WordCloud({ words = [] }) {
  if (!words.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>;
  }

  const fontSizeMapper = (word) => Math.log2(word.value) * 8 + 16;
  const rotate = () => 0;

  return (
    <div className="w-full h-64">
      <ReactWordCloud
        data={words}
        width={500}
        height={250}
        font="sans-serif"
        fontSizeMapper={fontSizeMapper}
        rotate={rotate}
        padding={1}
      />
    </div>
  );
}
