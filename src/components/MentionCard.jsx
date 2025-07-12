import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FaTwitter, FaYoutube, FaReddit } from "react-icons/fa";

export default function MentionCard({
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

  return (
    <Card
      onClick={() => setExpanded((e) => !e)}
      className="border-muted bg-secondary hover:bg-secondary/70 transition-colors rounded-lg cursor-pointer"
    >
      <CardContent className="p-6 flex gap-4">
        <div className="w-12 h-12 flex items-center justify-center bg-muted rounded-full shrink-0">
          <Icon className="text-primary size-6" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">@{username}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">{content}</p>
          {keyword && (
            <span className="inline-block text-xs mt-2 bg-muted text-muted-foreground px-2 py-0.5 rounded">
              {keyword}
            </span>
          )}
          {expanded && (
            <div className="mt-2 space-y-1 text-sm">
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline block"
                >
                  {url}
                </a>
              )}
              <p className="text-muted-foreground">Resumen de la mención (dummy).</p>
              <p className="text-muted-foreground">Análisis de sentimiento (dummy).</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
