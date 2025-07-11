import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MentionCard from "@/components/MentionCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function SocialListeningApp() {
  // State for date range filters in dashboard
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen flex bg-neutral-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary shadow-md p-6 space-y-4">
        <h1 className="text-xl font-bold mb-4">🔍 Social Listening</h1>
        <button onClick={() => setActiveTab("home")} className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${activeTab === "home" ? "font-semibold" : ""}`}>🏠 Home</button>
        <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${activeTab === "dashboard" ? "font-semibold" : ""}`}>📊 Dashboard</button>
        <button onClick={() => setActiveTab("config")} className={`w-full text-left p-2 rounded hover:bg-[#2E2E2E] ${activeTab === "config" ? "font-semibold" : ""}`}>⚙️ Configuración</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "home" && (
          <section className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">📡 Menciones recientes</h2>
            <div className="flex flex-col gap-6">
              {[...Array(6)].map((_, i) => (
                <MentionCard
                  key={i}
                  source={i % 2 === 0 ? "twitter" : "youtube"}
                  username={`usuario_${i + 1}`}
                  timestamp="Hace 3h"
                  content={'Contenido de la mención sobre "palabra clave"... #ejemplo'}
                />
              ))}
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
    </div>
  );
}
