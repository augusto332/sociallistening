import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Headset, Sparkles, ArrowLeft, Send } from "lucide-react"

export default function Support() {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState({ name: "", email: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/app/mentions")}
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-bold text-transparent">
              Listening Lab
            </span>
          </button>

          <Button
            variant="ghost"
            className="text-slate-300 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
            <Headset className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">¿Necesitas ayuda?</h1>
            <p className="text-base text-slate-400">
              Completa el formulario y nuestro equipo se pondrá en contacto contigo lo antes posible.
            </p>
          </div>
        </div>

        <Card className="border-slate-700/50 bg-slate-900/60 backdrop-blur-xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-white">Formulario de contacto</CardTitle>
              <CardDescription className="text-slate-400">
                Por ahora este formulario no envía información real, pero nos ayuda a saber qué necesitas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-300">
                  Nombre completo
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ingresa tu nombre"
                  value={formValues.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@empresa.com"
                  value={formValues.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-300">
                  ¿Cómo podemos ayudarte?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formValues.message}
                  onChange={handleChange}
                  placeholder="Cuéntanos brevemente tu consulta"
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              {submitted ? (
                <p className="text-sm text-emerald-300">
                  ¡Gracias! Hemos recibido tu mensaje y te contactaremos pronto.
                </p>
              ) : (
                <p className="text-sm text-slate-400">
                  Responderemos a tu solicitud dentro de las próximas 24 horas hábiles.
                </p>
              )}
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                <Send className="mr-2 h-4 w-4" />
                Enviar mensaje
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  )
}
