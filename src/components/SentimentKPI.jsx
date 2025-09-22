"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { supabase } from "@/lib/supabaseClient"

export default function SentimentKPI({ sentiment, icon: Icon, color, filters }) {
  const [loading, setLoading] = useState(false)
  const [currentPct, setCurrentPct] = useState(0)
  const [weekOverWeekChange, setWeekOverWeekChange] = useState(0)

  const fetchSentimentData = async () => {
    setLoading(true)
    try {
      // Helper functions for date calculations
      const toStartOfDay = (date) => {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return d
      }

      const toEndOfDay = (date) => {
        const d = new Date(date)
        d.setHours(23, 59, 59, 999)
        return d
      }

      const getStartOfWeek = (date) => {
        const d = new Date(date)
        const day = d.getDay()
        const diff = day === 0 ? -6 : 1 - day
        d.setDate(d.getDate() + diff)
        d.setHours(0, 0, 0, 0)
        return d
      }

      // Calculate current period dates
      let referenceDate = filters.p_to ? new Date(filters.p_to) : new Date()
      if (filters.p_to) {
        referenceDate = toEndOfDay(referenceDate)
      }
      if (Number.isNaN(referenceDate?.getTime())) {
        setCurrentPct(0)
        setWeekOverWeekChange(0)
        return
      }

      let currentPeriodEnd = new Date(referenceDate)
      let currentPeriodStart = getStartOfWeek(currentPeriodEnd)

      const filterStart = filters.p_from ? toStartOfDay(new Date(filters.p_from)) : null
      if (filterStart && !Number.isNaN(filterStart.getTime())) {
        if (filterStart > currentPeriodEnd) {
          currentPeriodStart = filterStart
          currentPeriodEnd = new Date(filterStart)
        } else if (filterStart > currentPeriodStart) {
          currentPeriodStart = filterStart
        }
      }

      currentPeriodStart = toStartOfDay(currentPeriodStart)
      if (currentPeriodEnd < currentPeriodStart) {
        currentPeriodEnd = new Date(currentPeriodStart)
      }

      // Calculate previous period dates (previous week)
      const currentDuration = currentPeriodEnd.getTime() - currentPeriodStart.getTime()
      const previousPeriodStart = new Date(currentPeriodStart)
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7)
      const previousPeriodEnd = new Date(previousPeriodStart.getTime() + currentDuration)

      // Fetch current period data
      const { data: currentData, error: currentError } = await supabase.rpc("rpt_mentions_by_sentiment", {
        p_from: currentPeriodStart.toISOString(),
        p_to: currentPeriodEnd.toISOString(),
        p_platforms: filters.p_platforms,
        p_keywords: filters.p_keywords,
        p_ai_classification_tags: filters.p_ai_classification_tags,
      })

      if (currentError) throw currentError

      // Fetch previous period data
      const { data: previousData, error: previousError } = await supabase.rpc("rpt_mentions_by_sentiment", {
        p_from: previousPeriodStart.toISOString(),
        p_to: previousPeriodEnd.toISOString(),
        p_platforms: filters.p_platforms,
        p_keywords: filters.p_keywords,
        p_ai_classification_tags: filters.p_ai_classification_tags,
      })

      if (previousError) throw previousError

      // Find sentiment data for current period
      const currentSentimentData = (currentData || []).find(
        (item) => item.ai_sentiment?.toLowerCase() === sentiment.toLowerCase(),
      )
      const currentPercentage = currentSentimentData?.pct || 0

      // Find sentiment data for previous period
      const previousSentimentData = (previousData || []).find(
        (item) => item.ai_sentiment?.toLowerCase() === sentiment.toLowerCase(),
      )
      const previousPercentage = previousSentimentData?.pct || 0

      // Calculate week-over-week change
      let weekChange = 0
      if (previousPercentage === 0) {
        weekChange = currentPercentage === 0 ? 0 : 100
      } else {
        weekChange = ((currentPercentage - previousPercentage) / previousPercentage) * 100
      }

      setCurrentPct(currentPercentage)
      setWeekOverWeekChange(weekChange)
    } catch (error) {
      console.error("Error fetching sentiment data:", error)
      setCurrentPct(0)
      setWeekOverWeekChange(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSentimentData()
  }, [sentiment, filters])

  // Format percentage display
  const formatPercentage = (pct) => {
    if (pct == null || Number.isNaN(pct)) return "0%"
    const value = Math.abs(pct) >= 1 ? pct.toFixed(0) : pct.toFixed(1)
    return `${Number.parseFloat(value)}%`
  }

  // Format week-over-week change
  const formatWeekChange = (change) => {
    if (change == null || Number.isNaN(change)) return "0%"
    const value = Math.abs(change) >= 1 ? change.toFixed(0) : change.toFixed(1)
    const sign = change >= 0 ? "+" : ""
    return `${sign}${Number.parseFloat(value)}%`
  }

  // Get color classes based on sentiment
  const getColorClasses = () => {
    switch (color) {
      case "green":
        return {
          iconBg: "bg-gradient-to-r from-green-500/20 to-green-600/20",
          iconColor: "text-green-400",
          badgeBg: "bg-green-500/10",
          badgeText: "text-green-400",
          badgeBorder: "border-green-500/20",
        }
      case "red":
        return {
          iconBg: "bg-gradient-to-r from-red-500/20 to-red-600/20",
          iconColor: "text-red-400",
          badgeBg: "bg-red-500/10",
          badgeText: "text-red-400",
          badgeBorder: "border-red-500/20",
        }
      case "slate":
        return {
          iconBg: "bg-gradient-to-r from-slate-500/20 to-slate-600/20",
          iconColor: "text-slate-400",
          badgeBg: "bg-slate-500/10",
          badgeText: "text-slate-400",
          badgeBorder: "border-slate-500/20",
        }
      case "blue":
        return {
          iconBg: "bg-gradient-to-r from-blue-500/20 to-blue-600/20",
          iconColor: "text-blue-400",
          badgeBg: "bg-blue-500/10",
          badgeText: "text-blue-400",
          badgeBorder: "border-blue-500/20",
        }
      default:
        return {
          iconBg: "bg-gradient-to-r from-slate-500/20 to-slate-600/20",
          iconColor: "text-slate-400",
          badgeBg: "bg-slate-500/10",
          badgeText: "text-slate-400",
          badgeBorder: "border-slate-500/20",
        }
    }
  }

  const colorClasses = getColorClasses()

  // Capitalize sentiment for display
  const displaySentiment = sentiment.charAt(0).toUpperCase() + sentiment.slice(1)

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${colorClasses.iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${colorClasses.iconColor}`} />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className={`${colorClasses.badgeBg} ${colorClasses.badgeText} ${colorClasses.badgeBorder}`}
                >
                  {formatWeekChange(weekOverWeekChange)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>En comparación con la semana pasada</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{loading ? "..." : formatPercentage(currentPct)}</div>
        <div className="text-sm text-slate-400">Sentimiento {displaySentiment.toLowerCase()}</div>
      </CardContent>
    </Card>
  )
}