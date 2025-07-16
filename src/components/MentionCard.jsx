import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaTwitter,
  FaYoutube,
  FaRedditAlien,
  FaHeart,
  FaRegHeart,
  FaTimes,
  FaArrowUp,
  FaComment,
  FaRetweet,
  FaEye,
  FaQuoteRight,
} from "react-icons/fa";
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
  const iconSizeClass = platform === "reddit" ? "size-5" : "size-6";
  const [expanded, setExpanded] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(mention);

  const handleFavClick = (e) => {
    e.stopPropagation();
    toggleFavorite(mention);
  };

  const renderMetrics = () => {
    const metrics = [];
    if (platform === "youtube") {
      mention.likes && metrics.push({ icon: FaHeart, value: mention.likes });
      mention.comments && metrics.push({ icon: FaComment, value: mention.comments });
      mention.views && metrics.push({ icon: FaEye, value: mention.views });
    }
    if (platform === "reddit") {
      mention.likes && metrics.push({ icon: FaArrowUp, value: mention.likes });
      mention.comments && metrics.push({ icon: FaComment, value: mention.comments });
    }
    if (platform === "twitter") {
      mention.likes && metrics.push({ icon: FaHeart, value: mention.likes });
      mention.retweets && metrics.push({ icon: FaRetweet, value: mention.retweets });
      mention.replies && metrics.push({ icon: FaComment, value: mention.replies });
      mention.quotes && metrics.push({ icon: FaQuoteRight, value: mention.quotes });
    }
    if (!metrics.length) return null;
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
        {metrics.map((m, idx) => {
          const MetricIcon = m.icon;
          return (
            <span key={idx} className="flex items-center gap-1">
              <MetricIcon className="size-4" />
              {m.value}
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
          if (onHide) onHide();
        }}
        title="Marcar como irrelevante"
        className="absolute top-2 right-2 text-primary hover:text-primary/80"
      >
        <FaTimes />
      </button>
      <button
        onClick={handleFavClick}
        title="Agregar a favoritos"
        className="absolute top-2 right-8 text-primary hover:text-primary/80"
      >
        {favorite ? <FaHeart /> : <FaRegHeart />}
      </button>
      <CardContent className="p-6 flex gap-4">
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full shrink-0 ${!iconBg ? "bg-muted" : ""}`}
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
