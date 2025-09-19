"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, Brain, Lock } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/context/AuthContext"

export default function ModernAISummary() {
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState("")
  const [summaryTimestamp, setSummaryTimestamp] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [generating, setGenerating] = useState(false)
  const { session, user, plan, planLoading } = useAuth()

  const fetchSummary = useCallback(async () => {
    if (!user) {
      setSummary("")
      return
    }

    setLoadingSummary(true)
    try {
      const { data, error } = await supabase
        .from("ai_summaries")
        .select("summary, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (!error && data?.length) {
        setSummary(data[0]?.summary ?? "")
        setSummaryTimestamp(data[0]?.created_at ?? null)
      } else if (!error) {
        setSummary("")
        setSummaryTimestamp(null)
      }
    } finally {
      setLoadingSummary(false)
    }
  }, [user])

  useEffect(() => {
    if (!planLoading && plan !== "free") {
      fetchSummary()
    }
  }, [fetchSummary, plan, planLoading])

  useEffect(() => {
    if (!planLoading && plan === "free") {
      setSummary("")
      setSummaryTimestamp(null)
    }
  }, [plan, planLoading])

  const handleGenerateSummary = async () => {
    if (!session?.access_token) return

    setGenerating(true)
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      await fetch(`${supabaseUrl}/functions/v1/ai_summarize_mentions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      await fetchSummary()
    } finally {
      setGenerating(false)
    }
  }

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
          <div className="p-6 space-y-6">
            {planLoading ? (
              <div className="flex items-center justify-center">
                <span className="text-sm text-slate-400">Cargando...</span>
              </div>
            ) : plan === "free" ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl mb-4">
                  <Lock className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-400">No disponible en la versión gratuita</p>
              </div>
            ) : (
              <>
                {summary && (
                  <div className="rounded-lg border border-slate-700/60 bg-slate-900/20 p-4 text-left space-y-2">
                    {loadingSummary ? (
                      <span className="text-sm text-slate-400">Cargando resumen...</span>
                    ) : (
                      <>
                        <p className="text-sm text-slate-200 whitespace-pre-line">{summary}</p>
                        {summaryTimestamp && (
                          <p className="text-xs text-slate-500">
                            Generado el {new Date(summaryTimestamp).toLocaleString()}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={generating}
                  className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 py-2 text-sm font-semibold text-white transition-colors hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="flex items-center justify-center gap-2">
                    {generating && (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    )}
                    {generating
                      ? "Generando resumen AI"
                      : summary
                        ? "Volver a generar resumen AI"
                        : "Generar resumen AI"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
