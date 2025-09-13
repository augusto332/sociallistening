"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { FaTwitter, FaYoutube, FaRedditAlien, FaEllipsisV } from "react-icons/fa"
import {
  Star,
  X,
  Heart,
  MessageCircle,
  Eye,
  ArrowBigUp,
  Repeat2,
  Quote,
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
  Smile,
  Meh,
  Frown,
  BarChart3,
} from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import he from "he"

export default function ModernMentionCard({
  mention,
  source = "twitter",
  username,
  timestamp,
  content,
  keyword,
  url,
  onHide,
  onToggleHighlight,
  showDismiss = true,
  tags = [], // precomputed tags
  aiTags = [], // AI classification tags
}) {
  const icons = {
    twitter: { Icon: FaTwitter, color: "#1DA1F2" },
    youtube: { Icon: FaYoutube, color: "#FF0000" },
    reddit: { Icon: FaRedditAlien, color: "#FFFFFF", bg: "#FF5700" },
  }
  const platform = source?.toLowerCase?.()
  const Icon = icons[platform]?.Icon || FaTwitter
  const iconColor = icons[platform]?.color || "#1DA1F2"
  const iconBg = icons[platform]?.bg
  const iconSizeClass = "size-7"

  const [expanded, setExpanded] = useState(false)
  const [optionsOpen, setOptionsOpen] = useState(false)
  const favorite = mention.is_highlighted === true || mention.is_highlighted === "true"

  const topComments = Array.isArray(mention?.top_comments) ? mention.top_comments : []

  const handleFavClick = async (e) => {
    e.stopPropagation()
    if (onToggleHighlight) {
      await onToggleHighlight(mention)
    }
  }

  // Get mention sentiment (for the main post)
  // TODO: Replace hardcoded sentiment with real data from mention.sentiment or mention.mention_sentiment
  const getMentionSentiment = () => {
    // Hardcoded positive sentiment for testing - replace with real data later
    const mentionSentiment = "positive"

    const sentimentConfig = {
      positive: { icon: Smile, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
      neutral: { icon: Meh, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
      negative: { icon: Frown, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    }

    const config = sentimentConfig[mentionSentiment.toLowerCase()]
    if (!config) return null

    const SentimentIcon = config.icon
    return (
      <Badge
        variant="secondary"
        className={`${config.bg} ${config.color} ${config.border} rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5`}
      >
        <SentimentIcon className="w-3 h-3" />
        {mentionSentiment.charAt(0).toUpperCase() + mentionSentiment.slice(1)}
      </Badge>
    )
  }

  // Get comments sentiment preview
  const getCommentsSentimentPreview = () => {
    if (!["youtube", "reddit"].includes(platform) || !topComments.length) return null

    const total = Number(mention.comments) || 0
    if (total === 0) return null

    const positivePercent = Number(mention.comments_positive_pct) || 0
    const neutralPercent = Number(mention.comments_neutral_pct) || 0
    const negativePercent = Number(mention.comments_negative_pct) || 0

    // Determine dominant sentiment
    let dominantSentiment = "neutral"
    let dominantPercent = neutralPercent
    let dominantIcon = Meh
    let dominantColor = "text-slate-400"

    if (positivePercent > neutralPercent && positivePercent > negativePercent) {
      dominantSentiment = "positive"
      dominantPercent = positivePercent
      dominantIcon = Smile
      dominantColor = "text-green-400"
    } else if (negativePercent > positivePercent && negativePercent > neutralPercent) {
      dominantSentiment = "negative"
      dominantPercent = negativePercent
      dominantIcon = Frown
      dominantColor = "text-red-400"
    }

    const DominantIcon = dominantIcon

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <BarChart3 className="w-3 h-3 text-slate-400" />
            <div className="flex items-center gap-1">
              <DominantIcon className={`w-3 h-3 ${dominantColor}`} />
              <span className={`text-xs font-medium ${dominantColor}`}>{dominantPercent.toFixed(0)}%</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <div className="text-xs font-medium">Sentimiento de comentarios:</div>
            <div className="flex items-center gap-2 text-xs">
              <Smile className="w-3 h-3 text-green-400" />
              <span className="text-green-400">{positivePercent.toFixed(1)}%</span>
              <Meh className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400">{neutralPercent.toFixed(1)}%</span>
              <Frown className="w-3 h-3 text-red-400" />
              <span className="text-red-400">{negativePercent.toFixed(1)}%</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  const renderSentimentAnalysis = () => {
    // Only show for YouTube and Reddit (platforms with comments)
    if (!["youtube", "reddit"].includes(platform) || !topComments.length) return null

    const total = Number(mention.comments) || 0
    if (total === 0) return null

    const positivePercent = Number(mention.comments_positive_pct) || 0
    const neutralPercent = Number(mention.comments_neutral_pct) || 0
    const negativePercent = Number(mention.comments_negative_pct) || 0

    const positiveCount = Math.round((positivePercent / 100) * total)
    const neutralCount = Math.round((neutralPercent / 100) * total)
    const negativeCount = Math.round((negativePercent / 100) * total)

    return (
      <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-white">Análisis de sentimiento</span>
          <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs">
            {total} comentarios
          </Badge>
        </div>

        {/* Sentiment Bars */}
        <div className="space-y-3">
          {/* Positive */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-20">
              <Smile className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-400">{positivePercent.toFixed(1)}%</span>
            </div>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${positivePercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-12 text-right">{positiveCount}</span>
          </div>

          {/* Neutral */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-20">
              <Meh className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-400">{neutralPercent.toFixed(1)}%</span>
            </div>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full transition-all duration-500"
                style={{ width: `${neutralPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-12 text-right">{neutralCount}</span>
          </div>

          {/* Negative */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-20">
              <Frown className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">{negativePercent.toFixed(1)}%</span>
            </div>
            <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${negativePercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-12 text-right">{negativeCount}</span>
          </div>
        </div>

        {/* Overall Sentiment Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Sentimiento general:</span>
            <div className="flex items-center gap-2">
              {positivePercent > negativePercent && positivePercent > neutralPercent ? (
                <>
                  <Smile className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">Positivo</span>
                </>
              ) : negativePercent > positivePercent && negativePercent > neutralPercent ? (
                <>
                  <Frown className="w-3 h-3 text-red-400" />
                  <span className="text-xs font-medium text-red-400">Negativo</span>
                </>
              ) : (
                <>
                  <Meh className="w-3 h-3 text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">Neutral</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMetrics = () => {
    const metricMap = {
      youtube: [
        { key: "likes", icon: Heart, label: "Me gusta" },
        { key: "comments", icon: MessageCircle, label: "Comentarios" },
        { key: "views", icon: Eye, label: "Visualizaciones" },
      ],
      reddit: [
        { key: "likes", icon: ArrowBigUp, label: "Votos" },
        { key: "comments", icon: MessageCircle, label: "Comentarios" },
      ],
      twitter: [
        { key: "likes", icon: Heart, label: "Me gusta" },
        { key: "retweets", icon: Repeat2, label: "Retweets" },
        { key: "replies", icon: MessageCircle, label: "Respuestas" },
        { key: "quotes", icon: Quote, label: "Citas" },
      ],
    }

    const metrics = metricMap[platform] || []
    if (!metrics.length) return null

    const capturedAt = new Date(mention.created_at).toLocaleString()

    return (
      <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-6 text-sm text-slate-400 flex-wrap">
          {metrics.map((m) => {
            const MetricIcon = m.icon
            const value = mention[m.key] ?? 0
            return (
              <div key={m.key} className="flex items-center gap-2">
                <MetricIcon className="w-4 h-4" />
                <span className="font-medium text-slate-300">{value.toLocaleString()}</span>
                <span className="text-slate-500">{m.label}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500">Capturado el {capturedAt}</div>
      </div>
    )
  }

  const tagConfig = {
    approval: {
      text: "Muy valorado",
      icon: TrendingUp,
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    reach: {
      text: "Gran alcance",
      icon: Users,
      className: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    conversation: {
      text: "Generó conversación",
      icon: MessageSquare,
      className: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  }

  const renderQualitativeTags = () => {
    if (!tags.length) return null

    return (
      <div className="flex items-center gap-2 flex-wrap mt-3">
        {tags.map((type, i) => {
          const config = tagConfig[type]
          if (!config) return null
          const TagIcon = config.icon
          return (
            <Badge
              key={`tag-${i}`}
              variant="secondary"
              className={`${config.className} rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5`}
            >
              <TagIcon className="w-3 h-3" />
              {config.text}
            </Badge>
          )
        })}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Card
        onClick={() => setExpanded((e) => !e)}
        className="relative bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:bg-gradient-to-br hover:from-slate-800/70 hover:to-slate-800/50 transition-all duration-200 rounded-xl cursor-pointer shadow-lg w-full"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOptionsOpen((o) => !o)
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-700/50"
            >
              <FaEllipsisV className="w-3 h-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Opciones</TooltipContent>
        </Tooltip>

        {optionsOpen && (
          <div className="absolute right-4 top-12 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-lg p-2 space-y-1 z-50 min-w-[200px]">
            {showDismiss && (
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  setOptionsOpen(false)
                  const confirmed = window.confirm(
                    "¿Estás seguro de que deseas marcar esta mención como irrelevante? Las menciones irrelevantes ya no se mostrarán.",
                  )
                  if (!confirmed) return
                  try {
                    await supabase
                      .from("fact_mentions")
                      .update({ is_relevant: false })
                      .eq("content_id", mention.content_id)
                    if (onHide) onHide()
                  } catch (error) {
                    console.error("Error updating mention relevance", error)
                  }
                }}
                className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Marcar como irrelevante
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOptionsOpen(false)
                handleFavClick(e)
              }}
              className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
            >
              <Star className={`w-4 h-4 ${favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
              {favorite ? "Remover de destacados" : "Agregar a destacados"}
            </button>
          </div>
        )}

        <CardContent className="p-6 w-full">
          <div className="flex gap-4">
            {/* Platform Icon */}
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${!iconBg ? "bg-slate-700/50" : ""}`}
              style={iconBg ? { backgroundColor: iconBg } : {}}
            >
              <Icon className={iconSizeClass} style={{ color: iconColor }} />
            </div>

            <div className="flex-1 space-y-3 min-w-0">
              {/* AI Classification Tags + Sentiment Badges - Top Position */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* AI Tags */}
                {aiTags.map((tag, i) => (
                  <Badge
                    key={`ai-${i}`}
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}

                {/* Mention Sentiment Badge */}
                {getMentionSentiment()}

                {/* Keyword Badge */}
                {keyword && (
                  <Badge
                    variant="secondary"
                    className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs px-2 py-1"
                  >
                    {keyword}
                  </Badge>
                )}
              </div>

              {/* If no AI tags, show keyword and sentiment */}
              {aiTags.length === 0 && (keyword || getMentionSentiment()) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {getMentionSentiment()}
                  {keyword && (
                    <Badge
                      variant="secondary"
                      className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs px-2 py-1"
                    >
                      {keyword}
                    </Badge>
                  )}
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between gap-3 min-w-0">
                <span className="font-semibold text-white">@{username}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Comments Sentiment Preview */}
                  {!expanded && getCommentsSentimentPreview()}
                  <span className="text-xs text-slate-500">{timestamp}</span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1">
                <p className="text-slate-300 leading-relaxed">{he.decode(content)}</p>
              </div>

              {/* Qualitative Tags */}
              {renderQualitativeTags()}

              {/* Metrics */}
              {expanded && renderMetrics()}

              {/* Sentiment Analysis - Only for YouTube and Reddit */}
              {expanded && renderSentimentAnalysis()}

              {/* Top Comments */}
              {expanded && topComments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-semibold text-white">Comentarios destacados</span>
                  </div>

                  <div className="space-y-3">
                    {topComments.map((c, i) => {
                      const CommentIcon = platform === "reddit" ? ArrowBigUp : Heart
                      return (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-start gap-3 w-full"
                        >
                          <div className="flex-1 min-w-0 w-full">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p
                                  className="text-sm text-slate-300 leading-relaxed w-full overflow-hidden text-ellipsis"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                  }}
                                >
                                  {c.comment ? he.decode(c.comment) : "—"}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>{c.comment ? he.decode(c.comment) : "—"}</TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-slate-400 shrink-0">
                            <CommentIcon className="w-3 h-3" />
                            {c.comment_likes ?? 0}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action Button */}
              {expanded && url && (
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <Button
                    size="sm"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      Ver publicación original
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
