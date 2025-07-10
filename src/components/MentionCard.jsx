import { Card, CardContent } from "@/components/ui/card";
import { Twitter, Youtube } from "lucide-react";

export default function MentionCard({ source = "twitter", username, timestamp, content }) {
  const Icon = source === "youtube" ? Youtube : Twitter;
  return (
    <Card className="border-muted bg-secondary hover:bg-secondary/70 transition-colors rounded-lg">
      <CardContent className="p-4 flex gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-full shrink-0">
          <Icon className="text-primary size-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-primary">@{username}</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
