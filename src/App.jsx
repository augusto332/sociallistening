import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import MentionCard from "@/components/MentionCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import KeywordTable from "@/components/KeywordTable";

export default function SocialListeningApp({ onLogout }) {
  // State for date range filters in dashboard
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [search, setSearch] = useState("");
  const [mentions, setMentions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rangeFilter, setRangeFilter] = useState("");
  const [sourcesFilter, setSourcesFilter] = useState([]);
  const [order, setOrder] = useState("recent");
  const [hiddenMentions, setHiddenMentions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [addKeywordMessage, setAddKeywordMessage] = useState(null);
  const [saveKeywordMessage, setSaveKeywordMessage] = useState(null);
  const [keywordChanges, setKeywordChanges] = useState({});
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const visibleFavorites = favorites.filter(
    (m) => !hiddenMentions.includes(m.url),
  );
  const filteredMentions = mentions.filter((m) => {
    const matchesSearch =
      m.mention.toLowerCase().includes(search.toLowerCase()) ||
      m.source.toLowerCase().includes(search.toLowerCase());

    const matchesSource =
      sourcesFilter.length === 0 ||
      sourcesFilter.includes(m.platform?.toLowerCase());

    const matchesRange =
      !rangeFilter ||
      (() => {
        const days = parseInt(rangeFilter, 10);
        const created = new Date(m.created_at);
        const now = new Date();
        const diff = (now - created) / (1000 * 60 * 60 * 24);
        return diff <= days;
      })();

    return matchesSearch && matchesSource && matchesRange;
  });

  const sortedMentions = [...filteredMentions].sort((a, b) => {
    if (order === "recent") {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (order === "popular") {
      const likesDiff = (b.likes ?? 0) - (a.likes ?? 0);
      if (likesDiff !== 0) return likesDiff;

      const commentsA = a.comments ?? a.replies ?? 0;
      const commentsB = b.comments ?? b.replies ?? 0;
      const commentsDiff = commentsB - commentsA;
      if (commentsDiff !== 0) return commentsDiff;

      const restA =
        (a.retweets ?? 0) + (a.quotes ?? 0) + (a.views ?? 0);
      const restB =
        (b.retweets ?? 0) + (b.quotes ?? 0) + (b.views ?? 0);
      return restB - restA;
    }

    return 0;
  });

  const visibleMentions = sortedMentions.filter(
    (m) => !hiddenMentions.includes(m.url),
  );

  const fetchMentions = async () => {
    const { data, error } = await supabase
      .from("total_mentions_vw")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching mentions", error);
    } else {
      setMentions((prev) => {
        const existing = new Set(prev.map((m) => m.url));
        const unique = (data || []).filter((m) => !existing.has(m.url));
        return [...prev, ...unique];
      });
    }
  };

  const fetchKeywords = async () => {
    const { data, error } = await supabase
      .from("dim_keywords")
      .select("keyword, keyword_id, created_at, active")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching keywords", error);
    } else {
      setKeywords(data || []);
    }
  };

  const toggleKeywordActive = async (id, active) => {
    const { error } = await supabase
      .from("dim_keywords")
      .update({ active: !!active })
      .eq("keyword_id", id);

    if (error) {
      console.error("Error updating keyword", error);
      return { error };
    }

    setKeywords((prev) =>
      prev.map((k) => (k.keyword_id === id ? { ...k, active } : k)),
    );
    return { error: null };
  };

  const handleKeywordToggle = (id, active) => {
    setKeywords((prev) =>
      prev.map((k) => (k.keyword_id === id ? { ...k, active } : k)),
    );
    setKeywordChanges((prev) => ({ ...prev, [id]: active }));
  };

  const saveKeywordChanges = async () => {
    setSaveKeywordMessage(null);
    let hasError = false;
    let errorMsg = "";
    for (const [id, active] of Object.entries(keywordChanges)) {
      // convert id back to number to match DB field type
      const { error } = await toggleKeywordActive(id, active);
      if (error) {
        hasError = true;
        errorMsg = error.message || "Error desconocido";
      }
    }
    setKeywordChanges({});
    if (hasError) {
      setSaveKeywordMessage({
        type: "error",
        text: `Ocurri\u00f3 un error al guardar los cambios: ${errorMsg}`,
      });
    } else {
      setSaveKeywordMessage({ type: "success", text: "Cambios guardados" });
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    setAddKeywordMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    const { user } = userData || {};
    if (!user) {
      setAddKeywordMessage({ type: "error", text: "Debes iniciar sesión" });
      return;
    }
    const { data, error } = await supabase
      .from("dim_keywords")
      .insert({
        keyword: newKeyword,
        user_id: user.id,
        created_at: new Date().toISOString(),
        active: false,
      })
      .select();
    if (error || !data || data.length === 0) {
      console.error("Error adding keyword", error);
      setAddKeywordMessage({
        type: "error",
        text: `No se pudo agregar la keyword: ${error?.message || "Error desconocido"}`,
      });
    } else {
      setKeywords((k) => [...data, ...k]);
      setNewKeyword("");
      setAddKeywordMessage({ type: "success", text: "Keyword agregada" });
    }
  };

  useEffect(() => {
    fetchMentions();
    fetchKeywords();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (onLogout) onLogout();
    navigate("/login");
  };

  const toggleSourceFilter = (id) => {
    setSourcesFilter((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const clearSidebarFilters = () => {
    setRangeFilter("");
    setSourcesFilter([]);
    setSearch("");
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
        <div className="absolute right-4 top-12 bg-secondary shadow-md rounded p-2 space-y-1 z-50">
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
      <aside className="w-64 bg-secondary shadow-md p-6 space-y-4 sticky top-0 h-screen overflow-y-auto">
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
      <main className="flex-1 p-8 pr-0 overflow-y-auto">
        {activeTab === "home" && (
          <section>
            <div className="w-full">
              <div className="flex justify-start mb-4">
                <Tabs value={order} onValueChange={setOrder}>
                  <TabsList>
                    <TabsTrigger value="recent">Más recientes</TabsTrigger>
                    <TabsTrigger value="popular">Más populares</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex items-start gap-8">
                <div className="flex-1 flex flex-col gap-6">
                  {visibleMentions.length ? (
                    visibleMentions.map((m, i) => (
                      <MentionCard
                        key={m.url}
                        mention={m}
                        source={m.platform}
                        username={m.source}
                        timestamp={formatDistanceToNow(new Date(m.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                        content={m.mention}
                        keyword={m.keyword}
                        url={m.url}
                        onHide={() =>
                          setHiddenMentions((prev) => [...prev, m.url])
                        }
                      />
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No se encontraron menciones
                    </p>
                  )}
                </div>
                <RightSidebar
                  className="mt-0 ml-auto"
                  search={search}
                  onSearchChange={setSearch}
                  range={rangeFilter}
                  setRange={setRangeFilter}
                  sources={sourcesFilter}
                  toggleSource={toggleSourceFilter}
                  clearFilters={clearSidebarFilters}
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "favorites" && (
          <section className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">❤️ Favoritos</h2>
            <div className="flex flex-col gap-6">
              {visibleFavorites.length ? (
                visibleFavorites.map((m, i) => (
                  <MentionCard
                    key={m.url}
                    mention={m}
                    source={m.platform}
                    username={m.source}
                    timestamp={formatDistanceToNow(new Date(m.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                    content={m.mention}
                    keyword={m.keyword}
                    url={m.url}
                    onHide={() => setHiddenMentions((prev) => [...prev, m.url])}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground">
                  No hay favoritos
                </p>
              )}
            </div>
          </section>
        )}

        {activeTab === "dashboard" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">
              📈 Análisis de palabras clave
            </h2>
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
                    <p className="font-semibold">
                      📌 Título de gráfico o insight {i + 1}
                    </p>
                    <p className="text-sm text-gray-600">
                      Placeholder de gráfico o métrica
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {activeTab === "config" && (
          <section>
            <h2 className="text-2xl font-bold mb-4">🛠️ Configuración</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Agregar nueva keyword</h3>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-64"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Nueva keyword"
                  />
                  <Button type="button" onClick={addKeyword}>
                    Agregar
                  </Button>
                </div>
                {addKeywordMessage && (
                  <p
                    className={`text-sm ${
                      addKeywordMessage.type === "error" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {addKeywordMessage.text}
                  </p>
                )}
              </div>
              <div>
                <label className="font-semibold block mb-2">Palabras clave</label>
                {keywords.length ? (
                  <KeywordTable keywords={keywords} onToggle={handleKeywordToggle} />
                ) : (
                  <p className="text-muted-foreground mb-2">No hay keywords</p>
                )}
                <Button
                  className="mt-2"
                  onClick={saveKeywordChanges}
                  disabled={Object.keys(keywordChanges).length === 0}
                >
                  Guardar cambios
                </Button>
                {saveKeywordMessage && (
                  <p
                    className={`text-sm ${
                      saveKeywordMessage.type === "error" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {saveKeywordMessage.text}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
