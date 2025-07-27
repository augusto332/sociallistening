import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import DatePickerInput from "@/components/DatePickerInput";
import { Card, CardContent } from "@/components/ui/card";
import MentionCard from "@/components/MentionCard";
import WordCloud from "@/components/WordCloud";
import PlatformBarChart from "@/components/PlatformBarChart";
import ActiveSourcesBarChart from "@/components/ActiveSourcesBarChart";
import MentionsLineChart from "@/components/MentionsLineChart";
import MultiSelect from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RightSidebar from "@/components/RightSidebar";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  CircleUser,
  Home,
  BarChart2,
  FileChartLine,
  Settings,
  Star,
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
  const [keywordsFilter, setKeywordsFilter] = useState(["all"]);
  const [order, setOrder] = useState("recent");
  const [hiddenMentions, setHiddenMentions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [selectedDashboardKeywords, setSelectedDashboardKeywords] = useState(["all"]);
  const [selectedDashboardPlatforms, setSelectedDashboardPlatforms] = useState(["all"]);
  const [newKeyword, setNewKeyword] = useState("");
  const [addKeywordMessage, setAddKeywordMessage] = useState(null);
  const [saveKeywordMessage, setSaveKeywordMessage] = useState(null);
  const [keywordChanges, setKeywordChanges] = useState({});
  const navigate = useNavigate();
  const { favorites, isFavorite } = useFavorites();
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountName, setAccountName] = useState("");
  const [originalAccountName, setOriginalAccountName] = useState("");
  const [nameMessage, setNameMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

    const matchesKeyword =
      keywordsFilter.includes("all") || keywordsFilter.includes(m.keyword);
    return matchesSearch && matchesSource && matchesRange && matchesKeyword;
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
  const homeMentions = onlyFavorites
    ? visibleMentions.filter(isFavorite)
    : visibleMentions;

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
      .select(
        "keyword, keyword_id, created_at, active, last_processed_at_yt, last_processed_at_rd, last_processed_at_tw",
      )
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

  const fetchAccount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const displayName = user.user_metadata?.display_name || "";
      setAccountEmail(user.email || "");
      setAccountName(displayName);
      setOriginalAccountName(displayName);
    }
  };



  const togglePasswordFields = () => {
    setShowPasswordFields((prev) => !prev);
    setPasswordMessage(null);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: accountEmail,
      password: currentPassword,
    });
    if (signInError) {
      setPasswordMessage({ type: "error", text: "Contraseña actual incorrecta" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordMessage({ type: "error", text: error.message });
    } else {
      setPasswordMessage({ type: "success", text: "Contraseña actualizada" });
      setShowPasswordFields(false);
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  const handleSaveAccountName = async () => {
    setNameMessage(null);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: accountName },
    });
    if (error) {
      setNameMessage({ type: "error", text: error.message });
    } else {
      setNameMessage({ type: "success", text: "Nombre actualizado" });
      setOriginalAccountName(accountName);
    }
  };

  useEffect(() => {
    fetchMentions();
    fetchKeywords();
    fetchAccount();
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
    setKeywordsFilter(["all"]);
  };

  const activeKeywords = useMemo(
    () => keywords.filter((k) => k.active),
    [keywords],
  );

  const stopwords = useMemo(
    () =>
      new Set([
        "de",
        "la",
        "que",
        "y",
        "el",
        "en",
        "no",
        "se",
        "con",
        "los",
        "del",
        "un",
        "es",
        "por",
        "las",
        "para",
        "lo",
        "al",
        "si",
        "sin",
        "le",
        "su",
        "esta",
        "hay",
      ]),
    [],
  );

  const normalizeWord = (w) =>
    w
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const wordCloudData = useMemo(() => {
    const relevant = mentions.filter((m) => {
      const isActive = activeKeywords.some((k) => k.keyword === m.keyword);
      const matchesKeyword =
        selectedDashboardKeywords.includes("all") ||
        selectedDashboardKeywords.includes(m.keyword);
      const matchesPlatform =
        selectedDashboardPlatforms.includes("all") ||
        selectedDashboardPlatforms.includes(m.platform?.toLowerCase?.());
      return isActive && matchesKeyword && matchesPlatform;
    });

    const counts = {};
    for (const m of relevant) {
      const words = m.mention
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-ZñÑüÜ\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      for (const w of words) {
        const normalized = normalizeWord(w);
        if (normalized.length < 3) continue;
        if (stopwords.has(normalized)) continue;
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .filter(([_, v]) => v >= 2)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30);
  }, [mentions, activeKeywords, selectedDashboardKeywords, selectedDashboardPlatforms, stopwords]);

  const platformCounts = useMemo(() => {
    const counts = {};
    for (const m of mentions) {
      if (
        !selectedDashboardKeywords.includes("all") &&
        !selectedDashboardKeywords.includes(m.keyword)
      )
        continue;
      const platform = m.platform?.toLowerCase?.();
      if (!platform) continue;
      if (
        !selectedDashboardPlatforms.includes("all") &&
        !selectedDashboardPlatforms.includes(platform)
      )
        continue;
      counts[platform] = (counts[platform] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count);
  }, [mentions, selectedDashboardKeywords, selectedDashboardPlatforms]);

  const sourceCounts = useMemo(() => {
    const counts = {};
    for (const m of mentions) {
      if (
        !selectedDashboardKeywords.includes("all") &&
        !selectedDashboardKeywords.includes(m.keyword)
      )
        continue;
      const platform = m.platform?.toLowerCase?.();
      if (
        !selectedDashboardPlatforms.includes("all") &&
        !selectedDashboardPlatforms.includes(platform)
      )
        continue;
      const name = m.source;
      if (!name) continue;
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [mentions, selectedDashboardKeywords, selectedDashboardPlatforms]);

  const mentionsOverTime = useMemo(() => {
    const filtered = mentions.filter((m) => {
      if (
        !selectedDashboardKeywords.includes("all") &&
        !selectedDashboardKeywords.includes(m.keyword)
      ) {
        return false;
      }
      const platform = m.platform?.toLowerCase?.();
      if (
        !selectedDashboardPlatforms.includes("all") &&
        !selectedDashboardPlatforms.includes(platform)
      ) {
        return false;
      }
      const created = new Date(m.created_at);
      if (startDate && created < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
      return true;
    });

    const counts = {};
    for (const m of filtered) {
      const day = m.created_at.slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    }

    const dates = Object.keys(counts).sort();
    if (!dates.length) return [];

    const start = startDate || dates[0];
    const end = endDate || dates[dates.length - 1];

    const result = [];
    let current = new Date(start);
    const endDt = new Date(end);
    while (current <= endDt) {
      const key = current.toISOString().slice(0, 10);
      result.push({ date: key, count: counts[key] || 0 });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }, [
    mentions,
    selectedDashboardKeywords,
    selectedDashboardPlatforms,
    startDate,
    endDate,
  ]);

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
              setActiveTab("account");
              setMenuOpen(false);
            }}
            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-[#2E2E2E]"
          >
            <CircleUser className="size-4" />
            Mi Cuenta
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
      <aside className="w-64 bg-secondary shadow-md p-6 flex flex-col space-y-4 sticky top-0 h-screen overflow-y-auto">
        <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Search className="size-5" />
          Social Listening
        </h1>
        <button
          onClick={() => setActiveTab("home")}
          className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${
            activeTab === "home" ? "font-semibold bg-[#2E2E2E]" : ""
          }`}
        >
          <Home className="size-4 mr-2 inline" />
          Inicio
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${
            activeTab === "dashboard" ? "font-semibold bg-[#2E2E2E]" : ""
          }`}
        >
          <BarChart2 className="size-4 mr-2 inline" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("reportes")}
          className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${
            activeTab === "reportes" ? "font-semibold bg-[#2E2E2E]" : ""
          }`}
        >
          <FileChartLine className="size-4 mr-2 inline" />
          Reportes
        </button>
        <button
          onClick={() => setActiveTab("config")}
          className={`mt-auto w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${
            activeTab === "config" ? "font-semibold bg-[#2E2E2E]" : ""
          }`}
        >
          <Settings className="size-4 mr-2 inline" />
          Configuración
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 pr-0 overflow-y-auto">
        {activeTab === "home" && (
          <section>
            <div className="flex items-start gap-8 min-h-screen">
              <div className="flex-1">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-secondary"
                  />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <Tabs value={order} onValueChange={setOrder}>
                    <TabsList>
                      <TabsTrigger value="recent">Más recientes</TabsTrigger>
                      <TabsTrigger value="popular">Más populares</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button
                    onClick={() => setOnlyFavorites((o) => !o)}
                    className={cn(
                      "flex items-center gap-2 h-9 px-3 py-1 text-sm font-medium rounded-md transition-all",
                      onlyFavorites
                        ? "bg-accent text-accent-foreground shadow"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Star className="size-4" />
                    Ver solo destacados
                  </Button>
                </div>
                <div className="flex flex-col gap-6">
                  {homeMentions.length ? (
                    homeMentions.map((m, i) => (
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
              </div>
              <RightSidebar
                className="mt-0 ml-auto"
                range={rangeFilter}
                setRange={setRangeFilter}
                sources={sourcesFilter}
                toggleSource={toggleSourceFilter}
                keywords={keywordsFilter}
                setKeywords={setKeywordsFilter}
                keywordOptions={activeKeywords}
                clearFilters={clearSidebarFilters}
              />
            </div>
          </section>
        )}


        {activeTab === "dashboard" && (
          <section className="pr-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <p className="text-sm font-medium mb-1">Palabras clave</p>
                <MultiSelect
                  className="w-64"
                  options={[
                    { value: "all", label: "Todas" },
                    ...activeKeywords.map((k) => ({
                      value: k.keyword,
                      label: k.keyword,
                    })),
                  ]}
                  value={selectedDashboardKeywords}
                  onChange={setSelectedDashboardKeywords}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Rango de fechas</p>
                <div className="flex items-center gap-2">
                  <DatePickerInput
                    value={startDate}
                    onChange={setStartDate}
                    placeholder="Desde"
                    className="w-40"
                  />
                  <span>a</span>
                  <DatePickerInput
                    value={endDate}
                    onChange={setEndDate}
                    placeholder="Hasta"
                    className="w-40"
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Plataformas</p>
                <MultiSelect
                  className="w-40"
                  options={[
                    { value: "all", label: "Todas" },
                    { value: "youtube", label: "YouTube" },
                    { value: "reddit", label: "Reddit" },
                    { value: "twitter", label: "Twitter" },
                  ]}
                  value={selectedDashboardPlatforms}
                  onChange={setSelectedDashboardPlatforms}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-secondary h-[400px]">
                <CardContent className="p-4 space-y-2 h-full flex flex-col">
                  <p className="font-semibold">📌 Palabras más mencionadas</p>
                  <div className="flex-1">
                    <WordCloud words={wordCloudData} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary h-[400px]">
                <CardContent className="p-4 space-y-2 h-full flex flex-col">
                  <p className="font-semibold">📌 Menciones por plataforma</p>
                  <div className="flex-1">
                    <PlatformBarChart data={platformCounts} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary h-[400px]">
                <CardContent className="p-4 space-y-2 h-full flex flex-col">
                  <p className="font-semibold">📌 Usuarios/canales más activos</p>
                  <div className="flex-1">
                    <ActiveSourcesBarChart data={sourceCounts} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary h-[400px] lg:col-span-3">
                <CardContent className="p-4 space-y-2 h-full flex flex-col">
                  <p className="font-semibold">📌 Evolución de menciones</p>
                  <div className="flex-1">
                    <MentionsLineChart data={mentionsOverTime} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {activeTab === "reportes" && (
          <section className="pr-4">
            <p className="text-muted-foreground">Aún no hay contenido.</p>
          </section>
        )}

        {activeTab === "account" && (
          <section className="pr-4 max-w-lg space-y-8">
            <h2 className="text-2xl font-bold mb-4">Datos de la cuenta</h2>
            <div className="space-y-6">
              <div>
                <label className="font-semibold block mb-2">Correo electrónico</label>
                <Input className="bg-secondary" value={accountEmail} readOnly />
              </div>
              <div>
                <label className="font-semibold block mb-2">Nombre de usuario</label>
                <div className="flex items-center gap-2">
                  <Input
                    className="bg-secondary"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                  {accountName !== originalAccountName && (
                    <Button type="button" onClick={handleSaveAccountName}>
                      Guardar
                    </Button>
                  )}
                </div>
                {nameMessage && (
                  <p
                    className={`text-sm ${
                      nameMessage.type === "error" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {nameMessage.text}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={togglePasswordFields}
                >
                  Cambiar contraseña
                </Button>
                {showPasswordFields && (
                  <div className="space-y-4">
                    <Input
                      className="bg-secondary"
                      type="password"
                      placeholder="Contraseña actual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <Input
                      className="bg-secondary"
                      type="password"
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button type="button" onClick={handleChangePassword}>
                      Guardar cambios
                    </Button>
                  </div>
                )}
                {passwordMessage && (
                  <p
                    className={`text-sm ${
                      passwordMessage.type === "error" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {passwordMessage.text}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "config" && (
          <section className="pr-4">
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
