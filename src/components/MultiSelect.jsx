import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Seleccionar",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const recalc = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    // usamos position: fixed en el portal => no sumamos scroll
    setCoords({ top: r.bottom + 6, left: r.left, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    recalc();
    const onScroll = () => recalc();
    const onResize = () => recalc();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const t = e.target;
      if (triggerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOption = (val) => {
    if (!onChange) return;
    if (val === "all") {
      onChange(value.includes("all") ? [] : ["all"]);
      return;
    }
    let newVal = value.includes("all") ? [] : [...value];
    newVal = newVal.includes(val) ? newVal.filter((v) => v !== val) : [...newVal, val];

    const hasAllOption = options.some((o) => o.value === "all");
    const nonAll = options.filter((o) => o.value !== "all").map((o) => o.value);
    if (hasAllOption && newVal.length === nonAll.length) newVal = ["all"];
    onChange(newVal);
  };

  const display = value.includes("all") ? "Todas" : value.join(", ") || placeholder;

  return (
    <>
      <div className={cn("relative", className)}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent",
            "px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          )}
        >
          <span className="line-clamp-1 text-left">{display}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
            }}
            className={cn(
              "z-[1000] max-h-60 overflow-y-auto rounded-md border bg-popover p-2 shadow-md"
            )}
          >
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
            {options.length === 0 && (
              <div className="px-2 py-1 text-sm text-slate-400">Sin opciones</div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
