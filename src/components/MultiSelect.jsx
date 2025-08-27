import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function MultiSelect({ options = [], value = [], onChange, placeholder = "Seleccionar", className = "" }) {
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

  const toggleOption = (val) => {
    if (!onChange) return;
    if (val === "all") {
      if (value.includes("all")) {
        onChange([]);
      } else {
        onChange(["all"]);
      }
      return;
    }

    let newVal = value.includes("all") ? [] : [...value];
    if (newVal.includes(val)) {
      newVal = newVal.filter((v) => v !== val);
    } else {
      newVal.push(val);
    }
    const hasAllOption = options.some((o) => o.value === "all");
    const nonAllOptions = options.filter((o) => o.value !== "all").map((o) => o.value);
    if (hasAllOption && newVal.length === nonAllOptions.length) {
      newVal = ["all"];
    }
    onChange(newVal);
  };

  const display = value.includes("all")
    ? "Todas"
    : value.join(", ") || placeholder;

  return (
    <div ref={containerRef} className={cn("relative", open && "z-50", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none"
      >
        <span className="line-clamp-1 text-left">{display}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-2 shadow-md">
          {options.map((o) => (
            <label key={o.value} className="flex items-center gap-2 p-1 text-sm">
              <Checkbox
                checked={value.includes("all") || value.includes(o.value)}
                onCheckedChange={() => toggleOption(o.value)}
                id={`opt-${o.value}`}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
