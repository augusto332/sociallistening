"use client"

import { useState } from "react"
import { ChevronDown, Brain, Lock } from "lucide-react"

export default function ModernAISummary() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-8">
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 shadow-lg cursor-pointer hover:bg-gradient-to-r hover:from-slate-800/70 hover:to-slate-800/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-sm font-semibold text-white">Resumen de AI</span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-300 transition-all duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Content */}
      {open && (
        <div className="mt-3 rounded-xl bg-gradient-to-br from-slate-800/30 to-slate-800/20 backdrop-blur-sm border border-slate-700/50 shadow-lg overflow-hidden">
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl mb-4">
              <Lock className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">No disponible en la versión gratuita</p>
          </div>
        </div>
      )}
    </div>
  )
}
