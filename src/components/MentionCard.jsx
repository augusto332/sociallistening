import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaTwitter,
  FaYoutube,
  FaRedditAlien,
  FaEllipsisV,
  FaHeart,
  FaArrowUp,
  FaComment,
  FaRetweet,
  FaEye,
  FaQuoteRight,
} from "react-icons/fa";
import { Star, X } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

export default function MentionCard({
  mention,
  source = "twitter",
  username,
  timestamp,
  content,
  keyword,
  url,
  onHide,
  showDismiss = true,
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
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(mention);

  const handleFavClick = (e) => {
    e.stopPropagation();
    toggleFavorite(mention);
  };

  const renderMetrics = () => {
    const metricMap = {
      youtube: [
        { key: "likes", icon: FaHeart },
        { key: "comments", icon: FaComment },
        { key: "views", icon: FaEye },
      ],
      reddit: [
        { key: "likes", icon: FaArrowUp },
        { key: "comments", icon: FaComment },
      ],
      twitter: [
        { key: "likes", icon: FaHeart },
        { key: "retweets", icon: FaRetweet },
        { key: "replies", icon: FaComment },
        { key: "quotes", icon: FaQuoteRight },
      ],
    };

    const metrics = metricMap[platform] || [];

    if (!metrics.length) return null;

    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
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
      </div>
    );
  };

  return (
    <Card
      onClick={() => setExpanded((e) => !e)}
      className="relative border-muted bg-secondary hover:bg-secondary/70 transition-colors rounded-lg cursor-pointer"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOptionsOpen((o) => !o);
        }}
        title="Opciones"
        className="absolute top-2 right-2 text-primary hover:text-primary/80"
      >
        <FaEllipsisV />
      </button>
      {optionsOpen && (
        <div className="absolute right-2 top-8 bg-secondary shadow-md rounded p-2 space-y-1 z-50">
          {showDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOptionsOpen(false);
                if (onHide) onHide();
              }}
              className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-[#2E2E2E]"
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
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-[#2E2E2E]"
          >
            <Star className="size-4" />
            Agregar a destacados
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
        <div className="flex-1 space-y-1">
          {keyword && (
            <span className="inline-block text-xs bg-white/20 text-muted-foreground px-2 py-0.5 rounded">
              {keyword}
            </span>
          )}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">@{username}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">
            {content}
          </p>
          {renderMetrics()}
          {expanded && (
            <div className="mt-2 text-sm space-y-1">
              <p>
                Métricas al momento de captura (
                {new Date(mention.created_at).toLocaleString()}):
              </p>
              {url && (
                <Button size="sm" asChild onClick={(e) => e.stopPropagation()}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    Ir al sitio
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
