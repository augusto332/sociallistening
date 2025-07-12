import { useRef, useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";
import { FaHeart } from "react-icons/fa";

export default function RightSidebar() {
  const [range, setRange] = useState("");
  const sidebarRef = useRef(null);
  const { favorites, toggleFavorite } = useFavorites();

  const handleClearFilters = () => {
    setRange("");
    const inputs = sidebarRef.current?.querySelectorAll('input[type="checkbox"]');
    inputs?.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = false;
      }
    });
  };

  return (
    <aside
      ref={sidebarRef}
      className="w-64 bg-secondary shadow-md p-6 space-y-6 flex flex-col mt-8 rounded-lg self-start"
    >
      <div>
        <p className="font-semibold mb-2">Favoritos</p>
        {favorites.length ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {favorites.map((f) => (
              <div key={f.created_at} className="text-sm flex items-start gap-2">
                <span className="flex-1 line-clamp-2">{f.mention}</span>
                <button onClick={() => toggleFavorite(f)} className="text-primary hover:text-primary/80">
                  <FaHeart />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No hay favoritos</p>
        )}
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

      <div>
        <p className="font-semibold mb-2">Fuentes</p>
        <div className="space-y-2">
          {[
            { id: "twitter", label: "Twitter" },
            { id: "youtube", label: "Youtube" },
            { id: "reddit", label: "Reddit" },
          ].map((s) => (
            <label key={s.id} htmlFor={s.id} className="flex items-center gap-2">
              <Checkbox id={s.id} />
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
