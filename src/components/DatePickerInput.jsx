import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function DatePickerInput({ value = "", onChange, placeholder = "", className = "" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (date) => {
    if (!date) return;
    onChange && onChange(date.toISOString().slice(0, 10));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        type="text"
        readOnly
        value={value}
        onClick={() => setOpen((o) => !o)}
        placeholder={placeholder}
        className="cursor-pointer"
      />
      {open && (
        <div className="absolute z-50 mt-1">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}

