import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FaTwitter,
  FaYoutube,
  FaReddit,
  FaHeart,
  FaRegHeart,
  FaTimes,
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
    reddit: { Icon: FaReddit, color: "#FF5700" },
  };
  const Icon = icons[source?.toLowerCase?.()]?.Icon || FaTwitter;
  const iconColor = icons[source?.toLowerCase?.()]?.color || "#1DA1F2";
  const [expanded, setExpanded] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(mention);

  const handleFavClick = (e) => {
    e.stopPropagation();
    toggleFavorite(mention);
  };

  const renderMetrics = () => {
    const platform = source?.toLowerCase?.();
    if (platform === "youtube") {
      return (
        <>
          <p>Likes: {mention.likes}</p>
          <p>Comments: {mention.comments}</p>
          <p>Views: {mention.views}</p>
          <p>Snapshot: {mention.snapshot_date}</p>
        </>
      );
    }
    if (platform === "reddit") {
      return (
        <>
          <p>Likes: {mention.likes}</p>
          <p>Comments: {mention.comments}</p>
        </>
      );
    }
    if (platform === "twitter") {
      return (
        <>
          <p>Likes: {mention.likes}</p>
          <p>Retweets: {mention.retweets}</p>
          <p>Replies: {mention.replies}</p>
          <p>Quotes: {mention.quotes}</p>
        </>
      );
    }
    return null;
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
        <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-full shrink-0">
          <Icon className="size-6" style={{ color: iconColor }} />
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
          {expanded && (
            <div className="mt-2 text-sm space-y-1">
              {renderMetrics()}
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
