import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import {
  FaTwitter,
  FaYoutube,
  FaRedditAlien,
  FaEllipsisV,
} from "react-icons/fa";
import {
  Star,
  X,
  Heart,
  MessageCircle,
  Eye,
  ArrowBigUp,
  Repeat2,
  Quote,
} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
export default function MentionCard({
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
}) {
  const icons = {
    twitter: { Icon: FaTwitter, color: "#1DA1F2" },
    youtube: { Icon: FaYoutube, color: "#FF0000" },
    reddit: { Icon: FaRedditAlien, color: "#FFFFFF", bg: "#FF5700" },
  };
  const platform = source?.toLowerCase?.();
  const Icon = icons[platform]?.Icon || FaTwitter;
  const iconColor = icons[platform]?.color || "#1DA1F2";
  const iconBg = icons[platform]?.bg;
  const iconSizeClass = "size-7";

  const [expanded, setExpanded] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const favorite =
    mention.is_highlighted === true || mention.is_highlighted === "true";

  // ✅ top 3 comentarios vienen como array en mention.top_comments
  const topComments = Array.isArray(mention?.top_comments) ? mention.top_comments : [];

  const handleFavClick = async (e) => {
    e.stopPropagation();
    if (onToggleHighlight) {
      await onToggleHighlight(mention);
    }
  };

  const renderMetrics = () => {
    const metricMap = {
      youtube: [
        { key: "likes", icon: Heart },
        { key: "comments", icon: MessageCircle }, // conteo numérico
        { key: "views", icon: Eye },
      ],
      reddit: [
        { key: "likes", icon: ArrowBigUp },
        { key: "comments", icon: MessageCircle }, // conteo numérico
      ],
      twitter: [
        { key: "likes", icon: Heart },
        { key: "retweets", icon: Repeat2 },
        { key: "replies", icon: MessageCircle },
        { key: "quotes", icon: Quote },
      ],
    };

    const metrics = metricMap[platform] || [];
    if (!metrics.length) return null;

    const capturedAt = new Date(mention.created_at).toLocaleString();

    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
        {metrics.map((m) => {
          const MetricIcon = m.icon;
          const value = mention[m.key] ?? 0;
          return (
            <span key={m.key} className="flex items-center gap-1">
              <MetricIcon className="size-4" />
              {value}
            </span>
          );
        })}
        <span className="opacity-80">• Capturado el {capturedAt}</span>
      </div>
    );
  };

  const tagTexts = {
    approval: "Muy valorado",
    reach: "Gran alcance",
    conversation: "Generó conversación",
  };

  const tagClasses = {
    approval: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    reach: "bg-green-500/10 text-green-400 border-green-500/20",
    conversation: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  const renderTags = () => {
    if (!tags.length) return null;
    return (
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        {tags.map((type, i) => (
          <Badge
            key={i}
            variant="secondary"
            className={`${tagClasses[type]} rounded-lg px-3 py-1 text-sm font-semibold`}
          >
            {tagTexts[type]}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Card
        onClick={() => setExpanded((e) => !e)}
        className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:bg-slate-800/70 transition-colors rounded-lg cursor-pointer"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOptionsOpen((o) => !o);
              }}
              className="absolute top-2 right-2 text-primary hover:text-primary/80"
            >
              <FaEllipsisV />
            </button>
          </TooltipTrigger>
          <TooltipContent>Opciones</TooltipContent>
        </Tooltip>

      {optionsOpen && (
        <div className="absolute right-2 top-8 bg-card shadow-md rounded p-2 space-y-1 z-50">
          {showDismiss && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                setOptionsOpen(false);
                const confirmed = window.confirm(
                  "¿Estás seguro de que deseas marcar esta mención como irrelevante? Las menciones irrelevantes ya no se mostrarán."
                );
                if (!confirmed) return;
                try {
                  await supabase
                    .from("fact_mentions")
                    .update({ is_relevant: false })
                    .eq("content_id", mention.content_id);
                  if (onHide) onHide();
                } catch (error) {
                  console.error("Error updating mention relevance", error);
                }
              }}
              className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-muted"
            >
              <X className="size-4" />
              Marcar como irrelevante
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOptionsOpen(false);
              handleFavClick(e);
            }}
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-muted"
          >
            <Star className="size-4" />
            {favorite ? "Remover de destacados" : "Agregar a destacados"}
          </button>
        </div>
      )}

      <CardContent className="p-6 flex gap-4">
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 ${!iconBg ? "bg-muted" : ""}`}
          style={iconBg ? { backgroundColor: iconBg } : {}}
        >
          <Icon className={iconSizeClass} style={{ color: iconColor }} />
        </div>

        <div className="flex-1 space-y-1 min-w-0">
          {keyword && (
            <span className="inline-block text-xs bg-white/20 text-muted-foreground px-2 py-0.5 rounded">
              {keyword}
            </span>
          )}
          <div className="flex items-center justify-between gap-3 min-w-0">
            <span className="font-semibold text-primary">@{username}</span>
            <span className="text-xs text-muted-foreground shrink-0">{timestamp}</span>
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">
            {content}
          </p>

          {renderTags()}
          {expanded && renderMetrics()}

          {/* ================== Comentarios destacados (colapsados con “…”) ================== */}
          {expanded && topComments.length > 0 && (
            <div className="mt-8 pt-2 border-t border-slate-700/60 min-w-0">
              <h4 className="text-sm font-semibold text-primary mb-3">
                Comentarios destacados
              </h4>

              <div className="space-y-3">
                {topComments.map((c, i) => {
                  const CommentIcon = platform === "reddit" ? ArrowBigUp : Heart;
                  return (
                    <div
                      key={i}
                      className="min-w-0 w-full p-3 rounded-lg bg-slate-700/40 border border-slate-600
                                 flex items-center gap-3 text-sm text-muted-foreground"
                      style={{ minWidth: 0 }}
                    >
                      {/* Contenedor del texto: puede encogerse (truco w-0 flex-1) */}
                      <div className="w-0 flex-1 max-w-full" style={{ minWidth: 0 }}>
                        {/* Texto: una sola línea con “…” (funciona incluso en flex) */}
                        <span
                          className="block overflow-hidden text-ellipsis whitespace-nowrap"
                          title={c.comment ?? undefined}
                        >
                          {c.comment ?? "—"}
                        </span>
                      </div>

                      {/* Métrica: fijo, no se encoge */}
                      <span className="flex items-center gap-1 flex-none text-xs font-medium">
                        <CommentIcon className="size-4" />
                        {c.likes ?? 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {/* ================================================================================ */}

          {expanded && url && (
            <div className="mt-8 pt-2 border-t border-slate-700/60 min-w-0">
              <Button size="sm" asChild onClick={(e) => e.stopPropagation()}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Ir al sitio
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
