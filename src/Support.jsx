"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sparkles,
  ArrowLeft,
  Send,
  CheckCircle,
  Mail,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Bug,
  Lightbulb,
} from "lucide-react"

export default function Support() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [category, setCategory] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    { value: "bug", label: "Reportar un error", icon: Bug },
    { value: "feature", label: "Solicitar una función", icon: Lightbulb },
    { value: "question", label: "Tengo una pregunta", icon: HelpCircle },
    { value: "billing", label: "Consulta de facturación", icon: Mail },
    { value: "other", label: "Otro", icon: MessageCircle },
  ]

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setSubmitted(true)
    setSubmitting(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setCategory("")
      setMessage("")
    }, 3000)
  }

  const selectedCategory = categories.find((cat) => cat.value === category)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/app/mentions")}
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg transition-all duration-200 hover:opacity-80"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Listening Lab
              </span>
            </button>

            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-800/50"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl mb-2">
              <MessageCircle className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                ¿Necesitas ayuda?
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Estamos aquí para ayudarte. Cuéntanos qué necesitas y nos pondremos en contacto contigo lo antes
                posible.
              </p>
            </div>

            {/* User Info Badge */}
            {user && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">
                  Responderemos a <strong className="text-white">{user.email}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Form Card */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-white">Envíanos un mensaje</CardTitle>
                <CardDescription className="text-slate-400">
                  Completa el formulario y te responderemos dentro de las próximas 24 horas hábiles
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    ¿En qué podemos ayudarte?
                  </label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/95 backdrop-blur-xl border-slate-700/50">
                      {categories.map((cat) => {
                        const Icon = cat.icon
                        return (
                          <SelectItem
                            key={cat.value}
                            value={cat.value}
                            className="text-slate-300 focus:bg-slate-700/50 focus:text-white"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Cuéntanos más
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe tu consulta con el mayor detalle posible..."
                    className="w-full rounded-lg border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all duration-200"
                    required
                  />
                  <p className="text-xs text-slate-500">Mínimo 10 caracteres</p>
                </div>

                {/* Selected Category Preview */}
                {selectedCategory && (
                  <div className="flex items-center gap-2 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                    {(() => {
                      const Icon = selectedCategory.icon
                      return <Icon className="w-4 h-4 text-blue-400" />
                    })()}
                    <span className="text-sm text-slate-300">
                      Tipo de consulta: <strong className="text-white">{selectedCategory.label}</strong>
                    </span>
                  </div>
                )}

                {/* Success Message */}
                {submitted && (
                  <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-in slide-in-from-top-2 duration-200">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-400">¡Mensaje enviado exitosamente!</p>
                      <p className="text-xs text-green-300/80 mt-1">
                        Hemos recibido tu consulta y te responderemos pronto.
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || !category || !message || message.length < 10}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed h-12"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Additional Help */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-slate-800/30 to-slate-800/20 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email Directo</h3>
                    <p className="text-sm text-slate-400 mb-2">¿Prefieres escribirnos directamente?</p>
                    <a
                      href="mailto:soporte@listeninglab.com"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      soporte@listeninglab.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-800/30 to-slate-800/20 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Centro de Ayuda</h3>
                    <p className="text-sm text-slate-400 mb-2">Encuentra respuestas rápidas</p>
                    <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      Ver documentación →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
