import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FilterX, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RightSidebar({
  className = "",
  range,
  setRange,
  sources,
  toggleSource,
  clearFilters,
  onlyFavorites,
  toggleFavorites,
}) {

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <aside
      className={cn(
        "w-64 bg-secondary shadow-md p-6 space-y-6 flex flex-col items-start rounded-lg self-start sticky top-8 h-[calc(100vh-2rem)]",
        className
      )}
    >
      <Button
        variant={onlyFavorites ? "default" : "outline"}
        onClick={toggleFavorites}
        className="w-full flex items-center gap-2 justify-start"
      >
        <Star className="size-4" />
        Destacados
      </Button>
      <div>
        <p className="font-semibold mb-2">Rango de tiempo</p>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 días</SelectItem>
            <SelectItem value="15">Últimos 15 días</SelectItem>
            <SelectItem value="30">Últimos 30 días</SelectItem>
          </SelectContent>
        </Select>
      </div>


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

      <Button
        variant="outline"
        onClick={handleClearFilters}
        className="mt-auto self-center"
      >
        <FilterX className="size-4" />
        Limpiar filtros
      </Button>
    </aside>
  );
}

