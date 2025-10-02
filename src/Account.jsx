import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Account() {
  const [accountEmail, setAccountEmail] = useState("")
  const [accountName, setAccountName] = useState("")
  const [originalAccountName, setOriginalAccountName] = useState("")
  const [nameMessage, setNameMessage] = useState(null)
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

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
      }
    }

    fetchAccount()
  }, [])

  const togglePasswordFields = () => {
    setShowPasswordFields((prev) => !prev)
    setPasswordMessage(null)
    setCurrentPassword("")
    setNewPassword("")
  }

  const handleChangePassword = async () => {
    setPasswordMessage(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: accountEmail,
      password: currentPassword,
    })

    if (signInError) {
      setPasswordMessage({ type: "error", text: "Contraseña actual incorrecta" })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordMessage({ type: "error", text: error.message })
    } else {
      setPasswordMessage({ type: "success", text: "Contraseña actualizada" })
      setShowPasswordFields(false)
      setCurrentPassword("")
      setNewPassword("")
    }
  }

  const handleSaveAccountName = async () => {
    setNameMessage(null)

    const { error } = await supabase.auth.updateUser({
      data: { display_name: accountName },
    })

    if (error) {
      setNameMessage({ type: "error", text: error.message })
    } else {
      setNameMessage({ type: "success", text: "Nombre actualizado" })
      setOriginalAccountName(accountName)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <section className="p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
            Mi Cuenta
          </h1>
          <p className="text-slate-400">Gestiona tu información personal y configuración</p>
        </div>

        <div className="space-y-8">
          <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Correo electrónico</label>
                <Input className="bg-slate-800/50 border-slate-700/50 text-white" value={accountEmail} readOnly />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Nombre de usuario</label>
                <div className="flex items-center gap-3">
                  <Input
                    className="bg-slate-800/50 border-slate-700/50 text-white flex-1"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                  />
                  {accountName !== originalAccountName && (
                    <Button
                      onClick={handleSaveAccountName}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Guardar
                    </Button>
                  )}
                </div>
                {nameMessage && (
                  <p className={`text-sm mt-2 ${nameMessage.type === "error" ? "text-red-400" : "text-green-400"}`}>
                    {nameMessage.text}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
            <CardContent className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">Seguridad</h3>

              <Button
                onClick={togglePasswordFields}
                variant="outline"
                className="border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 bg-transparent"
              >
                Cambiar contraseña
              </Button>

              {showPasswordFields && (
                <div className="space-y-4 pt-4 border-t border-slate-700/50">
                  <Input
                    className="bg-slate-800/50 border-slate-700/50 text-white"
                    type="password"
                    placeholder="Contraseña actual"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    className="bg-slate-800/50 border-slate-700/50 text-white"
                    type="password"
                    placeholder="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    onClick={handleChangePassword}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Guardar cambios
                  </Button>
                </div>
              )}

              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.type === "error" ? "text-red-400" : "text-green-400"}`}>
                  {passwordMessage.text}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
