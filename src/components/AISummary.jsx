import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function AISummary() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-8">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 shadow-sm cursor-pointer"
      >
        <span className="text-sm font-medium text-white">Resumen de AI</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      {open && (
        <div className="mt-2 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 shadow-sm">
          <p className="text-sm text-slate-400">No disponible en la versión gratuita</p>
        </div>
      )}
    </div>
  )
}
