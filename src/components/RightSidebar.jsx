import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
  clearFilters,
}) {

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <aside
      className={cn(
        "w-64 bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-md p-6 space-y-4 flex flex-col items-start rounded-lg self-start sticky top-[104px] h-[calc(100vh-6.5rem)]",
      className
      )}
    >
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
        <p className="font-semibold mb-2">Sentimiento</p>
        <div className="space-y-2">
          <label htmlFor="negativo" className="flex items-center gap-2 text-red-500">
            <Checkbox id="negativo" />
            <span>Negativo</span>
          </label>
          <label htmlFor="neutro" className="flex items-center gap-2 text-gray-300">
            <Checkbox id="neutro" />
            <span>Neutro</span>
          </label>
          <label htmlFor="positivo" className="flex items-center gap-2 text-green-500">
            <Checkbox id="positivo" />
            <span>Positivo</span>
          </label>
        </div>
      </div>

      <div className="border-t border-border/50 w-full" />

      <Button
        onClick={handleClearFilters}
        className="mt-auto self-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        <FilterX className="w-4 h-4 mr-2" />
        Limpiar filtros
      </Button>
    </aside>
  );
}

