"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDown, Brain, Lock, Sparkles, Clock, Zap, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/context/AuthContext"

export default function ModernAISummary() {
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState("")
  const [summaryTimestamp, setSummaryTimestamp] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [generating, setGenerating] = useState(false)
  const { session, user, plan, planLoading } = useAuth()

  // Cerrar el desplegable cuando se cambia de pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOpen(false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

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
        <div className="mt-3 rounded-xl bg-gradient-to-br from-slate-800/30 to-slate-800/20 backdrop-blur-sm border border-slate-700/50 shadow-lg overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-6">
            {planLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                  <span className="text-sm text-slate-400">Cargando...</span>
                </div>
              </div>
            ) : plan === "free" ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-2xl mb-6">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-300 mb-2">Función Premium</h3>
                <p className="text-sm text-slate-400 mb-4">Los resúmenes de AI están disponibles en planes pagos</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-600/10 border border-purple-500/20 rounded-lg">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">Actualiza tu plan</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Display */}
                {summary && (
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-blue-600/20 rounded-xl blur opacity-75"></div>
                    <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                      {loadingSummary ? (
                        <div className="flex items-center gap-3 py-4">
                          <div className="w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                          <span className="text-sm text-slate-400">Cargando resumen...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* AI Badge */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-blue-600/10 border border-purple-500/20 rounded-full">
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              <span className="text-xs font-medium text-purple-400">Resumen AI</span>
                            </div>
                          </div>

                          {/* Summary Content */}
                          <div className="prose prose-sm prose-invert max-w-none">
                            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{summary}</p>
                          </div>

                          {/* Timestamp */}
                          {summaryTimestamp && (
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span className="text-xs text-slate-500">
                                Generado el{" "}
                                {new Date(summaryTimestamp).toLocaleString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={generating}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-[1px] transition-all duration-200 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white transition-all duration-200 group-hover:from-blue-600 group-hover:to-purple-700">
                    {generating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-sm font-medium">Generando resumen AI...</span>
                      </>
                    ) : (
                      <>
                        {summary ? (
                          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                        ) : (
                          <Zap className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                        )}
                        <span className="text-sm font-medium">
                          {summary ? "Actualizar" : "Generar resumen AI"}
                        </span>
                      </>
                    )}
                  </div>
                </button>

                {/* Info Text */}
                {!summary && !generating && (
                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      El resumen AI analizará tus menciones recientes y generará insights clave
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
