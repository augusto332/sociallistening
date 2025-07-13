import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MentionCard from "@/components/MentionCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  CircleUser,
  Home,
  BarChart2,
  Settings,
  Heart,
} from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

export default function SocialListeningApp() {
  // State for date range filters in dashboard
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [search, setSearch] = useState("");
  const [mentions, setMentions] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { favorites } = useFavorites();
  const filteredMentions = mentions.filter(
    (m) =>
      m.mention.toLowerCase().includes(search.toLowerCase()) ||
      m.source.toLowerCase().includes(search.toLowerCase())
  );

  const fetchMentions = async (from = 0, to = 4) => {
    const { data, error } = await supabase
      .from("total_mentions_vw")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) {
      console.error("Error fetching mentions", error);
    } else {
      setMentions((prev) => [...prev, ...(data || [])]);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    await fetchMentions(mentions.length, mentions.length + 4);
    setLoadingMore(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-950 text-gray-100 relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
      >
        <CircleUser className="size-7" />
      </button>
      {menuOpen && (
        <div className="absolute right-4 top-12 bg-secondary shadow-md rounded p-2 space-y-1">
          <button
            onClick={() => {
              setActiveTab("config");
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-[#2E2E2E]"
          >
            <Settings className="size-4" />
            Configuración
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-[#2E2E2E]"
          >
            Cerrar sesión
          </button>
        </div>
      )}
      {/* Sidebar */}
      <aside className="w-64 bg-secondary shadow-md p-6 space-y-4">
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Search className="size-5" />
          Social Listening
        </h1>
        <button
          onClick={() => setActiveTab("home")}
          className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${
            activeTab === "home" ? "font-semibold" : ""
          }`}
        >
          <Home className="size-4 mr-2 inline" />
          Home
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${
            activeTab === "favorites" ? "font-semibold" : ""
          }`}
        >
          <Heart className="size-4 mr-2 inline" />
          Favoritos
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${
            activeTab === "dashboard" ? "font-semibold" : ""
          }`}
        >
          <BarChart2 className="size-4 mr-2 inline" />
          Dashboard
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "home" && (
          <section className="max-w-2xl mx-auto">
            <div className="mb-6 flex justify-center relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full max-w-xl"
              />
            </div>
            <h2 className="text-2xl font-bold mb-4">📡 Menciones recientes</h2>
            <div className="flex flex-col gap-6">
              {filteredMentions.length ? (
                filteredMentions.map((m, i) => (
                  <MentionCard
                    key={`${m.created_at}-${i}`}
                    mention={m}
                    source={m.platform}
                    username={m.source}
                    timestamp={new Date(m.created_at).toLocaleString()}
                    content={m.mention}
                    keyword={m.keyword}
                    url={m.url}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No se encontraron menciones
                </p>
              )}
            </div>
            <Button
              onClick={loadMore}
              disabled={loadingMore}
              className="mx-auto mt-6 block"
              variant="outline"
            >
              {loadingMore ? "Cargando..." : "Ver más"}
            </Button>
          </section>
        )}

        {activeTab === "favorites" && (
          <section className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">❤️ Favoritos</h2>
            <div className="flex flex-col gap-6">
              {favorites.length ? (
                favorites.map((m, i) => (
                  <MentionCard
                    key={`${m.created_at}-${i}`}
                    mention={m}
                    source={m.platform}
                    username={m.source}
                    timestamp={new Date(m.created_at).toLocaleString()}
                    content={m.mention}
                    keyword={m.keyword}
                    url={m.url}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground">No hay favoritos</p>
              )}
            </div>
          </section>
        )}

        {activeTab === "dashboard" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">📈 Análisis de palabras clave</h2>
            <div className="flex flex-wrap gap-4 mb-4">
              <Input placeholder="Buscar keyword..." className="w-64" />
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Desde"
                  className="w-40"
                />
                <span>a</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Hasta"
                  className="w-40"
                />
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="fecha">Fecha</SelectItem>
                </SelectContent>
              </Select>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-secondary">
                    <CardContent className="p-4">
                    <p className="font-semibold">📌 Título de gráfico o insight {i + 1}</p>
                    <p className="text-sm text-gray-600">Placeholder de gráfico o métrica</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {activeTab === "config" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">🛠️ Configuración</h2>
            <div className="space-y-4">
              <div>
                <label className="font-semibold block mb-1">Palabras clave</label>
                <Input placeholder="Ej: inteligencia artificial, elecciones, Messi..." />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="notify" />
                <label htmlFor="notify">Notificarme cuando haya más de 100 menciones en una hora</label>
              </div>
              <Button className="mt-4">Guardar configuración</Button>
            </div>
          </section>
        )}
      </main>
      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
