import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaTwitter, FaYoutube, FaReddit, FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavorites } from "@/context/FavoritesContext";

export default function MentionCard({
  mention,
  source = "twitter",
  username,
  timestamp,
  content,
  keyword,
  url,
}) {
  const icons = {
    twitter: FaTwitter,
    youtube: FaYoutube,
    reddit: FaReddit,
  };
  const Icon = icons[source?.toLowerCase?.()] || FaTwitter;
  const [expanded, setExpanded] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorite = isFavorite(mention);

  const handleFavClick = (e) => {
    e.stopPropagation();
    toggleFavorite(mention);
  };

  return (
    <Card
      onClick={() => setExpanded((e) => !e)}
      className="relative border-muted bg-secondary hover:bg-secondary/70 transition-colors rounded-lg cursor-pointer"
    >
      <button
        onClick={handleFavClick}
        className="absolute top-2 right-2 text-primary hover:text-primary/80"
      >
        {favorite ? <FaHeart /> : <FaRegHeart />}
      </button>
      <CardContent className="p-6 flex gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-full shrink-0">
          <Icon className="text-primary size-6" />
        </div>
        <div className="flex-1 space-y-1">
          {keyword && (
            <span className="inline-block text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded">
              {keyword}
            </span>
          )}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">@{username}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">{content}</p>
          {expanded && (
            <div className="mt-2 text-sm">
              {url && (
                <Button
                  size="sm"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
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
