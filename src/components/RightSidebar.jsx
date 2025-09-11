import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { FilterX, Sparkles, TrendingUp, Users, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import MultiSelect from "@/components/MultiSelect";

export default function RightSidebar({
  className = "",
  range,
  setRange,
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
  clearFilters,
}) {
  const handleClearFilters = () => clearFilters();

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
  };

  const aiTagClass =
    "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20";

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "w-64 bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-md p-6 rounded-lg",
          "self-start flex flex-col",
          className
        )}
      >
      {/* CONTENIDO */}
      <div className="space-y-4 pr-1">
        <div>
          <p className="font-semibold mb-2">Rango de tiempo</p>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="15">Últimos 15 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border-t border-border/50 w-full" />

        <div>
          <p className="font-semibold mb-2">Palabras clave</p>
          <MultiSelect
            options={[
              { value: "all", label: "Todas" },
              ...keywordOptions.map((k) => ({ value: k.keyword, label: k.keyword })),
            ]}
            value={keywords}
            onChange={setKeywords}
            className="w-full"
          />
        </div>

        <div className="border-t border-border/50 w-full" />

        <div>
          <p className="font-semibold mb-2">Fuentes</p>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="space-y-2">
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
                        "flex items-center gap-2",
                        s.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Checkbox
                        id={s.id}
                        checked={sources.includes(s.id)}
                        onCheckedChange={!s.disabled ? () => toggleSource(s.id) : undefined}
                        disabled={s.disabled}
                      />
                      <span>{s.label}</span>
                    </label>
                  </TooltipTrigger>
                  {s.disabled && (
                    <TooltipContent>No disponibles en versión gratuita</TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>
            <div className="space-y-2">
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
                        "flex items-center gap-2",
                        s.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Checkbox
                        id={s.id}
                        checked={sources.includes(s.id)}
                        onCheckedChange={!s.disabled ? () => toggleSource(s.id) : undefined}
                        disabled={s.disabled}
                      />
                      <span>{s.label}</span>
                    </label>
                  </TooltipTrigger>
                  {s.disabled && (
                    <TooltipContent>No disponibles en versión gratuita</TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 w-full" />

        <div>
          <p className="font-semibold mb-2">Etiquetas</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(tagConfig).map(([id, config]) => {
              const TagIcon = config.icon;
              return (
                <Badge
                  key={id}
                  onClick={() => toggleTag(id)}
                  className={cn(
                    config.className,
                    "rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer",
                    tags.includes(id) ? "" : "opacity-50"
                  )}
                  variant="secondary"
                >
                  <TagIcon className="w-3 h-3" />
                  {config.text}
                </Badge>
              );
            })}
          </div>
        </div>

        {aiTagOptions.length > 0 && (
          <div>
            <p className="font-semibold mb-2 mt-4">Clasificación AI</p>
            <div className="flex flex-wrap gap-2">
              {aiTagOptions.map((tag) => (
                <Badge
                  key={tag}
                  onClick={() => toggleAiTag(tag)}
                  className={cn(
                    aiTagClass,
                    "rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer",
                    aiTags.includes(tag) ? "" : "opacity-50"
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
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-border/50 mt-4">
        <Button
          onClick={handleClearFilters}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <FilterX className="w-4 h-4 mr-2" />
          Limpiar filtros
        </Button>
      </div>
      </aside>
    </TooltipProvider>
  );
}
