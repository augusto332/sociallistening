import React, { useEffect, useRef, useState } from "react";
import ReactWordCloud from "react-d3-cloud";

export default function WordCloud({ words = [] }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 300 });

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({
        width: Math.max(300, width),
        height: Math.max(200, height),
      });
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  if (!words.length) {
    return <p className="text-muted-foreground text-sm">Sin datos</p>;
  }

  const fontSizeMapper = (word) => Math.log2(word.value) * 8 + 16;
  const rotate = () => (Math.random() > 0.5 ? 0 : -45);

  return (
    <div ref={containerRef} className="w-full h-96">
      <ReactWordCloud
        data={words}
        width={dimensions.width}
        height={dimensions.height}
        font="Inter"
        fontSize={fontSizeMapper}
        rotate={rotate}
        padding={2}
      />
    </div>
  );
}
