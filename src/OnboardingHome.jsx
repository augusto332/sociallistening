// REMOVIDO: "use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
// REMOVIDO: import { Inter } from "next/font/google"
import {
  Plus,
  X,
  Search,
  MessageSquare,
  Bell,
  TrendingUp,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Hash,
  Zap,
  CircleUser,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"

// REMOVIDO: const inter = Inter({...})

export default function ModernOnboardingHome() {
  const [keywords, setKeywords] = useState([])
  const [newKeyword, setNewKeyword] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [languages, setLanguages] = useState([])
  const [savingLanguages, setSavingLanguages] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const accountName =
    user?.user_metadata?.display_name || user?.email || ""

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const addKeyword = () => {
    const kw = newKeyword.trim()
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw])
      setNewKeyword("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addKeyword()
    }
  }

  const removeKeyword = (kw) => {
    setKeywords(keywords.filter((k) => k !== kw))
  }

  const toggleLanguage = (lang) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    )
  }

  const saveLanguages = async () => {
    if (!languages.length) return
    setSavingLanguages(true)
    const { error } = await supabase
      .from("dim_keywords")
      .update({ language_codes: languages })
      .eq("user_id", user.id)
      .in("keyword", keywords)
    setSavingLanguages(false)
    if (!error) {
      navigate("/app/mentions")
    } else {
      console.error("Error saving languages", error)
    }
  }

  const saveKeywords = async () => {
    if (!keywords.length) return
    setSaving(true)
    const rows = keywords.map((k) => ({
      keyword: k,
      user_id: user.id,
      created_at: new Date().toISOString(),
      active: true,
    }))
    const { error } = await supabase.from("dim_keywords").insert(rows)
    setSaving(false)
    if (!error) {
      setSaved(true)
    } else {
      console.error("Error saving keywords", error)
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans flex flex-col`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header with account menu */}
      <header className="relative z-20 flex justify-end p-4">
        <div className="relative">
          <Button
            variant="ghost"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-slate-300 hover:text-white"
          >
            <Avatar className="w-7 h-7">
              <AvatarImage src="/placeholder.svg?height=28&width=28" />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                {accountName ? accountName.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="w-4 h-4" />
          </Button>

          {menuOpen && (
            <div className="absolute right-0 top-12 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-lg p-2 space-y-1 z-50 min-w-[180px]">
              <button
                onClick={() => {
                  navigate("/app/mentions?tab=account")
                  setMenuOpen(false)
                }}
                className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              >
                <CircleUser className="w-4 h-4" />
                Mi Cuenta
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              {/* Header */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
                  Bienvenido a Social Listening
                </h1>
                <p className="text-xl text-slate-400 max-w-lg mx-auto">
                  Descubre qué se dice sobre tu marca en las redes sociales y mantente al día con las conversaciones importantes.
                </p>
              </div>

              {/* Steps Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Hash className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">1. Carga tus keywords</h3>
                    <p className="text-sm text-slate-400">Define las palabras clave que quieres monitorear</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">2. Revisa las menciones</h3>
                    <p className="text-sm text-slate-400">Analiza las menciones en tiempo real</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/50 transition-all duration-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="font-semibold text-white mb-2">3. Recibe reportes</h3>
                    <p className="text-sm text-slate-400">Mantente informado sobre menciones importantes</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="keywords"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">Configura tus palabras clave</h2>
                    <p className="text-slate-400">
                      Agrega las palabras clave que quieres monitorear en redes sociales. Puedes incluir nombres de marca, productos, competidores o cualquier término relevante.
                    </p>
                  </div>

                  {/* Add Keyword Input */}
                  <div className="mb-8">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Escribe una palabra clave..."
                          className="pl-11 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                        />
                      </div>
                      <Button
                        onClick={addKeyword}
                        disabled={!newKeyword.trim()}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-12 px-6"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>

                  {/* Keywords List */}
                  {keywords.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        Palabras clave agregadas ({keywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {keywords.map((kw) => (
                          <Badge
                            key={kw}
                            variant="secondary"
                            className="bg-slate-700/50 text-slate-200 border-slate-600/50 hover:bg-slate-700/70 transition-colors px-4 py-2 text-sm"
                          >
                            <span className="mr-2">{kw}</span>
                            <button
                              onClick={() => removeKeyword(kw)}
                              className="text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {!saved ? (
                      <Button
                        onClick={saveKeywords}
                        disabled={saving || keywords.length === 0}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 h-12 flex-1"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Guardar y continuar ({keywords.length} keywords)
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span className="text-green-400 font-medium">¡Keywords guardadas exitosamente!</span>
                        </div>
                        <Button
                          onClick={() => setStep(2)}
                          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 h-12 w-full"
                        >
                          Continuar
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Help Text */}
                  {keywords.length === 0 && (
                    <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                      <p className="text-sm text-slate-400 text-center">
                        💡 <strong>Tip:</strong> Comienza agregando 3-5 palabras clave relacionadas con tu marca o industria para obtener mejores resultados.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Footer */}
              <div className="text-center mt-8">
                <p className="text-slate-500 text-sm">
                  ¿Necesitas ayuda? Consulta nuestra{" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                    guía de inicio rápido
                  </a>
                </p>
              </div>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="languages"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">Selecciona los idiomas</h2>
                    <p className="text-slate-400">Elige los idiomas en los que deseas monitorear las menciones.</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {[{ id: "es", label: "Español" }, { id: "en", label: "Inglés" }].map((lang) => (
                      <label key={lang.id} htmlFor={lang.id} className="flex items-center gap-2">
                        <Checkbox
                          id={lang.id}
                          checked={languages.includes(lang.id)}
                          onCheckedChange={() => toggleLanguage(lang.id)}
                        />
                        <span className="text-white">{lang.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={saveLanguages}
                      disabled={savingLanguages || languages.length === 0}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 h-12 flex-1"
                    >
                      {savingLanguages ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Guardar y continuar
                        </>
                      )}
                    </Button>
                  </div>

                  {languages.length === 0 && (
                    <div className="mt-6 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
                      <p className="text-sm text-slate-400 text-center">
                        💡 <strong>Tip:</strong> Puedes seleccionar más de un idioma.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="text-center mt-8">
                <p className="text-slate-500 text-sm">
                  ¿Necesitas algún idioma adicional? {" "}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Contáctanos
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
        {step < 2 && (
          <button
            onClick={() => {
              if (step === 1 && !saved) return
              setStep(step + 1)
            }}
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-white ${
              step === 1 && !saved ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400">
          {step + 1}/3
        </div>
      </div>
    </div>
  )
}
