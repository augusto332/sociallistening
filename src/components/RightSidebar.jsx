import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterX, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RightSidebar({
  className = "",
  search,
  onSearchChange,
  range,
  setRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sources,
  toggleSource,
  clearFilters,
}) {

  const handleClearFilters = () => {
    clearFilters();
  };

  return (
    <aside
      className={cn(
        "w-64 bg-secondary shadow-md p-6 space-y-6 flex flex-col rounded-lg self-start sticky top-8 h-[calc(100vh-2rem)]",
        className
      )}
    >
      <div className="relative">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
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

      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Desde"
          className="w-full"
        />
        <span>a</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Hasta"
          className="w-full"
        />
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
        className="mt-auto w-full"
      >
        <FilterX className="size-4" />
        Limpiar filtros
      </Button>
    </aside>
  );
}

