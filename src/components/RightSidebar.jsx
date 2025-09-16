"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  FilterX,
  Sparkles,
  TrendingUp,
  Users,
  MessageSquare,
  Hash,
  Globe,
  Tag,
  Zap,
  Smile,
  Meh,
  Frown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import MultiSelect from "@/components/MultiSelect"

export default function RightSidebar({
  className = "",
  sources,
  toggleSource,
  keywords,
  setKeywords,
  keywordOptions = [],
  tags = [],
  toggleTag,
  aiTags = [],
  toggleAiTag,
  aiTagOptions = [],
  sentiments = [],
  toggleSentiment,
  sentimentOptions = [],
  clearFilters,
}) {
  const handleClearFilters = () => clearFilters()

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

  const aiTagClass = "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20"
  const sentimentConfig = {
    positive: {
      text: "Positivo",
      icon: Smile,
      className: "bg-green-500/10 text-green-400 border border-green-500/20",
    },
    neutral: {
      text: "Neutral",
      icon: Meh,
      className: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
    },
    negative: {
      text: "Negativo",
      icon: Frown,
      className: "bg-red-500/10 text-red-400 border border-red-500/20",
    },
  }

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "w-80 bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl",
          "self-start flex flex-col overflow-hidden",
          className,
        )}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
              <FilterX className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-white">Filtros</h3>
          </div>
          <p className="text-sm text-slate-400">Refina tu búsqueda de menciones</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Keywords */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" />
              <h4 className="font-medium text-white">Palabras clave</h4>
            </div>
            <MultiSelect
              options={[
                { value: "all", label: "Todas las palabras clave" },
                ...keywordOptions.map((k) => ({ value: k.keyword, label: k.keyword })),
              ]}
              value={keywords}
              onChange={setKeywords}
              className="w-full"
            />
          </div>

          {/* Sources */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              <h4 className="font-medium text-white">Fuentes</h4>
            </div>

            <div className="grid grid-cols-2 gap-x-4">
              <div className="space-y-3">
                {[
                  { id: "youtube", label: "YouTube" },
                  { id: "reddit", label: "Reddit" },
                  { id: "twitter", label: "Twitter", disabled: true },
                  { id: "tiktok", label: "TikTok", disabled: true },
                ].map((s) => (
                  <Tooltip key={s.id}>
                    <TooltipTrigger asChild>
                      <label
                        htmlFor={s.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                          "hover:bg-slate-800/50",
                          s.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                        )}
                      >
                        <Checkbox
                          id={s.id}
                          checked={sources.includes(s.id)}
                          onCheckedChange={!s.disabled ? () => toggleSource(s.id) : undefined}
                          disabled={s.disabled}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <span className={cn("text-sm", s.disabled ? "text-slate-500" : "text-slate-300")}>
                          {s.label}
                        </span>
                      </label>
                    </TooltipTrigger>
                    {s.disabled && (
                      <TooltipContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50 text-slate-300">
                        No disponible en versión gratuita
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
              <div className="space-y-3">
                {[
                  { id: "instagram", label: "Instagram", disabled: true },
                  { id: "facebook", label: "Facebook", disabled: true },
                  { id: "otros", label: "Otros", disabled: true },
                ].map((s) => (
                  <Tooltip key={s.id}>
                    <TooltipTrigger asChild>
                      <label
                        htmlFor={s.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg transition-all duration-200 cursor-pointer",
                          "hover:bg-slate-800/50",
                          s.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent",
                        )}
                      >
                        <Checkbox
                          id={s.id}
                          checked={sources.includes(s.id)}
                          onCheckedChange={!s.disabled ? () => toggleSource(s.id) : undefined}
                          disabled={s.disabled}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <span className={cn("text-sm", s.disabled ? "text-slate-500" : "text-slate-300")}>
                          {s.label}
                        </span>
                      </label>
                    </TooltipTrigger>
                    {s.disabled && (
                      <TooltipContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50 text-slate-300">
                        No disponible en versión gratuita
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Tags */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              <h4 className="font-medium text-white">Etiquetas</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tagConfig).map(([id, config]) => {
                const TagIcon = config.icon
                return (
                  <Badge
                    key={id}
                    onClick={() => toggleTag(id)}
                    className={cn(
                      config.className,
                      "rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all duration-200",
                      tags.includes(id) ? "" : "opacity-50 hover:opacity-75",
                    )}
                    variant="secondary"
                  >
                    <TagIcon className="w-3 h-3" />
                    {config.text}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* AI Classification */}
          {aiTagOptions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="font-medium text-white">Clasificación AI</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiTagOptions.map((tag) => (
                  <Badge
                    key={tag}
                    onClick={() => toggleAiTag(tag)}
                    className={cn(
                      aiTagClass,
                      "rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all duration-200",
                      aiTags.includes(tag) ? "" : "opacity-50 hover:opacity-75",
                    )}
                    variant="secondary"
                  >
                    <Sparkles className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment */}
          {sentimentOptions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-green-400" />
                <h4 className="font-medium text-white">Sentimiento</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {sentimentOptions.map((sentiment) => {
                  const config = sentimentConfig[sentiment] || {
                    text: sentiment,
                    icon: Sparkles,
                    className: "bg-slate-500/10 text-slate-300 border border-slate-500/20",
                  }
                  const SentimentIcon = config.icon
                  return (
                    <Badge
                      key={sentiment}
                      onClick={() => toggleSentiment?.(sentiment)}
                      className={cn(
                        config.className,
                        "rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all duration-200",
                        sentiments.includes(sentiment) ? "" : "opacity-50 hover:opacity-75",
                      )}
                      variant="secondary"
                    >
                      <SentimentIcon className="w-3 h-3" />
                      {config.text}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-slate-700/50 bg-slate-800/20">
          <Button
            onClick={handleClearFilters}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all duration-200"
          >
            <FilterX className="w-4 h-4 mr-2" />
            Limpiar todos los filtros
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
