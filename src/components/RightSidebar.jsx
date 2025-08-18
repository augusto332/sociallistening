import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterX } from "lucide-react";
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
  clearFilters,
}) {
  const handleClearFilters = () => clearFilters();

  const tagClasses = {
    approval: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    reach: "bg-green-500/10 text-green-400 border-green-500/20",
    conversation: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
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
              <SelectItem value="60">Últimos 60 días</SelectItem>
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
          <div className="space-y-2">
            {[
              { id: "twitter", label: "Twitter" },
              { id: "youtube", label: "Youtube" },
              { id: "reddit", label: "Reddit" },
            ].map((s) => (
              <label key={s.id} htmlFor={s.id} className="flex items-center gap-2">
                <Checkbox
                  id={s.id}
                  checked={sources.includes(s.id)}
                  onCheckedChange={() => toggleSource(s.id)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-border/50 w-full" />

        <div>
          <p className="font-semibold mb-2">Etiquetas</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "approval", label: "Muy valorado" },
              { id: "reach", label: "Gran alcance" },
              { id: "conversation", label: "Generó conversación" },
            ].map((t) => (
              <Badge
                key={t.id}
                onClick={() => toggleTag(t.id)}
                className={cn(
                  tagClasses[t.id],
                  "rounded-lg px-3 py-1 text-sm font-semibold cursor-pointer",
                  tags.includes(t.id) ? "" : "opacity-50"
                )}
                variant="secondary"
              >
                {t.label}
              </Badge>
            ))}
          </div>
        </div>
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
  );
}
