import { Card, CardContent } from "@/components/ui/card";
import { FaTwitter, FaYoutube, FaReddit } from "react-icons/fa";

export default function MentionCard({ source = "twitter", username, timestamp, content }) {
  const icons = {
    twitter: FaTwitter,
    youtube: FaYoutube,
    reddit: FaReddit,
  };
  const Icon = icons[source?.toLowerCase?.()] || FaTwitter;
  return (
    <Card className="border-muted bg-secondary hover:bg-secondary/70 transition-colors rounded-lg">
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
        </div>
      </CardContent>
    </Card>
  );
}
