"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  User,
  Mail,
  Lock,
  Shield,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff,
  Crown,
  Calendar,
  TrendingUp,
  LogOut,
  CreditCard,
  CircleHelp,
  Headset,
  CircleUser,
  ChevronDown,
  Menu,
} from "lucide-react"

export const planConfig = {
  free: {
    label: "Plan Gratuito",
    color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    icon: User,
  },
  basic: {
    label: "Plan Básico",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: CircleUser,
  },
  pro: {
    label: "Plan Pro",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    icon: Sparkles,
  },
  enterprise: {
    label: "Plan Enterprise",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: TrendingUp,
  },
}

export default function Account() {
  const { user, plan, planLoading } = useAuth()
  const [accountEmail, setAccountEmail] = useState("")
  const [accountName, setAccountName] = useState("")
  const [originalAccountName, setOriginalAccountName] = useState("")
  const [nameMessage, setNameMessage] = useState(null)
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [accountCreatedAt, setAccountCreatedAt] = useState(null)
  const [stats, setStats] = useState({ mentions: 0, keywords: 0 })
  const [activeSection, setActiveSection] = useState("profile")
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpMenuOpen, setHelpMenuOpen] = useState(false)
  const helpMenuRef = useRef(null)
  const userMenuRef = useRef(null)
  const [isAccountSidebarOpen, setIsAccountSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const avatarDisplayName = user?.user_metadata?.display_name || user?.email || ""
  const avatarLabel = avatarDisplayName ? avatarDisplayName.charAt(0).toUpperCase() : "U"
  const planTier = plan ?? "free"
  const currentPlanConfig = planConfig[planTier] ?? planConfig.free
  const isPaidPlan = planTier !== "free"

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target)) {
        setHelpMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [])

  const openAccountSidebar = () => setIsAccountSidebarOpen(true)
  const closeAccountSidebar = () => setIsAccountSidebarOpen(false)

  useEffect(() => {
    const fetchAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const displayName = user.user_metadata?.display_name || ""
        setAccountEmail(user.email || "")
        setAccountName(displayName)
        setOriginalAccountName(displayName)
        setAccountCreatedAt(user.created_at)
      }
    }

    fetchAccount()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      const { count: keywordsCount } = await supabase
        .from("dim_keywords")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("active", true)

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { count: mentionsCount } = await supabase
        .from("fact_mentions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo.toISOString())

      setStats({
        keywords: keywordsCount || 0,
        mentions: mentionsCount || 0,
      })
    }

    fetchStats()
  }, [user])

  const togglePasswordFields = () => {
    setShowPasswordFields((prev) => !prev)
    setPasswordMessage(null)
    setCurrentPassword("")
    setNewPassword("")
  }

  const getPasswordStrength = (password) => {
    const requirements = [
      { test: password.length >= 8, text: "Al menos 8 caracteres" },
      { test: /[A-Z]/.test(password), text: "Una letra mayúscula" },
      { test: /[a-z]/.test(password), text: "Una letra minúscula" },
      { test: /\d/.test(password), text: "Un número" },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "Un carácter especial" },
    ]

    const passed = requirements.filter((req) => req.test).length
    return { requirements, passed, total: requirements.length }
  }

  const passwordStrength = getPasswordStrength(newPassword)
  const isPasswordValid = passwordStrength.passed >= 3

  const handleChangePassword = async () => {
    setPasswordMessage(null)

    if (!isPasswordValid) {
      setPasswordMessage({ type: "error", text: "La contraseña debe cumplir al menos 3 requisitos" })
      return
    }

    setChangingPassword(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: accountEmail,
        password: currentPassword,
      })

      if (signInError) {
        setPasswordMessage({ type: "error", text: "Contraseña actual incorrecta" })
        setChangingPassword(false)
        return
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        setPasswordMessage({ type: "error", text: error.message })
      } else {
        setPasswordMessage({ type: "success", text: "Contraseña actualizada exitosamente" })
        setShowPasswordFields(false)
        setCurrentPassword("")
        setNewPassword("")
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSaveAccountName = async () => {
    setNameMessage(null)
    setSavingName(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: accountName },
      })

      if (error) {
        setNameMessage({ type: "error", text: error.message })
      } else {
        setNameMessage({ type: "success", text: "Nombre actualizado exitosamente" })
        setOriginalAccountName(accountName)
      }
    } finally {
      setSavingName(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setMenuOpen(false)
    setHelpMenuOpen(false)
    navigate("/login")
  }

  const handleLogoClick = () => {
    setMenuOpen(false)
    setHelpMenuOpen(false)
    navigate("/app/mentions")
  }

  const getPlanBadge = () => {
    if (planLoading) return null

    const config = planConfig[plan] ?? planConfig.free
    const PlanIcon = config.icon

    return (
      <Badge variant="secondary" className={`${config.color} flex items-center gap-1.5 px-3 py-1.5`}>
        <PlanIcon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const menuItems = [
    {
      id: "profile",
      title: "Mi Perfil",
      icon: User,
    },
    {
      id: "security",
      title: "Seguridad",
      icon: Shield,
    },
    {
      id: "plan",
      title: "Plan y Facturación",
      icon: CreditCard,
    },
  ]

  const renderSidebarContent = (onItemSelect) => (
    <nav className="space-y-1 flex-1">
      {menuItems.map((item) => {
        const Icon = item.icon
        const handleClick = () => {
          setActiveSection(item.id)
          if (onItemSelect) {
            onItemSelect()
          }
        }

        return (
          <button
            key={item.id}
            onClick={handleClick}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
              activeSection === item.id
                ? "bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-700/50",
            )}
          >
            <Icon className="w-4 h-4" />
            {item.title}
          </button>
        )
      })}
    </nav>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl mb-1">{accountName || "Usuario"}</CardTitle>
                      <CardDescription className="text-slate-400">{accountEmail}</CardDescription>
                      <div className="mt-2">{getPlanBadge()}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-px bg-slate-700/50 mb-6" />

                {/* Account Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">Miembro desde</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{formatDate(accountCreatedAt)}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-400">Keywords activas</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{stats.keywords}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-slate-400">Menciones (30 días)</span>
                    </div>
                    <p className="text-lg font-semibold text-white">{stats.mentions}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-slate-700/50 mb-6" />

                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Información Personal</h3>

                  {/* Email (Read Only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Correo electrónico
                    </label>
                    <Input
                      className="bg-slate-800/50 border-slate-700/50 text-white cursor-not-allowed"
                      value={accountEmail}
                      readOnly
                    />
                    <p className="text-xs text-slate-500">El correo electrónico no se puede modificar</p>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nombre de usuario</label>
                    <div className="flex items-center gap-3">
                      <Input
                        className="bg-slate-800/50 border-slate-700/50 text-white flex-1 focus:border-blue-500/50 focus:ring-blue-500/20"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Tu nombre"
                      />
                      {accountName !== originalAccountName && (
                        <Button
                          onClick={handleSaveAccountName}
                          disabled={savingName || !accountName.trim()}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                        >
                          {savingName ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Guardar
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    {nameMessage && (
                      <div
                        className={`p-3 rounded-lg border flex items-center gap-2 ${
                          nameMessage.type === "error"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-green-500/10 border-green-500/20 text-green-400"
                        }`}
                      >
                        {nameMessage.type === "success" ? (
                          <Check className="w-4 h-4 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="text-sm">{nameMessage.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "security":
        return (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <CardTitle className="text-white">Seguridad</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Gestiona tu contraseña y configuración de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showPasswordFields ? (
                <Button
                  onClick={togglePasswordFields}
                  variant="outline"
                  className="w-full border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 bg-slate-800/30"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Cambiar contraseña
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Contraseña actual</label>
                    <div className="relative">
                      <Input
                        className="bg-slate-800/50 border-slate-700/50 text-white pr-10 focus:border-blue-500/50 focus:ring-blue-500/20"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Nueva contraseña</label>
                    <div className="relative">
                      <Input
                        className="bg-slate-800/50 border-slate-700/50 text-white pr-10 focus:border-blue-500/50 focus:ring-blue-500/20"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {newPassword && (
                      <div className="p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-300">Seguridad de la contraseña</span>
                        </div>
                        <div className="space-y-1">
                          {passwordStrength.requirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              {req.test ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <X className="w-3 h-3 text-slate-500" />
                              )}
                              <span className={req.test ? "text-green-400" : "text-slate-500"}>{req.text}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full ${
                                i < passwordStrength.passed
                                  ? passwordStrength.passed <= 2
                                    ? "bg-red-500"
                                    : passwordStrength.passed <= 3
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  : "bg-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Password Message */}
                  {passwordMessage && (
                    <div
                      className={`p-3 rounded-lg border flex items-center gap-2 ${
                        passwordMessage.type === "error"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-green-500/10 border-green-500/20 text-green-400"
                      }`}
                    >
                      {passwordMessage.type === "success" ? (
                        <Check className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      )}
                      <span className="text-sm">{passwordMessage.text}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleChangePassword}
                      disabled={changingPassword || !currentPassword || !newPassword || !isPasswordValid}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                    >
                      {changingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Guardar cambios
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={togglePasswordFields}
                      variant="outline"
                      className="border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 bg-slate-800/30"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "plan":
        return (
          <div className="space-y-6">
            {/* Current Plan */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Plan Actual</CardTitle>
                </div>
                <CardDescription className="text-slate-400">Información sobre tu suscripción</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
                  <div>
                    <h4 className="font-medium text-white mb-1">{currentPlanConfig.label}</h4>
                    <p className="text-sm text-slate-400">
                      {isPaidPlan
                        ? "Acceso completo a las funciones avanzadas"
                        : "Acceso básico a funciones de monitoreo"}
                    </p>
                  </div>
                  {getPlanBadge()}
                </div>

              </CardContent>
            </Card>

            {/* Upgrade Card */}
            {planTier !== "enterprise" && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <h3 className="text-2xl font-bold text-white">Actualiza tu plan</h3>
                  </div>
                  <p className="text-slate-300 mb-6">Descubre funciones avanzadas y elige el plan que mejor se adapte a tu equipo.</p>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25"
                    onClick={() => alert("Próximamente: página de planes y precios")}
                  >
                    <Crown className="w-5 h-5 mr-2" />
                    Actualiza tu plan
                  </Button>
                </div>
              </div>
            )}

          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-lg transition-all duration-200 hover:opacity-80"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Listening Lab
            </span>
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                openAccountSidebar()
                setMenuOpen(false)
                setHelpMenuOpen(false)
              }}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-700/60 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
              aria-label="Abrir menú de Mi Cuenta"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative" ref={helpMenuRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setHelpMenuOpen((prev) => !prev)
                  setMenuOpen(false)
                }}
                className="text-slate-300 hover:text-white"
              >
                <CircleHelp className="w-4 h-4" />
              </Button>
              {helpMenuOpen && (
                <div className="absolute right-0 top-12 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-lg p-2 space-y-1 z-50 min-w-[210px]">
                  <button
                    onClick={() => {
                      setHelpMenuOpen(false)
                      navigate("/app/support")
                    }}
                    className="flex items-center gap-3 w-full text-left p-3 rounded-md hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
                  >
                    <Headset className="w-4 h-4" />
                    Solicitar soporte
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                onClick={() => {
                  setMenuOpen((prev) => !prev)
                  setHelpMenuOpen(false)
                }}
                className="flex items-center gap-2 text-slate-300 hover:text-white"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src="/placeholder.svg?height=28&width=28" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                    {avatarLabel}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4" />
              </Button>

              {menuOpen && (
                <div className="absolute right-0 top-12 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-lg p-2 space-y-1 z-50 min-w-[180px]">
                  <button
                    onClick={() => {
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
          </div>
        </div>
      </header>

      {isAccountSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={closeAccountSidebar} />
          <div className="relative ml-0 flex h-full">
            <div
              className="relative h-full w-72 max-w-[80vw] bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 p-6 flex flex-col space-y-2 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Mi Cuenta</h2>
                <button
                  type="button"
                  onClick={closeAccountSidebar}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                  aria-label="Cerrar menú de Mi Cuenta"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderSidebarContent(closeAccountSidebar)}
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <aside className="hidden lg:flex w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 p-6 flex-col space-y-2 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          {renderSidebarContent()}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {activeSection === "profile" && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
                  {menuItems.find((item) => item.id === activeSection)?.title}
                </h1>
                <p className="text-slate-400">Información general de tu cuenta</p>
              </div>
            )}

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
