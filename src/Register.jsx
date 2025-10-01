import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Shield,
  Check,
  X,
} from "lucide-react"

export default function ModernRegister() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const navigate = useNavigate()

  // Password strength validation
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

  const passwordStrength = getPasswordStrength(password)
  const isPasswordValid = passwordStrength.passed >= 3
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    // Validations
    if (!name.trim()) {
      setError("El nombre es requerido")
      return
    }

    if (!isPasswordValid) {
      setError("La contraseña debe cumplir al menos 3 de los requisitos")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setRegistered(true)
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-4">
              ¡Cuenta creada exitosamente!
            </h1>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-6">
                <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-green-400">Verifica tu correo electrónico</p>
                  <p className="text-xs text-green-300/80">Hemos enviado un enlace de confirmación a {email}</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mb-6">
                Revisa tu bandeja de entrada y haz clic en el enlace de confirmación para activar tu cuenta.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
              >
                Ir al inicio de sesión
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-slate-500 text-sm">
              ¿No recibiste el correo?{" "}
              <button className="text-blue-400 hover:text-blue-300 transition-colors">Reenviar confirmación</button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
              Crear cuenta
            </h1>
            <p className="text-slate-400">Únete a Listening Lab y comienza a monitorear tu marca</p>
          </div>

          {/* Register Form */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Nombre completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder:text-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 p-3 bg-slate-700/30 border border-slate-600/30 rounded-lg">
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

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 block">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-11 pr-12 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-slate-400 focus:ring-2 focus:outline-none transition-all duration-200 ${
                      confirmPassword
                        ? passwordsMatch
                          ? "border-green-500/50 focus:border-green-500/50 focus:ring-green-500/20"
                          : "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20"
                        : "border-slate-700/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="flex items-center gap-2 mt-1">
                    {passwordsMatch ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-400">Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading || !isPasswordValid || !passwordsMatch || !name.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear cuenta
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              Al crear una cuenta, aceptas nuestros{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                Términos de Servicio
              </a>{" "}
              y{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
