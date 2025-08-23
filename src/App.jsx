import { useState, useEffect, useMemo } from "react"
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
} from "lucide-react"
import { formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import KeywordTable from "@/components/KeywordTable"
import ReportsTable from "@/components/ReportsTable"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const [rangeFilter, setRangeFilter] = useState("7")
  const [sourcesFilter, setSourcesFilter] = useState([])
  const [keywordsFilter, setKeywordsFilter] = useState(["all"])
  const [tagsFilter, setTagsFilter] = useState([])
  const [order, setOrder] = useState("recent")
  const [hiddenMentions, setHiddenMentions] = useState([])
  const [keywords, setKeywords] = useState([])
  const [selectedDashboardKeywords, setSelectedDashboardKeywords] = useState(["all"])
  const [selectedDashboardPlatforms, setSelectedDashboardPlatforms] = useState(["all"])
  const [newKeyword, setNewKeyword] = useState("")
  const [addKeywordMessage, setAddKeywordMessage] = useState(null)
  const [saveKeywordMessage, setSaveKeywordMessage] = useState(null)
  const [keywordChanges, setKeywordChanges] = useState({})
  const navigate = useNavigate()
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

  const metricMedians = useMemo(() => {
    const medians = { twitter: {}, youtube: {}, reddit: {} }
    const metricsByPlatform = {
      twitter: ["likes", "retweets", "conversation"],
      youtube: ["likes", "views", "comments"],
      reddit: ["likes", "comments"],
    }

    const getValue = (m, platform, metric) => {
      if (platform === "twitter" && metric === "conversation") {
        return (m.replies ?? 0) + (m.quotes ?? 0)
      }
      return m[metric] ?? 0
    }

    Object.keys(medians).forEach((platform) => {
      const items = mentions.filter((m) => m.platform?.toLowerCase() === platform)
      metricsByPlatform[platform].forEach((metric) => {
        const values = items
          .map((m) => getValue(m, platform, metric))
          .sort((a, b) => a - b)
        const mid = Math.floor(values.length / 2)
        let median = 0
        if (values.length) {
          median =
            values.length % 2 !== 0
              ? values[mid]
              : (values[mid - 1] + values[mid]) / 2
        }
        medians[platform][metric] = median
      })
    })

    return medians
  }, [mentions])

  const getTagsForMention = (mention) => {
    const platform = mention.platform?.toLowerCase?.()
    const platformMedians = metricMedians[platform] || {}
    const tags = []

    if (platform === "youtube") {
      if ((mention.likes ?? 0) > (platformMedians.likes ?? 0)) tags.push("approval")
      if ((mention.views ?? 0) > (platformMedians.views ?? 0)) tags.push("reach")
      if ((mention.comments ?? 0) > (platformMedians.comments ?? 0)) tags.push("conversation")
    } else if (platform === "reddit") {
      if ((mention.likes ?? 0) > (platformMedians.likes ?? 0)) tags.push("approval")
      if ((mention.comments ?? 0) > (platformMedians.comments ?? 0)) tags.push("conversation")
    } else {
      if ((mention.likes ?? 0) > (platformMedians.likes ?? 0)) tags.push("approval")
      if ((mention.retweets ?? 0) > (platformMedians.retweets ?? 0)) tags.push("reach")
      const convo = (mention.replies ?? 0) + (mention.quotes ?? 0)
      if (convo > (platformMedians.conversation ?? 0)) tags.push("conversation")
    }

    return tags
  }

  // All your existing filtering and processing logic remains the same
  const filteredMentions = mentions.filter((m) => {
    const matchesSearch =
      m.mention?.toLowerCase?.().includes(search.toLowerCase()) || m.source?.toLowerCase?.().includes(search.toLowerCase())

    const matchesSource = sourcesFilter.length === 0 || sourcesFilter.includes(m.platform?.toLowerCase())

    const matchesRange =
      !rangeFilter ||
      (() => {
        const days = Number.parseInt(rangeFilter, 10)
        const created = new Date(m.created_at)
        const now = new Date()
        const diff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
        return diff <= days
      })()

    const matchesKeyword = keywordsFilter.includes("all") || keywordsFilter.includes(m.keyword)
    const mentionTags = getTagsForMention(m)
    const matchesTag = tagsFilter.length === 0 || tagsFilter.some((t) => mentionTags.includes(t))
    return matchesSearch && matchesSource && matchesRange && matchesKeyword && matchesTag
  })

  const sortedMentions = [...filteredMentions].sort((a, b) => {
    if (order === "recent") {
      const dateA = typeof a.created_at === "string" ? parseISO(a.created_at) : new Date(a.created_at)
      const dateB = typeof b.created_at === "string" ? parseISO(b.created_at) : new Date(b.created_at)
      return dateB.getTime() - dateA.getTime()
    }
    if (order === "popular") {
      const likesDiff = (b.likes ?? 0) - (a.likes ?? 0)
      if (likesDiff !== 0) return likesDiff

      const commentsA = a.comments ?? a.replies ?? 0
      const commentsB = b.comments ?? b.replies ?? 0
      const commentsDiff = commentsB - commentsA
      if (commentsDiff !== 0) return commentsDiff

      const restA = (a.retweets ?? 0) + (a.quotes ?? 0) + (a.views ?? 0)
      const restB = (b.retweets ?? 0) + (b.quotes ?? 0) + (b.views ?? 0)
      return restB - restA
    }

    return 0
  })

  const visibleMentions = sortedMentions.filter((m) => !hiddenMentions.includes(m.url))
  const homeMentions = visibleMentions

  // ========== FETCH (ARREGLADO): base + top_3_comments_vw por content_id ==========
  const fetchMentions = async () => {
    setMentionsLoading(true)
    // 1) Traigo menciones base SIN joins anidados
    const { data: base, error: errBase } = await supabase
      .from("total_mentions_vw")
      .select("*")
      .order("created_at", { ascending: false })

    if (errBase) {
      console.error("Error fetching mentions (base)", errBase)
      setMentions([])
      setMentionsLoading(false)
      return
    }

    const rows = base || []
    if (rows.length === 0) {
      setMentions([])
      setMentionsLoading(false)
      return
    }

    // 2) Armo lista de content_id para buscar top comments
    const contentIds = rows.map((r) => r.content_id).filter(Boolean)

    let topCommentsById = {}
    try {
      const { data: tc, error: errTc } = await supabase
        .from("top_3_comments_vw")
        .select("content_id, likes, comment")
        .in("content_id", contentIds)

      if (errTc) {
        console.error("Error fetching top_3_comments_vw", errTc)
      } else {
        topCommentsById = (tc || []).reduce((acc, item) => {
          const k = item.content_id
          if (!k) return acc
          if (!acc[k]) acc[k] = []
          acc[k].push({ likes: item.likes, comment: item.comment })
          return acc
        }, {})

        // Aseguro top 3 por likes
        for (const k of Object.keys(topCommentsById)) {
          topCommentsById[k] = topCommentsById[k]
            .sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
            .slice(0, 3)
        }
      }
    } catch (e) {
      console.error("Top comments fetch blew up", e)
    }

    // 3) Uno resultados sin pisar la métrica numérica `comments`
    const enriched = rows.map((r) => ({
      ...r,
      top_comments: topCommentsById[r.content_id] || [],
    }))

    // Nota: reemplazo directo para evitar estados viejos/dedupe que escondan resultados
    setMentions(enriched)
    setMentionsLoading(false)
  }

  const fetchKeywords = async () => {
    const { data, error } = await supabase
      .from("dim_keywords")
      .select(
        "keyword, keyword_id, created_at, active, last_processed_at_yt, last_processed_at_rd, last_processed_at_tw",
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

  const addKeyword = async () => {
    if (!newKeyword.trim()) return
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
        keyword: newKeyword,
        user_id: user.id,
        created_at: new Date().toISOString(),
        active: false,
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
    fetchMentions()
    fetchKeywords()
    fetchAccount()
  }, [])

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

  const clearSidebarFilters = () => {
    setRangeFilter("7")
    setSourcesFilter([])
    setSearch("")
    setKeywordsFilter(["all"])
    setTagsFilter([])
  }

  const clearDashboardFilters = () => {
    setSelectedDashboardKeywords(["all"])
    setSelectedDashboardPlatforms(["all"])
    setStartDate("")
    setEndDate("")
  }

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

  const dashboardFilteredMentions = useMemo(() => {
    return mentions.filter((m) => {
      const isActive = activeKeywords.some((k) => k.keyword === m.keyword)
      if (!isActive) return false
      if (!selectedDashboardKeywords.includes("all") && !selectedDashboardKeywords.includes(m.keyword)) return false
      const platform = m.platform?.toLowerCase?.()
      if (!selectedDashboardPlatforms.includes("all") && !selectedDashboardPlatforms.includes(platform)) return false
      const created = new Date(m.created_at)
      if (startDate && created < new Date(startDate)) return false
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        if (created > end) return false
      }
      return true
    })
  }, [mentions, activeKeywords, selectedDashboardKeywords, selectedDashboardPlatforms, startDate, endDate])

  const totalActivePlatformCount = useMemo(() => {
    const activeMentions = mentions.filter((m) =>
      activeKeywords.some((k) => k.keyword === m.keyword),
    )
    return [
      ...new Set(activeMentions.map((m) => m.platform).filter(Boolean)),
    ].length
  }, [mentions, activeKeywords])

  const totalActiveKeywordCount = activeKeywords.length

  const monthlyMentionStats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

    let currentCount = 0
    let lastCount = 0

    mentions.forEach((m) => {
      const created = new Date(m.created_at)
      const platform = m.platform?.toLowerCase?.()
      if (!activeKeywords.some((k) => k.keyword === m.keyword)) return
      if (
        !selectedDashboardKeywords.includes("all") &&
        !selectedDashboardKeywords.includes(m.keyword)
      )
        return
      if (
        !selectedDashboardPlatforms.includes("all") &&
        !selectedDashboardPlatforms.includes(platform)
      )
        return

      const month = created.getMonth()
      const year = created.getFullYear()

      if (month === currentMonth && year === currentYear) currentCount++
      else if (month === lastMonth && year === lastMonthYear) lastCount++
    })

    return { currentCount, lastCount }
  }, [
    mentions,
    activeKeywords,
    selectedDashboardKeywords,
    selectedDashboardPlatforms,
  ])

  const mentionGrowth = useMemo(() => {
    const { currentCount, lastCount } = monthlyMentionStats
    if (lastCount === 0) return 0
    return ((currentCount - lastCount) / lastCount) * 100
  }, [monthlyMentionStats])

  const stopwords = useMemo(
    () =>
      new Set([
        "de",
        "la",
        "que",
        "y",
        "el",
        "en",
        "no",
        "se",
        "con",
        "los",
        "del",
        "un",
        "es",
        "por",
        "las",
        "para",
        "lo",
        "al",
        "si",
        "sin",
        "le",
        "su",
        "esta",
        "hay",
      ]),
    [],
  )

  const normalizeWord = (w) =>
    w
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()

  const wordCloudData = useMemo(() => {
    const counts = {}
    for (const m of dashboardFilteredMentions) {
      const words = m.mention
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-ZñÑüÜ\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
      for (const w of words) {
        const normalized = normalizeWord(w)
        if (normalized.length < 3) continue
        if (stopwords.has(normalized)) continue
        counts[normalized] = (counts[normalized] || 0) + 1
      }
    }
    return Object.entries(counts)
      .filter(([_, v]) => v >= 2)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30)
  }, [dashboardFilteredMentions, stopwords])

  const platformCounts = useMemo(() => {
    const counts = {}
    for (const m of dashboardFilteredMentions) {
      const platform = m.platform?.toLowerCase?.()
      if (!platform) continue
      counts[platform] = (counts[platform] || 0) + 1
    }
    return Object.entries(counts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count)
  }, [dashboardFilteredMentions])

  const sourceCounts = useMemo(() => {
    const counts = {}
    for (const m of dashboardFilteredMentions) {
      const name = m.source
      if (!name) continue
      counts[name] = (counts[name] || 0) + 1
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [dashboardFilteredMentions])

  const mentionsOverTime = useMemo(() => {
    const counts = {}
    for (const m of dashboardFilteredMentions) {
      const day = m.created_at.slice(0, 10)
      counts[day] = (counts[day] || 0) + 1
    }

    const dates = Object.keys(counts).sort()
    if (!dates.length) return []

    const start = startDate || dates[0]
    const end = endDate || dates[dates.length - 1]

    const result = []
    const current = new Date(start)
    const endDt = new Date(end)
    while (current <= endDt) {
      const key = current.toISOString().slice(0, 10)
      result.push({ date: key, count: counts[key] || 0 })
      current.setDate(current.getDate() + 1)
    }

    return result
  }, [dashboardFilteredMentions, startDate, endDate])

  // Get stats for dashboard
  const totalMentions = dashboardFilteredMentions.length
  const activePlatforms = [...new Set(dashboardFilteredMentions.map((m) => m.platform).filter(Boolean))].length
  const activeKeywordCount = [...new Set(dashboardFilteredMentions.map((m) => m.keyword))].length

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

                  </div>

                  {/* Mentions Feed */}
                  <div className="space-y-4">
                    {mentionsLoading ? (
                      <div className="text-center py-12">
                        <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4 animate-spin" />
                        <p className="text-slate-400 text-lg">Cargando...</p>
                      </div>
                    ) : homeMentions.length ? (
                      homeMentions.map((m) => (
                        <div
                          key={m.url}
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
                            medians={metricMedians}
                          />
                        </div>
                      ))
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
                  range={rangeFilter}
                  setRange={setRangeFilter}
                  sources={sourcesFilter}
                  toggleSource={toggleSourceFilter}
                  keywords={keywordsFilter}
                  setKeywords={setKeywordsFilter}
                  keywordOptions={activeKeywords}
                  tags={tagsFilter}
                  toggleTag={toggleTagFilter}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-blue-400" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        title="En comparación con el mes pasado"
                      >
                        {`${mentionGrowth >= 0 ? "+" : ""}${mentionGrowth.toFixed(0)}%`}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{totalMentions.toLocaleString()}</div>
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
                        {`${totalActivePlatformCount} Activas`}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{activePlatforms}</div>
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
                        {`${activeKeywords.length} Activas`}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{activeKeywords.length}</div>
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
                      <WordCloud words={wordCloudData} />
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
                      <PlatformBarChart data={platformCounts} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm h-[400px]">
                  <CardContent className="p-6 space-y-4 h-full flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="font-semibold text-white">Usuarios más activos</p>
                    </div>
                    <div className="flex-1">
                      <ActiveSourcesBarChart data={sourceCounts} />
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
                      <MentionsLineChart data={mentionsOverTime} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {activeTab === "reportes" && (
            <section className="p-8 space-y-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                  Mis Reportes
                </h1>
                <p className="text-slate-400">Crea y gestiona tus reportes personalizados</p>
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
                        onClick={addKeyword}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
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
