import { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import DatePickerInput from "@/components/DatePickerInput"
import { Card, CardContent } from "@/components/ui/card"
import MentionCard from "@/components/MentionCard"
import WordCloud from "@/components/WordCloud"
import PlatformBarChart from "@/components/PlatformBarChart"
import ActiveSourcesBarChart from "@/components/ActiveSourcesBarChart"
import MentionsLineChart from "@/components/MentionsLineChart"
import MultiSelect from "@/components/MultiSelect"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import RightSidebar from "@/components/RightSidebar"
import { supabase } from "@/lib/supabaseClient"
import {
  Search,
  CircleUser,
  Home,
  BarChart2,
  FileLineChartIcon as FileChartLine,
  Settings,
  Star,
  CircleHelp,
  Plus,
  Minus,
  TrendingUp,
  Activity,
  MessageSquare,
  ChevronDown,
  Sparkles,
  LogOut,
  Lightbulb,
  Headset,
  Loader2,
} from "lucide-react"
import { formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import KeywordTable from "@/components/KeywordTable"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import ReportsTable from "@/components/ReportsTable"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import AISummary from "@/components/AISummary"

// ===== Helpers for time buckets and engagement metrics =====
// Hours elapsed since a given ISO date
const hoursSince = (dateStr) => {
  const created = new Date(dateStr)
  return (Date.now() - created.getTime()) / (1000 * 60 * 60)
}

// Bucketize mentions by age for cohort stats
const getAgeBucket = (hours) => {
  if (hours < 6) return "0-6h"
  if (hours < 24) return "6-24h"
  if (hours < 72) return "1-3d"
  return ">3d"
}

// Conversation count for Twitter (replies + quotes)
const convoCount = (m) => (m.replies ?? 0) + (m.quotes ?? 0)

// Engagement Rate per platform
const ER = (m) => {
  const likes = m.likes ?? 0
  const comments = m.comments ?? 0
  const views = m.views ?? 0
  const retweets = m.retweets ?? 0
  const platform = m.platform?.toLowerCase?.()
  if (platform === "youtube") return likes + 2 * comments + 0.5 * views
  if (platform === "reddit") return likes + 2 * comments
  // twitter
  return likes + 2 * convoCount(m) + 2 * retweets
}

// Normalize ER by time since creation
const ERperHour = (m) => ER(m) / Math.max(1 / 12, hoursSince(m.created_at))

// Robust statistics helpers
const median = (arr) => {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const mad = (arr, med) => {
  if (!arr.length) return 0
  const deviations = arr.map((v) => Math.abs(v - med))
  return median(deviations)
}

const percentile = (arr, p) => {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(idx)
  const upper = Math.ceil(idx)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower)
}

// z-score with percentile fallback
const zScore = (value, stats = {}) => {
  const { med = 0, mad: m = 0, p80 = 0, p90 = 0 } = stats
  if (m > 0) return (value - med) / (1.4826 * m)
  if (p90 > p80) return (value - p80) / (p90 - p80)
  return 0
}

// Absolute minimums per platform to avoid noise
const passMinAbs = (m) => {
  const platform = m.platform?.toLowerCase?.()
  if (platform === "youtube") {
    return (m.likes ?? 0) >= 10 || (m.views ?? 0) >= 500 || (m.comments ?? 0) >= 3
  }
  if (platform === "reddit") {
    return (m.likes ?? 0) >= 5 || (m.comments ?? 0) >= 3
  }
  if (platform === "twitter") {
    const convo = convoCount(m)
    return (m.likes ?? 0) >= 5 || (m.retweets ?? 0) >= 2 || convo >= 2
  }
  return false
}

export default function ModernSocialListeningApp({ onLogout }) {
  // All your existing state variables remain the same
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get("tab") || "home"
  })
  const [search, setSearch] = useState("")
  const [mentions, setMentions] = useState([])
  const [mentionsLoading, setMentionsLoading] = useState(true)
  const [dashLoading, setDashLoading] = useState(false)
  const [kpiTotal, setKpiTotal] = useState(0)
  const [kpiMoM, setKpiMoM] = useState({ curr_cnt: 0, prev_cnt: 0, pct_change: 0 })
  const [series, setSeries] = useState([])
  const [topWords, setTopWords] = useState([])
  const [sourceTop, setSourceTop] = useState([])
  const [kpiPlatformCount, setKpiPlatformCount] = useState(0)
  const [badgePlatformActive, setBadgePlatformActive] = useState(0)
  const [kpiKeywordCount, setKpiKeywordCount] = useState(0)
  const [badgeKeywordsActive, setBadgeKeywordsActive] = useState(0)
  const [platCounts, setPlatCounts] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const sentinelRef = useRef(null)
  const loadedMentionIdsRef = useRef(new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [sourcesFilter, setSourcesFilter] = useState([])
  const [keywordsFilter, setKeywordsFilter] = useState(["all"])
  const [tagsFilter, setTagsFilter] = useState([])
  const [aiTagsFilter, setAiTagsFilter] = useState([])
  const [sentimentFilter, setSentimentFilter] = useState([])
  const [allAiTagOptions, setAllAiTagOptions] = useState([])
  const [allSentimentOptions, setAllSentimentOptions] = useState([])
  const [order, setOrder] = useState("recent")
  const [hiddenMentions, setHiddenMentions] = useState([])
  const [keywords, setKeywords] = useState([])
  const [selectedDashboardKeywords, setSelectedDashboardKeywords] = useState(["all"])
  const [selectedDashboardPlatforms, setSelectedDashboardPlatforms] = useState(["all"])
  const [newKeyword, setNewKeyword] = useState("")
  const [addKeywordMessage, setAddKeywordMessage] = useState(null)
  const [saveKeywordMessage, setSaveKeywordMessage] = useState(null)
  const [keywordChanges, setKeywordChanges] = useState({})
  const [showKeywordLangs, setShowKeywordLangs] = useState(false)
  const [newKeywordLang, setNewKeywordLang] = useState("")
  const [pendingKeyword, setPendingKeyword] = useState("")
  const navigate = useNavigate()
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [accountEmail, setAccountEmail] = useState("")
  const [accountName, setAccountName] = useState("")
  const [originalAccountName, setOriginalAccountName] = useState("")
  const [nameMessage, setNameMessage] = useState(null)
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [reportStartDate, setReportStartDate] = useState("")
  const [reportEndDate, setReportEndDate] = useState("")
  const [reportPlatform, setReportPlatform] = useState("")
  const [includeComments, setIncludeComments] = useState(false)
  const [savedReports, setSavedReports] = useState([])
  const [showReportForm, setShowReportForm] = useState(false)
  const [newReportName, setNewReportName] = useState("")
  const [reportKeyword, setReportKeyword] = useState("")
  const [reportDateOption, setReportDateOption] = useState("range")

  // Cohort statistics for robust ER comparison
  const cohortStats = useMemo(() => {
    const cohorts = {}
    const add = (platform, bucket, er, erph) => {
      if (!cohorts[platform]) cohorts[platform] = {}
      if (!cohorts[platform][bucket]) cohorts[platform][bucket] = { ers: [], ersPH: [] }
      cohorts[platform][bucket].ers.push(er)
      cohorts[platform][bucket].ersPH.push(erph)
    }

    mentions.forEach((m) => {
      const platform = m.platform?.toLowerCase?.()
      if (!platform) return
      const hrs = hoursSince(m.created_at)
      const bucket = getAgeBucket(hrs)
      const er = ER(m)
      const erph = ERperHour(m)
      add(platform, bucket, er, erph)
    })

    const stats = {}
    Object.entries(cohorts).forEach(([plat, buckets]) => {
      stats[plat] = {}
      Object.entries(buckets).forEach(([bucket, data]) => {
        const med = median(data.ers)
        const madVal = mad(data.ers, med)
        const p80 = percentile(data.ers, 80)
        const p90 = percentile(data.ers, 90)
        const medPH = median(data.ersPH)
        const madPH = mad(data.ersPH, medPH)
        const p80PH = percentile(data.ersPH, 80)
        const p90PH = percentile(data.ersPH, 90)
        stats[plat][bucket] = {
          med,
          mad: madVal,
          p80,
          p90,
          medPH,
          madPH,
          p80PH,
          p90PH,
        }
      })
    })
    return stats
  }, [mentions])

  const mentionsFilters = useMemo(() => {
    const normalizedSources = Array.isArray(sourcesFilter)
      ? sourcesFilter.filter((source) => typeof source === "string" && source.trim().length > 0)
      : []
    const normalizedKeywords = Array.isArray(keywordsFilter)
      ? keywordsFilter.filter((kw) => typeof kw === "string" && kw !== "all" && kw.trim().length > 0)
      : []
    const normalizedTags = Array.isArray(tagsFilter)
      ? tagsFilter.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
      : []
    const normalizedAiTags = Array.isArray(aiTagsFilter)
      ? aiTagsFilter.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
      : []
    const normalizedSentiment = Array.isArray(sentimentFilter)
      ? sentimentFilter
          .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : null))
          .filter((s) => s && s.length > 0)
      : []

    return {
      search: typeof search === "string" ? search.trim() : "",
      sources: normalizedSources,
      keywords: normalizedKeywords,
      tags: normalizedTags,
      aiTags: normalizedAiTags,
      sentiment: normalizedSentiment,
    }
  }, [search, sourcesFilter, keywordsFilter, tagsFilter, aiTagsFilter, sentimentFilter])

  const getTagsForMention = (mention) => {
    const platform = mention.platform?.toLowerCase?.()
    const hrs = hoursSince(mention.created_at)
    const bucket = getAgeBucket(hrs)
    const stats = cohortStats[platform]?.[bucket] || {}
    const er = ER(mention)
    const erph = ERperHour(mention)
    const zER = zScore(er, stats)
    const zERph = zScore(erph, {
      med: stats.medPH,
      mad: stats.madPH,
      p80: stats.p80PH,
      p90: stats.p90PH,
    })
    const tags = []
    if (!passMinAbs(mention)) return tags

    // Approval based on likes component
    const likeMin = platform === "youtube" ? 10 : 5
    if ((mention.likes ?? 0) >= likeMin && (zER >= 1.5 || er >= (stats.p90 ?? Infinity))) {
      tags.push("approval")
    }

    // Reach based on views (YT) or retweets (TW)
    if (
      platform === "youtube" &&
      (mention.views ?? 0) >= 500 &&
      (zER >= 1.5 || er >= (stats.p90 ?? Infinity))
    ) {
      tags.push("reach")
    }
    if (
      platform === "twitter" &&
      (mention.retweets ?? 0) >= 2 &&
      (zER >= 1.5 || er >= (stats.p90 ?? Infinity))
    ) {
      tags.push("reach")
    }

    // Conversation intensity using ER per hour
    const convMetric = platform === "twitter" ? convoCount(mention) : mention.comments ?? 0
    if (
      convMetric >= 3 &&
      (zERph >= 1.5 || erph >= (stats.p90PH ?? Infinity))
    ) {
      tags.push("conversation")
    }

    return tags
  }

  // All your existing filtering and processing logic remains the same
  const filteredMentions = mentions.filter((m) => {
    const matchesSearch =
      m.mention?.toLowerCase?.().includes(search.toLowerCase()) || m.source?.toLowerCase?.().includes(search.toLowerCase())

    const matchesSource = sourcesFilter.length === 0 || sourcesFilter.includes(m.platform?.toLowerCase())

    const matchesKeyword = keywordsFilter.includes("all") || keywordsFilter.includes(m.keyword)
    const mentionTags = getTagsForMention(m)
    const matchesTag = tagsFilter.length === 0 || tagsFilter.some((t) => mentionTags.includes(t))
    const matchesAiTag =
      aiTagsFilter.length === 0 ||
      (m.ai_classification_tags || []).some((t) => aiTagsFilter.includes(t))
    const mentionSentiment = typeof m.ai_sentiment === "string" ? m.ai_sentiment.trim().toLowerCase() : null
    const matchesSentiment =
      sentimentFilter.length === 0 || (mentionSentiment && sentimentFilter.includes(mentionSentiment))
    return (
      matchesSearch &&
      matchesSource &&
      matchesKeyword &&
      matchesTag &&
      matchesAiTag &&
      matchesSentiment
    )
  })

  const sortedMentions = [...filteredMentions].sort((a, b) => {
    if (order === "recent") {
      const dateA = typeof a.created_at === "string" ? parseISO(a.created_at) : new Date(a.created_at)
      const dateB = typeof b.created_at === "string" ? parseISO(b.created_at) : new Date(b.created_at)
      return dateB.getTime() - dateA.getTime()
    }
    if (order === "popular") {
      const erDiff = ER(b) - ER(a)
      if (erDiff !== 0) return erDiff

      const erHourDiff = ERperHour(b) - ERperHour(a)
      if (erHourDiff !== 0) return erHourDiff

      const convoA = (a.comments ?? 0) + convoCount(a)
      const convoB = (b.comments ?? 0) + convoCount(b)
      return convoB - convoA
    }

    return 0
  })

  const visibleMentions = sortedMentions.filter((m) => !hiddenMentions.includes(m.url))
  const homeMentions = onlyFavorites
    ? visibleMentions.filter(
        (m) => m.is_highlighted === true || m.is_highlighted === "true",
      )
    : visibleMentions

  const toggleHighlight = async (mention) => {
    const currentHighlight =
      mention.is_highlighted === true || mention.is_highlighted === "true"
    const newValue = !currentHighlight
    try {
      const { error } = await supabase
        .from("fact_mentions")
        .update({ is_highlighted: !!newValue })
        .eq("content_id", mention.content_id)
      if (error) throw error
      setMentions((prev) =>
        prev.map((m) =>
          m.content_id === mention.content_id ? { ...m, is_highlighted: newValue } : m
        )
      )
    } catch (err) {
      console.error("Error updating mention highlight", err)
    }
  }

  const PAGE_SIZE = 20

  const sanitizeSearch = (value = "") =>
    value
      .trim()
      .replace(/[%_]/g, "\\$&")
      .replace(/,/g, "\\,")
      .replace(/'/g, "''")

  const applyMentionFilters = (
    query,
    filters = {},
    { skipSearch = false, skipSources = false, skipKeywords = false, skipAiTags = false, skipSentiment = false } = {},
  ) => {
    const {
      search: searchFilter = "",
      sources = [],
      keywords = [],
      aiTags = [],
      sentiment = [],
    } = filters || {}

    let nextQuery = query

    if (!skipSearch && searchFilter) {
      const sanitized = sanitizeSearch(searchFilter)
      nextQuery = nextQuery.or(`mention.ilike.%${sanitized}%,source.ilike.%${sanitized}%`)
    }

    if (!skipSources && sources.length) {
      nextQuery = nextQuery.in(
        "platform",
        sources.map((s) => s?.toLowerCase?.()).filter(Boolean),
      )
    }

    if (!skipKeywords && keywords.length) {
      nextQuery = nextQuery.in(
        "keyword",
        keywords.filter((k) => typeof k === "string" && k.trim().length > 0),
      )
    }

    if (!skipAiTags && aiTags.length) {
      nextQuery = nextQuery.overlaps(
        "ai_classification_tags",
        aiTags.filter((t) => typeof t === "string" && t.trim().length > 0),
      )
    }

    if (!skipSentiment && sentiment.length) {
      nextQuery = nextQuery.in(
        "ai_sentiment",
        sentiment
          .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : null))
          .filter((s) => s && s.length > 0),
      )
    }

    return nextQuery
  }

  const fetchMentionsPage = async (view, filters = {}, afterCursor = null) => {
    let query = supabase
      .from(view)
      .select("*")
      .order("created_at", { ascending: false })
      .order("mention_id", { ascending: false })

    query = applyMentionFilters(query, filters)

    if (afterCursor) {
      const { created_at, mention_id } = afterCursor
      query = query.or(
        `created_at.lt.${created_at},and(created_at.eq.${created_at},mention_id.lt.${mention_id})`,
      )
    }

    const { data: rows, error } = await query.limit(PAGE_SIZE)
    if (error) {
      console.error("Error fetching mentions page", error)
      return { rows: [], cursor: null, hasMore: false }
    }

    const contentIds = (rows || []).map((r) => r.content_id).filter(Boolean)

    const topCommentsById = {}
    for (let i = 0; i < contentIds.length; i += 200) {
      const chunk = contentIds.slice(i, i + 200)
      try {
        const { data: tc, error: tcErr } = await supabase
          .from("top_3_comments_vw")
          .select("content_id, comment_likes, comment")
          .in("content_id", chunk)
        if (tcErr) {
          console.error("Error fetching top_3_comments_vw", tcErr)
        } else {
          ;(tc || []).forEach((item) => {
            const k = item.content_id
            if (!k) return
            if (!topCommentsById[k]) topCommentsById[k] = []
            topCommentsById[k].push({
              comment_likes: item.comment_likes,
              comment: item.comment,
            })
          })
        }
      } catch (e) {
        console.error("Top comments fetch blew up", e)
      }
    }

    Object.keys(topCommentsById).forEach((k) => {
      topCommentsById[k] = topCommentsById[k]
        .sort((a, b) => (b.comment_likes ?? 0) - (a.comment_likes ?? 0))
        .slice(0, 3)
    })

    const enriched = (rows || []).map((r) => ({
      ...r,
      is_highlighted: r.is_highlighted === true || r.is_highlighted === "true",
      top_comments: topCommentsById[r.content_id] || [],
    }))

    const last = enriched[enriched.length - 1]
    const nextCursor = last
      ? { created_at: last.created_at, mention_id: last.mention_id }
      : null

    return {
      rows: enriched,
      cursor: nextCursor,
      hasMore: enriched.length === PAGE_SIZE,
    }
  }

  const loadFirstPage = async (view, filters = {}) => {
    setMentions([])
    setMentionsLoading(true)
    setCursor(null)
    setHasMore(true)
    setIsLoadingMore(false)
    loadedMentionIdsRef.current = new Set()

    const { rows, cursor: nextCursor, hasMore: more } = await fetchMentionsPage(view, filters)

    rows.forEach((m) => loadedMentionIdsRef.current.add(m.mention_id))

    setMentions(rows)
    setCursor(nextCursor)
    setHasMore(more)
    setMentionsLoading(false)
  }

  const loadMore = async (view, filters = {}) => {
    if (isLoadingMore || !hasMore || !cursor) return
    setIsLoadingMore(true)
    const { rows, cursor: nextCursor, hasMore: more } = await fetchMentionsPage(
      view,
      filters,
      cursor
    )

    const deduped = rows.filter((m) => !loadedMentionIdsRef.current.has(m.mention_id))
    deduped.forEach((m) => loadedMentionIdsRef.current.add(m.mention_id))

    setMentions((prev) => [...prev, ...deduped])
    setCursor(nextCursor)
    setHasMore(more)
    setIsLoadingMore(false)
  }

  const fetchAiTagOptions = async (view, filters = {}) => {
    try {
      let query = supabase.from(view).select("ai_classification_tags", { distinct: true })
      query = applyMentionFilters(query, filters, { skipAiTags: true })
      query = query.not("ai_classification_tags", "is", null)

      const { data, error } = await query
      if (error) throw error

      const tagSet = new Set()
      ;(data || []).forEach((row) => {
        const tags = Array.isArray(row?.ai_classification_tags)
          ? row.ai_classification_tags
          : []
        tags.forEach((tag) => {
          const normalized = typeof tag === "string" ? tag.trim() : ""
          if (normalized) {
            tagSet.add(normalized)
          }
        })
      })

      const merged = new Set([...tagSet, ...(filters.aiTags || [])])
      return Array.from(merged)
    } catch (err) {
      console.error("Error fetching AI classification tags", err)
      const merged = new Set(filters.aiTags || [])
      return Array.from(merged)
    }
  }

  const fetchSentimentOptions = async (view, filters = {}) => {
    const preferredOrder = ["positive", "neutral", "negative"]
    try {
      let query = supabase.from(view).select("ai_sentiment", { distinct: true })
      query = applyMentionFilters(query, filters, { skipSentiment: true })
      query = query.not("ai_sentiment", "is", null)

      const { data, error } = await query
      if (error) throw error

      const normalized = Array.from(
        new Set(
          (data || [])
            .map((row) =>
              typeof row?.ai_sentiment === "string" ? row.ai_sentiment.trim().toLowerCase() : "",
            )
            .filter((value) => value.length > 0),
        ),
      )

      const ordered = [
        ...preferredOrder.filter((sentiment) => normalized.includes(sentiment)),
        ...normalized.filter((sentiment) => !preferredOrder.includes(sentiment)),
      ]

      const merged = new Set([...(filters.sentiment || []), ...ordered])
      const mergedOrdered = [
        ...preferredOrder.filter((sentiment) => merged.has(sentiment)),
        ...Array.from(merged).filter((sentiment) => !preferredOrder.includes(sentiment)),
      ]

      return mergedOrdered
    } catch (err) {
      console.error("Error fetching sentiment options", err)
      const merged = new Set(filters.sentiment || [])
      return Array.from(merged)
    }
  }

  const refreshGlobalFilterOptions = async (view, filters = {}) => {
    try {
      const [aiTags, sentiments] = await Promise.all([
        fetchAiTagOptions(view, filters),
        fetchSentimentOptions(view, filters),
      ])
      setAllAiTagOptions(aiTags)
      setAllSentimentOptions(sentiments)
    } catch (err) {
      console.error("Error refreshing global filter options", err)
    }
  }

  const fetchKeywords = async () => {
    const { data, error } = await supabase
      .from("dim_keywords")
      .select(
        "keyword, keyword_id, created_at, active, language, last_processed_at_yt, last_processed_at_rd, last_processed_at_tw",
      )
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching keywords", error)
    } else {
      setKeywords(data || [])
    }
  }

  const toggleKeywordActive = async (id, active) => {
    const { error } = await supabase.from("dim_keywords").update({ active: !!active }).eq("keyword_id", id)

    if (error) {
      console.error("Error updating keyword", error)
      return { error }
    }

    setKeywords((prev) => prev.map((k) => (k.keyword_id === id ? { ...k, active } : k)))
    return { error: null }
  }

  const handleKeywordToggle = (id, active) => {
    setKeywords((prev) => prev.map((k) => (k.keyword_id === id ? { ...k, active } : k)))
    setKeywordChanges((prev) => ({ ...prev, [id]: active }))
  }

  const saveKeywordChanges = async () => {
    setSaveKeywordMessage(null)
    let hasError = false
    let errorMsg = ""
    for (const [id, active] of Object.entries(keywordChanges)) {
      const { error } = await toggleKeywordActive(id, active)
      if (error) {
        hasError = true
        errorMsg = error.message || "Error desconocido"
      }
    }
    setKeywordChanges({})
    if (hasError) {
      setSaveKeywordMessage({
        type: "error",
        text: `Ocurrió un error al guardar los cambios: ${errorMsg}`,
      })
    } else {
      setSaveKeywordMessage({ type: "success", text: "Cambios guardados" })
    }
  }

  const openKeywordLangSelector = () => {
    if (!newKeyword.trim()) return
    setPendingKeyword(newKeyword.trim())
    setShowKeywordLangs(true)
    setNewKeywordLang("")
    setAddKeywordMessage(null)
  }

  const saveNewKeyword = async () => {
    if (!pendingKeyword.trim() || !newKeywordLang) return
    setAddKeywordMessage(null)
    const { data: userData } = await supabase.auth.getUser()
    const { user } = userData || {}
    if (!user) {
      setAddKeywordMessage({ type: "error", text: "Debes iniciar sesión" })
      return
    }
    const { data, error } = await supabase
      .from("dim_keywords")
      .insert({
        keyword: pendingKeyword,
        user_id: user.id,
        created_at: new Date().toISOString(),
        active: false,
        language: newKeywordLang,
      })
      .select()
    if (error || !data || data.length === 0) {
      console.error("Error adding keyword", error)
      setAddKeywordMessage({
        type: "error",
        text: `No se pudo agregar la keyword: ${error?.message || "Error desconocido"}`,
      })
    } else {
      setKeywords((k) => [...data, ...k])
      setNewKeyword("")
      setPendingKeyword("")
      setNewKeywordLang("")
      setShowKeywordLangs(false)
      setAddKeywordMessage({ type: "success", text: "Keyword agregada" })
    }
  }

  const fetchAccount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const displayName = user.user_metadata?.display_name || ""
      setAccountEmail(user.email || "")
      setAccountName(displayName)
      setOriginalAccountName(displayName)
    }
  }

  const togglePasswordFields = () => {
    setShowPasswordFields((prev) => !prev)
    setPasswordMessage(null)
    setCurrentPassword("")
    setNewPassword("")
  }

  const handleChangePassword = async () => {
    setPasswordMessage(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: accountEmail,
      password: currentPassword,
    })
    if (signInError) {
      setPasswordMessage({ type: "error", text: "Contraseña actual incorrecta" })
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMessage({ type: "error", text: error.message })
    } else {
      setPasswordMessage({ type: "success", text: "Contraseña actualizada" })
      setShowPasswordFields(false)
      setCurrentPassword("")
      setNewPassword("")
    }
  }

  const handleSaveAccountName = async () => {
    setNameMessage(null)
    const { error } = await supabase.auth.updateUser({
      data: { display_name: accountName },
    })
    if (error) {
      setNameMessage({ type: "error", text: error.message })
    } else {
      setNameMessage({ type: "success", text: "Nombre actualizado" })
      setOriginalAccountName(accountName)
    }
  }

  useEffect(() => {
    fetchKeywords()
    fetchAccount()
  }, [])

  useEffect(() => {
    if (activeTab === "dashboard") {
      setMentionsLoading(false)
      return
    }

    const view = onlyFavorites ? "total_mentions_highlighted_vw" : "mentions_display_vw"
    loadFirstPage(view, mentionsFilters)
    refreshGlobalFilterOptions(view, mentionsFilters)
  }, [activeTab, onlyFavorites, mentionsFilters])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (
        entry.isIntersecting &&
        hasMore &&
        !isLoadingMore &&
        activeTab !== "dashboard"
      ) {
        const view =
          onlyFavorites
            ? "total_mentions_highlighted_vw"
            : "mentions_display_vw"
        loadMore(view, mentionsFilters)
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, activeTab, onlyFavorites, mentions, mentionsFilters])

  const fetchSavedReports = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const { user } = userData || {}
    if (!user) return
    const { data, error } = await supabase
      .from("user_reports_parameters")
      .select("*")
      .eq("user_id", user.id)
    if (error) {
      console.error("Error fetching reports", error)
      return
    }
    const mapped = (data || []).map((r) => ({
      id: r.id,
      name: r.name,
      platform: r.platform,
      keyword: keywords.find((k) => k.keyword_id === r.keyword_id)?.keyword || "",
      startDate: r.isdynamicdate ? "" : r.date_from,
      endDate: r.isdynamicdate ? "" : r.date_to,
      datePreset: r.isdynamicdate ? (r.last_x_days ? String(r.last_x_days) : "") : "",
      includeComments: r.comments,
    }))
    setSavedReports(mapped)
  }

  useEffect(() => {
    if (keywords.length) {
      fetchSavedReports()
    }
  }, [keywords])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (onLogout) onLogout()
    navigate("/login")
  }

  const toggleSourceFilter = (id) => {
    setSourcesFilter((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const toggleTagFilter = (id) => {
    setTagsFilter((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  const toggleAiTagFilter = (tag) => {
    setAiTagsFilter((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleSentimentFilter = (sentiment) => {
    setSentimentFilter((prev) =>
      prev.includes(sentiment) ? prev.filter((s) => s !== sentiment) : [...prev, sentiment],
    )
  }

  const clearSidebarFilters = () => {
    setSourcesFilter([])
    setSearch("")
    setKeywordsFilter(["all"])
    setTagsFilter([])
    setAiTagsFilter([])
    setSentimentFilter([])
  }

  const clearDashboardFilters = () => {
    setSelectedDashboardKeywords(["all"])
    setSelectedDashboardPlatforms(["all"])
    setStartDate("")
    setEndDate("")
  }

  const fetchDashboardKpis = async () => {
    setDashLoading(true)
    try {
      const p_from = startDate ? new Date(startDate).toISOString() : null
      let p_to = null
      if (endDate) {
        const d = new Date(endDate)
        d.setHours(23, 59, 59, 999)
        p_to = d.toISOString()
      }
      const p_platforms = selectedDashboardPlatforms.includes("all")
        ? null
        : selectedDashboardPlatforms.map((p) => p.toLowerCase())
      const p_keywordsUuid = selectedDashboardKeywords.includes("all")
        ? null
        : selectedDashboardKeywords
            .map((kw) => keywords.find((k) => k.keyword === kw)?.keyword_id)
            .filter((id) => typeof id === "string")
      const { data: totalData, error: totalError } = await supabase.rpc(
        "rpt_mentions_total",
        {
          p_from,
          p_to,
          p_platforms,
          p_keywords_id: p_keywordsUuid,
        },
      )
      if (totalError) throw totalError
      setKpiTotal(totalData?.[0]?.total || 0)
      const { data: momData, error: momError } = await supabase.rpc(
        "rpt_mentions_mom_variation",
        {
          p_from,
          p_to,
          p_platforms,
          p_keywords: p_keywordsUuid,
        },
      )
      if (momError) throw momError
      setKpiMoM(momData?.[0] || { curr_cnt: 0, prev_cnt: 0, pct_change: 0 })
    } catch (err) {
      console.error("Error fetching dashboard KPIs", err)
    } finally {
      setDashLoading(false)
    }
  }

  const fetchPlatformsKpis = async () => {
    setDashLoading(true)
    try {
      const p_from = startDate ? new Date(startDate).toISOString() : null
      let p_to = null
      if (endDate) {
        const d = new Date(endDate)
        d.setHours(23, 59, 59, 999)
        p_to = d.toISOString()
      }
      const p_platforms = selectedDashboardPlatforms.includes("all")
        ? null
        : selectedDashboardPlatforms.map((p) => p.toLowerCase())
      const p_keywords = selectedDashboardKeywords.includes("all")
        ? null
        : selectedDashboardKeywords
            .map((kw) => keywords.find((k) => k.keyword === kw)?.keyword_id)
            .filter((id) => typeof id === "string")
      const { data, error } = await supabase.rpc("rpt_platform_count", {
        p_from,
        p_to,
        p_platforms,
        p_keywords,
      })
      if (error) throw error
      setKpiPlatformCount(data?.[0]?.platforms ?? 0)
      const { data: activeData, error: activeError } = await supabase.rpc(
        "rpt_platform_count",
        { p_from: null, p_to: null, p_platforms: null, p_keywords: null },
      )
      if (activeError) throw activeError
      setBadgePlatformActive(activeData?.[0]?.platforms ?? 0)
    } catch (err) {
      console.error("Error fetching platform KPIs", err)
    } finally {
      setDashLoading(false)
    }
  }

  const fetchKeywordsKpis = async () => {
    setDashLoading(true)
    try {
      const p_from = startDate ? new Date(startDate).toISOString() : null
      let p_to = null
      if (endDate) {
        const d = new Date(endDate)
        d.setHours(23, 59, 59, 999)
        p_to = d.toISOString()
      }
      const p_platforms = selectedDashboardPlatforms.includes("all")
        ? null
        : selectedDashboardPlatforms.map((p) => p.toLowerCase())
      const p_keywords = selectedDashboardKeywords.includes("all")
        ? null
        : selectedDashboardKeywords
            .map((kw) => keywords.find((k) => k.keyword === kw)?.keyword_id)
            .filter((id) => typeof id === "string")
      const { data, error } = await supabase.rpc("rpt_keyword_count", {
        p_from,
        p_to,
        p_platforms,
        p_keywords,
      })
      if (error) throw error
      setKpiKeywordCount(data?.[0]?.keywords ?? 0)
      const { count, error: activeError } = await supabase
        .from("dim_keywords")
        .select("keyword_id", { count: "exact", head: true })
        .eq("active", true)
      if (activeError) throw activeError
      setBadgeKeywordsActive(count ?? 0)
    } catch (err) {
      console.error("Error fetching keyword KPIs", err)
    } finally {
      setDashLoading(false)
    }
  }

  const fetchTopWords = async () => {
    setDashLoading(true)
    try {
      const p_from = startDate ? new Date(startDate).toISOString() : null
      let p_to = null
      if (endDate) {
        const d = new Date(endDate)
        d.setHours(23, 59, 59, 999)
        p_to = d.toISOString()
      }
      const p_platforms = selectedDashboardPlatforms.includes("all")
        ? null
        : selectedDashboardPlatforms.map((p) => p.toLowerCase())
      const p_keywords = selectedDashboardKeywords.includes("all")
        ? null
        : selectedDashboardKeywords
            .map((kw) => keywords.find((k) => k.keyword === kw)?.keyword_id)
            .filter((id) => typeof id === "string")
      const { data, error } = await supabase.rpc("rpt_top_words", {
        p_from,
        p_to,
        p_platforms,
        p_keywords,
        p_min_len: 3,
        p_limit: 30,
      })
      if (error) throw error
      setTopWords(
        (data || []).map((item) => ({ text: item.word, value: Number(item.cnt) }))
      )
    } catch (err) {
      console.error("Error fetching top words", err)
    } finally {
      setDashLoading(false)
    }
  }

  const fetchTopSources = async () => {
    setDashLoading(true)
    try {
      const p_from = startDate ? new Date(startDate).toISOString() : null
      let p_to = null
      if (endDate) {
        const d = new Date(endDate)
        d.setHours(23, 59, 59, 999)
        p_to = d.toISOString()
      }
      const p_sources = null
      const p_keywords = selectedDashboardKeywords.includes("all")
        ? null
        : selectedDashboardKeywords
            .map((kw) => keywords.find((k) => k.keyword === kw)?.keyword_id)
            .filter((id) => typeof id === "string")
      const { data, error } = await supabase.rpc("rpt_mentions_by_source", {
        p_from,
        p_to,
        p_sources,
        p_keywords,
        p_limit: 10,
      })
      if (error) throw error
      setSourceTop(
        (data || []).map((item) => ({ name: item.source, count: Number(item.cnt) }))
      )
    } catch (err) {
      console.error("Error fetching top sources", err)
    } finally {
      setDashLoading(false)
    }
  }

  const fetchPlatforms = async () => {
    setDashLoading(true)
    try {
      const p_from = startDate ? new Date(startDate).toISOString() : null
      let p_to = null
      if (endDate) {
        const d = new Date(endDate)
        d.setHours(23, 59, 59, 999)
        p_to = d.toISOString()
      }
      const p_platforms = selectedDashboardPlatforms.includes("all")
        ? null
        : selectedDashboardPlatforms.map((p) => p.toLowerCase())
      const p_keywords = selectedDashboardKeywords.includes("all")
        ? null
        : selectedDashboardKeywords
            .map((kw) => keywords.find((k) => k.keyword === kw)?.keyword_id)
            .filter((id) => typeof id === "string")
      const { data, error } = await supabase.rpc("rpt_mentions_by_platform", {
        p_from,
        p_to,
        p_platforms,
        p_keywords,
      })
      if (error) throw error
      setPlatCounts(
        (data || []).map((item) => ({ platform: item.platform, count: Number(item.cnt) }))
      )
    } catch (err) {
      console.error("Error fetching mentions by platform", err)
    } finally {
      setDashLoading(false)
    }
  }

  const fetchSeries = async () => {
    setDashLoading(true)
    try {
      const p_from = startDate ? new Date(startDate).toISOString() : null
      let p_to = null
      if (endDate) {
        const d = new Date(endDate)
        d.setHours(23, 59, 59, 999)
        p_to = d.toISOString()
      }
      const p_platforms = selectedDashboardPlatforms.includes("all")
        ? null
        : selectedDashboardPlatforms.map((p) => p.toLowerCase())
      const p_keywords = selectedDashboardKeywords.includes("all")
        ? null
        : selectedDashboardKeywords
            .map((kw) => keywords.find((k) => k.keyword === kw)?.keyword_id)
            .filter((id) => typeof id === "string")
      let p_bucket = "day"
      if (startDate && endDate) {
        const diff =
          (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
        if (diff > 180) p_bucket = "month"
        else if (diff > 60) p_bucket = "week"
      }
      const { data, error } = await supabase.rpc("rpt_mentions_over_time", {
        p_from,
        p_to,
        p_platforms,
        p_keywords,
        p_bucket,
      })
      if (error) throw error
      setSeries(
        (data || []).map((item) => ({ date: item.ts, count: Number(item.cnt) }))
      )
    } catch (err) {
      console.error("Error fetching mentions over time", err)
    } finally {
      setDashLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab !== "dashboard") return
    fetchDashboardKpis()
  }, [
    activeTab,
    startDate,
    endDate,
    selectedDashboardPlatforms,
    selectedDashboardKeywords,
    keywords,
  ])

  useEffect(() => {
    if (activeTab !== "dashboard") return
    fetchPlatformsKpis()
  }, [
    activeTab,
    startDate,
    endDate,
    selectedDashboardPlatforms,
    selectedDashboardKeywords,
    keywords,
  ])

  useEffect(() => {
    if (activeTab !== "dashboard") return
    fetchKeywordsKpis()
  }, [
    activeTab,
    startDate,
    endDate,
    selectedDashboardPlatforms,
    selectedDashboardKeywords,
    keywords,
  ])

  useEffect(() => {
    if (activeTab !== "dashboard") return
    fetchTopWords()
  }, [
    activeTab,
    startDate,
    endDate,
    selectedDashboardPlatforms,
    selectedDashboardKeywords,
    keywords,
  ])

  useEffect(() => {
    if (activeTab !== "dashboard") return
    fetchTopSources()
  }, [activeTab, startDate, endDate, selectedDashboardKeywords, keywords])

  useEffect(() => {
    if (activeTab !== "dashboard") return
    fetchPlatforms()
  }, [
    activeTab,
    startDate,
    endDate,
    selectedDashboardPlatforms,
    selectedDashboardKeywords,
    keywords,
  ])

  useEffect(() => {
    if (activeTab !== "dashboard") return
    fetchSeries()
  }, [
    activeTab,
    startDate,
    endDate,
    selectedDashboardPlatforms,
    selectedDashboardKeywords,
    keywords,
  ])

  const handleCreateReport = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const { user } = userData || {}
    if (!user) return
    const keywordObj = keywords.find((k) => k.keyword === reportKeyword)
    const isDynamic = reportDateOption !== "range"
    const insertData = {
      name: newReportName || `Reporte ${savedReports.length + 1}`,
      platform: reportPlatform,
      keyword_id: keywordObj?.keyword_id || null,
      isdynamicdate: isDynamic,
      date_from: isDynamic ? null : reportStartDate || null,
      date_to: isDynamic ? null : reportEndDate || null,
      last_x_days: isDynamic ? Number(reportDateOption) : null,
      comments: includeComments,
      user_id: user.id,
    }
    const { data, error } = await supabase
      .from("user_reports_parameters")
      .insert(insertData)
      .select()
    if (error) {
      console.error("Error creating report", error)
    } else if (data && data.length > 0) {
      const r = data[0]
      const newRep = {
        id: r.id,
        name: r.name,
        platform: r.platform,
        keyword: reportKeyword,
        startDate: r.isdynamicdate ? "" : r.date_from,
        endDate: r.isdynamicdate ? "" : r.date_to,
        datePreset: r.isdynamicdate ? (r.last_x_days ? String(r.last_x_days) : "") : "",
        includeComments: r.comments,
      }
      setSavedReports((prev) => [...prev, newRep])
      setNewReportName("")
      setReportPlatform("")
      setReportKeyword("")
      setReportStartDate("")
      setReportEndDate("")
      setReportDateOption("range")
      setIncludeComments(false)
      setShowReportForm(false)
    }
  }

  const handleDownloadReport = async (rep) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Debes iniciar sesión para descargar el reporte.");
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export_reports_to_csv`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ report_id: rep.id }),
        }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const disp = res.headers.get("Content-Disposition") || "";
      const match = /filename="?([^"]+)"?/.exec(disp);
      const fallbackName = `${(rep.name || "reporte").replace(/[^\w.-]+/g, "_").slice(0, 60)}.csv`;
      const filename = match?.[1] || fallbackName;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(`Error al descargar: ${e?.message || e}`);
    }
  }

  const handleDeleteReport = async (index) => {
    const rep = savedReports[index]
    if (!rep) return
    const { error } = await supabase
      .from("user_reports_parameters")
      .delete()
      .eq("id", rep.id)
    if (error) {
      console.error("Error deleting report", error)
      return
    }
    setSavedReports((prev) => prev.filter((_, i) => i !== index))
  }

  const activeKeywords = useMemo(() => keywords.filter((k) => k.active), [keywords])
  const kpiMoMDisplay = useMemo(() => {
    const pct = kpiMoM.pct_change
    if (pct == null) return "—%"
    const value = Math.abs(pct) >= 1 ? pct.toFixed(0) : pct.toFixed(2)
    return `${pct >= 0 ? "+" : ""}${parseFloat(value)}%`
  }, [kpiMoM])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Social Listening
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setHelpMenuOpen(!helpMenuOpen)
                  setMenuOpen(false)
                }}
                className="text-slate-300 hover:text-white"
              >
                <CircleHelp className="w-4 h-4" />
              </Button>
              {helpMenuOpen && (
                <div className="absolute right-0 top-12 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-lg p-2 space-y-1 z-50 min-w-[180px]">
                  <button
                    onClick={() => setHelpMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                  >
                    <Headset className="w-4 h-4" />
                    Solicitar soporte
                  </button>
                  <button
                    onClick={() => setHelpMenuOpen(false)}
                    className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Brindar feedback
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => {
                  setMenuOpen(!menuOpen)
                  setHelpMenuOpen(false)
                }}
                className="flex items-center gap-2 text-slate-300 hover:text-white"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src="/placeholder.svg?height=28&width=28" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                    {accountName ? accountName.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4" />
              </Button>

              {menuOpen && (
                <div className="absolute right-0 top-12 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-lg p-2 space-y-1 z-50 min-w-[180px]">
                  <button
                    onClick={() => {
                      setActiveTab("account")
                      setMenuOpen(false)
                    }}
                    className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                  >
                    <CircleUser className="w-4 h-4" />
                    Mi Cuenta
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Modern Sidebar */}
        <aside className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 p-6 flex flex-col space-y-2 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("home")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                activeTab === "home"
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50",
              )}
            >
              <Home className="w-4 h-4" />
              Inicio
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50",
              )}
            >
              <BarChart2 className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab("reportes")}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
                activeTab === "reportes"
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50",
              )}
            >
              <FileChartLine className="w-4 h-4" />
              Reportes
            </button>
          </nav>

          <div className="flex-1" />

          <button
            onClick={() => setActiveTab("config")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
              activeTab === "config"
                ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50",
            )}
          >
            <Settings className="w-4 h-4" />
            Configuración
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "home" && (
            <section className="p-8">
              <div className="flex items-start gap-8 min-h-screen">
                <div className="flex-1">
                  <AISummary />
                  {/* Search Header */}
                  <div className="mb-8">
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Buscar menciones..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mb-6">
                    <Tabs value={order} onValueChange={setOrder}>
                      <TabsList className="bg-slate-800/50 border-slate-700/50">
                        <TabsTrigger
                          value="recent"
                          className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-white"
                        >
                          Más recientes
                        </TabsTrigger>
                        <TabsTrigger
                          value="popular"
                          className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-white"
                        >
                          Más populares
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <Button
                      onClick={() => setOnlyFavorites(!onlyFavorites)}
                      variant={onlyFavorites ? "default" : "outline"}
                      className={cn(
                        "flex items-center gap-2",
                        onlyFavorites
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          : "border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50",
                      )}
                    >
                      <Star className="w-4 h-4" />
                      Destacados
                    </Button>
                  </div>

                  {/* Mentions Feed */}
                  <div className="space-y-4">
                    {mentionsLoading ? (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6"
          >
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    ) : homeMentions.length ? (
                      <>
                        {homeMentions.map((m) => (
                          <div
                            key={m.mention_id}
                            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-200"
                          >
                            <MentionCard
                              mention={m}
                              source={m.platform}
                              username={m.source}
                              timestamp={formatDistanceToNow(new Date(m.created_at), {
                                addSuffix: true,
                                locale: es,
                              })}
                              content={m.mention}
                              keyword={m.keyword}
                              url={m.url}
                              onHide={() => setHiddenMentions((prev) => [...prev, m.url])}
                              onToggleHighlight={toggleHighlight}
                              tags={getTagsForMention(m)}
                              aiTags={m.ai_classification_tags || []}
                            />
                          </div>
                        ))}
                        {isLoadingMore && (
                          <div className="text-center py-4 text-sm text-slate-400">
                            Cargando...
                          </div>
                        )}
                        <div ref={sentinelRef} />
                      </>
                    ) : mentions.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">Estamos recolectando menciones...</p>
                        <p className="text-slate-500 text-sm">Aparecerán aquí en breve.</p>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">No se han encontrado menciones</p>
                        <p className="text-slate-500 text-sm">Intenta ajustar tus filtros o palabras clave</p>
                      </div>
                    )}
                  </div>
                </div>

                <RightSidebar
                  className="mt-0 ml-auto"
                  sources={sourcesFilter}
                  toggleSource={toggleSourceFilter}
                  keywords={keywordsFilter}
                  setKeywords={setKeywordsFilter}
                  keywordOptions={activeKeywords}
                  tags={tagsFilter}
                  toggleTag={toggleTagFilter}
                  aiTags={aiTagsFilter}
                  toggleAiTag={toggleAiTagFilter}
                  aiTagOptions={allAiTagOptions}
                  sentiments={sentimentFilter}
                  toggleSentiment={toggleSentimentFilter}
                  sentimentOptions={allSentimentOptions}
                  clearFilters={clearSidebarFilters}
                />
              </div>
            </section>
          )}

          {activeTab === "dashboard" && (
            <section className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                  Dashboard
                </h1>
                <p className="text-slate-400 mb-6">Revela tendencias y patrones de tus menciones y palabras clave</p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-4 mb-8 p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-300">Palabras clave</p>
                  <MultiSelect
                    className="w-64"
                    options={[
                      { value: "all", label: "Todas" },
                      ...activeKeywords.map((k) => ({
                        value: k.keyword,
                        label: k.keyword,
                      })),
                    ]}
                    value={selectedDashboardKeywords}
                    onChange={setSelectedDashboardKeywords}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-300">Rango de fechas</p>
                  <div className="flex items-center gap-2">
                    <DatePickerInput value={startDate} onChange={setStartDate} placeholder="Desde" className="w-40" />
                    <span className="text-slate-400">a</span>
                    <DatePickerInput value={endDate} onChange={setEndDate} placeholder="Hasta" className="w-40" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-slate-300">Plataformas</p>
                  <MultiSelect
                    className="w-40"
                    options={[
                      { value: "all", label: "Todas" },
                      { value: "youtube", label: "YouTube" },
                      { value: "reddit", label: "Reddit" },
                      { value: "twitter", label: "Twitter" },
                    ]}
                    value={selectedDashboardPlatforms}
                    onChange={setSelectedDashboardPlatforms}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearDashboardFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              </div>

              {mentionsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-blue-400" />
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                                >
                                  {kpiMoMDisplay}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>En comparación con el mes pasado</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{kpiTotal.toLocaleString()}</div>
                        <div className="text-sm text-slate-400">Total de menciones</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-purple-400" />
                          </div>
                          <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {`${badgePlatformActive} Activas`}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{kpiPlatformCount}</div>
                        <div className="text-sm text-slate-400">Plataformas</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          </div>
                          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
                            {`${badgeKeywordsActive} Activas`}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{kpiKeywordCount}</div>
                        <div className="text-sm text-slate-400">Palabras clave</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm h-[400px]">
                      <CardContent className="p-6 space-y-4 h-full flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <p className="font-semibold text-white">Palabras más mencionadas</p>
                        </div>
                          <div className="flex-1">
                            {dashLoading ? (
                              <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin" />
                              </div>
                            ) : (
                              <WordCloud words={topWords} />
                            )}
                          </div>
                        </CardContent>
                      </Card>

                    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm h-[400px]">
                      <CardContent className="p-6 space-y-4 h-full flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <p className="font-semibold text-white">Menciones por plataforma</p>
                        </div>
                        <div className="flex-1">
                          {dashLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                          ) : (
                            <PlatformBarChart data={platCounts} />
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm h-[400px]">
                      <CardContent className="p-6 space-y-4 h-full flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <p className="font-semibold text-white">Fuentes más activas</p>
                        </div>
                        <div className="flex-1">
                          {dashLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                          ) : (
                            <ActiveSourcesBarChart data={sourceTop} />
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm h-[400px] lg:col-span-3">
                      <CardContent className="p-6 space-y-4 h-full flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <p className="font-semibold text-white">Evolución de menciones</p>
                        </div>
                        <div className="flex-1">
                          {dashLoading ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                          ) : (
                            <MentionsLineChart data={series} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </section>
          )}

          {activeTab === "reportes" && (
            <section className="p-8 space-y-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                  Mis Reportes
                </h1>
                <p className="text-slate-400">Crea y gestiona tus reportes descargables</p>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <ReportsTable reports={savedReports} onDownload={handleDownloadReport} onDelete={handleDeleteReport} />
              </div>

              <Button
                variant="outline"
                onClick={() => setShowReportForm(!showReportForm)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {showReportForm ? (
                  <Minus className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Crear nuevo reporte
              </Button>

              {showReportForm && (
                <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-white">Nuevo Reporte</h3>

                  <div>
                    <p className="text-sm font-medium mb-2 text-slate-300">Nombre del reporte</p>
                    <Input
                      className="bg-slate-800/50 border-slate-700/50 text-white"
                      value={newReportName}
                      onChange={(e) => setNewReportName(e.target.value)}
                      placeholder="Ingresa un nombre para el reporte"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3 text-slate-300">Plataforma</p>
                    <Select
                      value={reportPlatform}
                      onValueChange={(value) => {
                        setReportPlatform(value)
                        if (value !== "youtube" && value !== "reddit") {
                          setIncludeComments(false)
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="reddit">Reddit</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2 text-slate-300">Palabra clave</p>
                    <Select value={reportKeyword} onValueChange={setReportKeyword}>
                      <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeKeywords.map((k) => (
                          <SelectItem key={k.keyword} value={k.keyword}>
                            {k.keyword}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2 text-slate-300">Rango de fechas</p>
                    <div className="space-y-3">
                      <Select value={reportDateOption} onValueChange={setReportDateOption}>
                        <SelectTrigger className="w-full bg-slate-800/50 border-slate-700/50 text-white">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="range">Rango personalizado</SelectItem>
                          <SelectItem value="7">Últimos 7 días</SelectItem>
                          <SelectItem value="15">Últimos 15 días</SelectItem>
                          <SelectItem value="30">Últimos 30 días</SelectItem>
                        </SelectContent>
                      </Select>
                      {reportDateOption === "range" && (
                        <div className="flex items-center gap-2">
                          <DatePickerInput
                            value={reportStartDate}
                            onChange={setReportStartDate}
                            placeholder="Desde"
                            className="w-40"
                          />
                          <span className="text-slate-400">a</span>
                          <DatePickerInput
                            value={reportEndDate}
                            onChange={setReportEndDate}
                            placeholder="Hasta"
                            className="w-40"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3 text-slate-300">Incluir comentarios</p>
                    <Select
                      value={includeComments ? "si" : "no"}
                      onValueChange={(val) => setIncludeComments(val === "si")}
                      disabled={!(reportPlatform === "youtube" || reportPlatform === "reddit")}
                    >
                      <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="si">Si</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCreateReport}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Crear reporte
                  </Button>
                </div>
              )}
            </section>
          )}

          {activeTab === "account" && (
            <section className="p-8 max-w-2xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                  Mi Cuenta
                </h1>
                <p className="text-slate-400">Gestiona tu información personal y configuración</p>
              </div>

              <div className="space-y-8">
                <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Correo electrónico</label>
                      <Input className="bg-slate-800/50 border-slate-700/50 text-white" value={accountEmail} readOnly />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Nombre de usuario</label>
                      <div className="flex items-center gap-3">
                        <Input
                          className="bg-slate-800/50 border-slate-700/50 text-white flex-1"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                        />
                        {accountName !== originalAccountName && (
                          <Button
                            onClick={handleSaveAccountName}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          >
                            Guardar
                          </Button>
                        )}
                      </div>
                      {nameMessage && (
                        <p
                          className={`text-sm mt-2 ${nameMessage.type === "error" ? "text-red-400" : "text-green-400"}`}
                        >
                          {nameMessage.text}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white">Seguridad</h3>

                    <Button
                      onClick={togglePasswordFields}
                      variant="outline"
                      className="border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 bg-transparent"
                    >
                      Cambiar contraseña
                    </Button>

                    {showPasswordFields && (
                      <div className="space-y-4 pt-4 border-t border-slate-700/50">
                        <Input
                          className="bg-slate-800/50 border-slate-700/50 text-white"
                          type="password"
                          placeholder="Contraseña actual"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Input
                          className="bg-slate-800/50 border-slate-700/50 text-white"
                          type="password"
                          placeholder="Nueva contraseña"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button
                          onClick={handleChangePassword}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          Guardar cambios
                        </Button>
                      </div>
                    )}

                    {passwordMessage && (
                      <p className={`text-sm ${passwordMessage.type === "error" ? "text-red-400" : "text-green-400"}`}>
                        {passwordMessage.text}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {activeTab === "config" && (
            <section className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                  Configuración
                </h1>
                <p className="text-slate-400">Gestiona tus palabras clave y configuración del sistema</p>
              </div>

              <div className="space-y-8">
                <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white">Agregar nueva keyword</h3>
                    <div className="flex items-center gap-3">
                      <Input
                        className="flex-1 bg-slate-800/50 border-slate-700/50 text-white"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Nueva keyword"
                      />
                      <Button
                        onClick={openKeywordLangSelector}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                    {showKeywordLangs && (
                      <div className="flex items-center gap-3 mt-4">
                        <Select value={newKeywordLang} onValueChange={setNewKeywordLang}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecciona un idioma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">Inglés</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={saveNewKeyword}
                          disabled={!newKeywordLang}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                        >
                          Guardar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowKeywordLangs(false)
                            setNewKeywordLang("")
                          }}
                          className="border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 bg-transparent"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                    {addKeywordMessage && (
                      <p
                        className={`text-sm ${addKeywordMessage.type === "error" ? "text-red-400" : "text-green-400"}`}
                      >
                        {addKeywordMessage.text}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
                  <CardContent className="p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white">Palabras clave</h3>
                    {keywords.length ? (
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <KeywordTable keywords={keywords} onToggle={handleKeywordToggle} />
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No hay keywords configuradas</p>
                        <p className="text-slate-500 text-sm">Agrega tu primera keyword para comenzar</p>
                      </div>
                    )}

                    <Button
                      onClick={saveKeywordChanges}
                      disabled={Object.keys(keywordChanges).length === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                    >
                      Guardar cambios
                    </Button>

                    {saveKeywordMessage && (
                      <p
                        className={`text-sm ${saveKeywordMessage.type === "error" ? "text-red-400" : "text-green-400"}`}
                      >
                        {saveKeywordMessage.text}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
