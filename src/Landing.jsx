"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sparkles,
  TrendingUp,
  BarChart3,
  Zap,
  Shield,
  Globe,
  MessageSquare,
  Bell,
  CheckCircle,
  Crown,
  ArrowRight,
  Menu,
  X,
  Twitter,
  Linkedin,
  Github,
  Mail,
  ChevronDown,
} from "lucide-react"

export default function Landing() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [openFaq, setOpenFaq] = useState(null)

  // Text carousel states
  const [currentHeadingIndex, setCurrentHeadingIndex] = useState(0)
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Carousel content
  const headingVariations = ["redes sociales", "tiempo real", "múltiples plataformas", "un solo lugar"]

  const descriptionVariations = [
    "Descubre qué se dice sobre tu marca en tiempo real. Analiza sentimientos, identifica tendencias y toma decisiones basadas en datos con inteligencia artificial.",
    "Analiza la competencia y descubre oportunidades de mercado. Identifica qué estrategias funcionan y optimiza tu presencia digital con insights accionables.",
    "Identifica crisis de reputación antes de que escalen. Recibe alertas instantáneas sobre menciones negativas y protege la imagen de tu marca proactivamente.",
    "Optimiza tu estrategia de contenido con datos reales. Descubre qué temas resuenan con tu audiencia y mejora tu engagement en redes sociales.",
  ]

  // Carousel effect for heading
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentHeadingIndex((prev) => (prev + 1) % headingVariations.length)
        setIsTransitioning(false)
      }, 300)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Carousel effect for description (slightly offset timing)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDescriptionIndex((prev) => (prev + 1) % descriptionVariations.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: MessageSquare,
      title: "Monitoreo en Tiempo Real",
      description: "Rastrea menciones de tu marca en múltiples plataformas sociales instantáneamente",
    },
    {
      icon: Sparkles,
      title: "Análisis con IA",
      description: "Obtén insights automáticos sobre sentimientos y tendencias con inteligencia artificial",
    },
    {
      icon: BarChart3,
      title: "Reportes Detallados",
      description: "Visualiza datos complejos de forma simple con gráficos interactivos y reportes personalizables",
    },
    {
      icon: Bell,
      title: "Alertas Inteligentes",
      description: "Recibe notificaciones cuando se detecten menciones importantes de tu marca",
    },
    {
      icon: Globe,
      title: "Multi-Plataforma",
      description: "Monitorea YouTube, Reddit, Twitter y más redes sociales desde un solo lugar",
    },
    {
      icon: Shield,
      title: "Seguro y Confiable",
      description: "Tus datos están protegidos con encriptación de nivel empresarial",
    },
  ]

  const plans = [
    {
      name: "Básico",
      price: "$29.99",
      period: "por mes",
      description: "Ideal para quienes están comenzando con el monitoreo",
      features: [
        "Hasta 3,000 menciones/mes",
        "Análisis de sentimiento básico",
        "Reportes descargables estándar",
        "Historial de menciones por 1 mes",
        "Soporte vía correo electrónico",
      ],
      limitations: ["No incluye comentarios", "Sin clasificación automática AI", "Sin resúmenes automáticos"],
      icon: TrendingUp,
      cta: "Probar 7 días gratis",
      highlighted: false,
      trial: true,
    },
    {
      name: "Pro",
      price: "$99.99",
      period: "por mes",
      description: "Para equipos que necesitan análisis profundo con IA",
      features: [
        "Hasta 10,000 menciones/mes",
        "Análisis avanzado con IA",
        "Incluye comentarios de menciones",
        "Clasificación automática por IA",
        "Reportes avanzados impulsados por IA",
        "Historial de menciones por 1 año",
        "Soporte personalizado prioritario",
      ],
      limitations: [],
      icon: Crown,
      cta: "Probar 7 días gratis",
      highlighted: true,
      trial: true,
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      period: "",
      description: "Para organizaciones con grandes volúmenes de datos",
      features: [
        "Límite de menciones a medida",
        "Funcionalidades personalizadas",
        "Todas las funcionalidades Pro",
        "Integraciones a medida",
        "Historial configurable",
        "Soporte premium 24/7",
        "Account Manager dedicado",
        "Acompañamiento estratégico",
      ],
      limitations: [],
      icon: Shield,
      cta: "Contactar Ventas",
      highlighted: false,
      trial: false,
    },
  ]

  const steps = [
    {
      number: "01",
      title: "Configura tus Keywords",
      description:
        "Define las palabras clave que quieres monitorear: tu marca, productos, competidores o términos relevantes.",
    },
    {
      number: "02",
      title: "Conecta tus Plataformas",
      description:
        "Selecciona las redes sociales que deseas rastrear. Nuestro sistema comenzará a recopilar menciones automáticamente.",
    },
    {
      number: "03",
      title: "Analiza y Actúa",
      description: "Visualiza insights en tiempo real, recibe alertas importantes y toma decisiones basadas en datos.",
    },
  ]

  const faqs = [
    {
      question: "¿Qué plataformas soportan?",
      answer:
        "Actualmente soportamos YouTube, Reddit, Twitter, Instagram, Facebook y TikTok. Estamos agregando nuevas plataformas constantemente.",
    },
    {
      question: "¿Cómo funciona el análisis de sentimientos?",
      answer:
        "Utilizamos inteligencia artificial avanzada para analizar el tono y contexto de cada mención, clasificándolas como positivas, negativas o neutrales.",
    },
    {
      question: "¿Puedo cambiar de plan en cualquier momento?",
      answer:
        "Sí, puedes actualizar o cancelar tu plan en cualquier momento desde tu panel de control. Los cambios se aplican inmediatamente.",
    },
    {
      question: "¿Hay límite en el número de menciones?",
      answer:
        "No, no hay límite en el número de menciones que puedes monitorear. Tu plan solo limita las keywords y plataformas.",
    },
    {
      question: "¿Ofrecen soporte técnico?",
      answer: "Sí, ofrecemos soporte por email para el plan gratuito y soporte prioritario 24/7 para usuarios premium.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Listening Lab
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">
                Características
              </a>
              <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">
                Precios
              </a>
              <a href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">
                Cómo Funciona
              </a>
              <a href="#faq" className="text-sm text-slate-300 hover:text-white transition-colors">
                FAQ
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" className="text-slate-300 hover:text-white" onClick={() => navigate("/login")}>
                Iniciar Sesión
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => navigate("/register")}
              >
                Comenzar Gratis
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
              <a
                href="#features"
                className="block text-sm text-slate-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#pricing"
                className="block text-sm text-slate-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Precios
              </a>
              <a
                href="#how-it-works"
                className="block text-sm text-slate-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cómo Funciona
              </a>
              <a
                href="#faq"
                className="block text-sm text-slate-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 bg-transparent"
                  onClick={() => navigate("/login")}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={() => navigate("/register")}
                >
                  Comenzar Gratis
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge
              variant="secondary"
              className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-400 border-blue-500/20"
            >
              <Zap className="w-3 h-3 mr-1" />
              Powered by AI
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Monitorea tu marca en
              </span>
              <br />
              <span
                className={`inline-block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent transition-all duration-300 ${
                  isTransitioning ? "opacity-0 transform -translate-y-2" : "opacity-100 transform translate-y-0"
                }`}
                style={{ minHeight: "1.2em" }}
              >
                {headingVariations[currentHeadingIndex]}
              </span>
            </h1>

            <div className="relative min-h-[120px] md:min-h-[100px] mb-8">
              <p
                className={`text-lg md:text-xl text-slate-400 max-w-2xl mx-auto absolute inset-0 transition-all duration-500 ${
                  currentDescriptionIndex === 0
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 transform -translate-y-4 pointer-events-none"
                }`}
              >
                {descriptionVariations[0]}
              </p>
              <p
                className={`text-lg md:text-xl text-slate-400 max-w-2xl mx-auto absolute inset-0 transition-all duration-500 ${
                  currentDescriptionIndex === 1
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 transform -translate-y-4 pointer-events-none"
                }`}
              >
                {descriptionVariations[1]}
              </p>
              <p
                className={`text-lg md:text-xl text-slate-400 max-w-2xl mx-auto absolute inset-0 transition-all duration-500 ${
                  currentDescriptionIndex === 2
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 transform -translate-y-4 pointer-events-none"
                }`}
              >
                {descriptionVariations[2]}
              </p>
              <p
                className={`text-lg md:text-xl text-slate-400 max-w-2xl mx-auto absolute inset-0 transition-all duration-500 ${
                  currentDescriptionIndex === 3
                    ? "opacity-100 transform translate-y-0"
                    : "opacity-0 transform -translate-y-4 pointer-events-none"
                }`}
              >
                {descriptionVariations[3]}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                onClick={() => navigate("/register")}
              >
                Comenzar Gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50 bg-transparent"
                onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              >
                Ver Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">Configuración en 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm">Cancela cuando quieras</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-slate-800/50 text-slate-300 border-slate-700/50">
              Características
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas para
              <br />
              monitorear tu marca
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Herramientas poderosas diseñadas para ayudarte a entender y gestionar tu presencia en redes sociales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm hover:bg-gradient-to-br hover:from-slate-800/70 hover:to-slate-800/50 transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-slate-800/50 text-slate-300 border-slate-700/50">
              Cómo Funciona
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Comienza en 3 simples pasos</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Configurar tu monitoreo es rápido y sencillo. Estarás rastreando menciones en minutos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 mb-6">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-blue-500/30 to-purple-600/30"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-slate-800/50 text-slate-300 border-slate-700/50">
              Precios
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planes simples y transparentes</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Todos los planes incluyen prueba gratuita de 7 días. Sin tarjeta de crédito requerida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const Icon = plan.icon
              return (
                <Card
                  key={index}
                  className={`relative ${
                    plan.highlighted
                      ? "bg-gradient-to-br from-slate-800/70 to-slate-800/50 border-blue-500/50 shadow-xl shadow-blue-500/10"
                      : "bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50"
                  } backdrop-blur-sm`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                        Más Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          plan.highlighted
                            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20"
                            : "bg-gradient-to-r from-slate-500/20 to-slate-600/20"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${plan.highlighted ? "text-amber-400" : "text-slate-400"}`} />
                      </div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-slate-400">{plan.period}</span>
                      </div>
                      <p className="text-sm text-slate-400">{plan.description}</p>
                    </div>

                    {plan.trial && (
                      <Badge variant="secondary" className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Prueba gratuita de 7 días
                      </Badge>
                    )}

                    <Button
                      className={`w-full mb-6 ${
                        plan.highlighted
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                          : "bg-slate-700 hover:bg-slate-600"
                      }`}
                      onClick={() => {
                        if (plan.name === "Enterprise") {
                          window.location.href = "mailto:ventas@listeninglab.com?subject=Consulta Plan Enterprise"
                        } else {
                          navigate("/register")
                        }
                      }}
                    >
                      {plan.cta}
                    </Button>

                    <div className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <X className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-500">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Demo Section - Placeholder */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-slate-800/50 text-slate-300 border-slate-700/50">
              Demo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Mira Listening Lab en acción</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Descubre cómo nuestra herramienta te ayuda a entender tu presencia en redes sociales
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 aspect-video flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">Demo interactivo próximamente</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 bg-slate-800/50 text-slate-300 border-slate-700/50">
              FAQ
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Preguntas Frecuentes</h2>
            <p className="text-lg text-slate-400">Todo lo que necesitas saber sobre Listening Lab</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm"
              >
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-white pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6 text-slate-400 animate-in slide-in-from-top-2 duration-200">
                      {faq.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-2xl"></div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para empezar?</h2>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                Únete a cientos de marcas que ya confían en Listening Lab para monitorear su presencia en redes sociales
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-900/50 border-slate-700/50 text-white placeholder:text-slate-500"
                />
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 whitespace-nowrap"
                  onClick={() => navigate("/register")}
                >
                  Comenzar Gratis
                </Button>
              </div>

              <p className="text-sm text-slate-400 mt-4">Sin tarjeta de crédito requerida. Cancela cuando quieras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Listening Lab
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Monitorea tu marca en redes sociales con inteligencia artificial
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Características
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Precios
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Integraciones
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Actualizaciones
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4">Compañía</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Sobre Nosotros
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Carreras
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Cookies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                    Licencias
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">© 2025 Listening Lab. Todos los derechos reservados.</p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="w-4 h-4" />
              <a href="mailto:hola@listeninglab.com" className="hover:text-slate-400 transition-colors">
                hola@listeninglab.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
