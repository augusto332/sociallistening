import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import KeywordTable from "@/components/KeywordTable"
import { Search, Plus } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function ConfigPage({
  newKeyword,
  setNewKeyword,
  openKeywordLangSelector,
  showKeywordLangs,
  setShowKeywordLangs,
  newKeywordLang,
  setNewKeywordLang,
  saveNewKeyword,
  addKeywordMessage,
  keywords,
  handleKeywordToggle,
  saveKeywordChanges,
  keywordChanges,
  saveKeywordMessage,
  accountId,
  accountSettingsVersion,
}) {
  const availableSources = useMemo(
    () => [
      { id: "youtube", label: "YouTube" },
      { id: "twitter", label: "Twitter" },
      { id: "reddit", label: "Reddit" },
      { id: "instagram", label: "Instagram" },
      { id: "tiktok", label: "Tiktok" },
      { id: "facebook", label: "Facebook" },
      { id: "others", label: "Otros" },
    ],
    [],
  )
  const defaultActiveSources = useMemo(
    () =>
      availableSources.reduce((acc, source) => {
        acc[source.id] = true
        return acc
      }, {}),
    [availableSources],
  )
  const [activeSources, setActiveSources] = useState(defaultActiveSources)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)

  useEffect(() => {
    if (!accountId) {
      setActiveSources(defaultActiveSources)
      return
    }

    let isMounted = true

    setSettingsMessage(null)

    const loadAccountSettings = async () => {
      setIsLoadingSettings(true)
      const { data, error } = await supabase
        .from("account_settings")
        .select(
          "is_youtube_active, is_twitter_active, is_reddit_active, is_instagram_active, is_tiktok_active, is_facebook_active, is_others_active",
        )
        .eq("account_id", accountId)
        .maybeSingle()

      if (!isMounted) return

      if (error) {
        console.error("Error fetching account settings", error)
        setActiveSources(defaultActiveSources)
      } else if (data) {
        setActiveSources({
          youtube: !!data.is_youtube_active,
          twitter: !!data.is_twitter_active,
          reddit: !!data.is_reddit_active,
          instagram: !!data.is_instagram_active,
          tiktok: !!data.is_tiktok_active,
          facebook: !!data.is_facebook_active,
          others: !!data.is_others_active,
        })
      } else {
        setActiveSources(defaultActiveSources)
      }

      setIsLoadingSettings(false)
    }

    loadAccountSettings()

    return () => {
      isMounted = false
    }
  }, [accountId, accountSettingsVersion, defaultActiveSources])

  const toggleSource = (id) => {
    setActiveSources((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSaveSettings = async () => {
    if (!accountId) return
    setIsSavingSettings(true)
    setSettingsMessage(null)

    const payload = {
      account_id: accountId,
      is_youtube_active: !!activeSources.youtube,
      is_twitter_active: !!activeSources.twitter,
      is_reddit_active: !!activeSources.reddit,
      is_instagram_active: !!activeSources.instagram,
      is_tiktok_active: !!activeSources.tiktok,
      is_facebook_active: !!activeSources.facebook,
      is_others_active: !!activeSources.others,
    }

    const { data, error } = await supabase
      .from("account_settings")
      .update(payload)
      .eq("account_id", accountId)
      .select()

    if (error) {
      console.error("Error saving account settings", error)
      setSettingsMessage({
        type: "error",
        text: error.message || "Ocurrió un error al guardar la configuración",
      })
    } else if (!data || data.length === 0) {
      console.warn(
        "No account settings rows were updated. Ensure the row exists or seed it via an authorized flow.",
      )
      setSettingsMessage({
        type: "error",
        text: "No se encontró configuración para esta cuenta. Crea el registro desde un flujo autorizado (por ejemplo, desde el backend) o registra la incidencia.",
      })
    } else {
      setSettingsMessage({ type: "success", text: "Configuración guardada" })
    }

    setIsSavingSettings(false)
  }

  const totalActiveSources = Object.values(activeSources).filter(Boolean).length

  return (
    <section className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">
          Configuración
        </h1>
        <p className="text-slate-400">Gestiona tus palabras clave y configuración del sistema</p>
      </div>

      <div className="space-y-8">
        <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Límites y preferencias de uso</h3>
              <p className="text-sm text-slate-400">
                Ajusta tus preferencias y decide cómo repartir tus menciones entre plataformas.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Fuentes activas</span>
                <span className="text-xs text-slate-400">
                  {totalActiveSources} / {availableSources.length} activas
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {availableSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">{source.label}</p>
                      <p className="text-xs text-slate-500">Incluye menciones de {source.label}</p>
                    </div>
                    <Switch checked={!!activeSources[source.id]} onCheckedChange={() => toggleSource(source.id)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onClick={handleSaveSettings}
                disabled={isSavingSettings || isLoadingSettings || !accountId}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
              >
                {isSavingSettings ? "Guardando..." : "Guardar"}
              </Button>
              {settingsMessage && (
                <p
                  className={`text-sm ${
                    settingsMessage.type === "error" ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {settingsMessage.text}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Agregar nueva keyword</h3>
            <div className="flex items-center gap-3">
              <Input
                className="flex-1 bg-slate-800/50 border-slate-700/50 text-white"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Nueva keyword"
              />
              <Button
                onClick={openKeywordLangSelector}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </Button>
            </div>
            {showKeywordLangs && (
              <div className="flex items-center gap-3 mt-4">
                <Select value={newKeywordLang} onValueChange={setNewKeywordLang}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecciona un idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">Inglés</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={saveNewKeyword}
                  disabled={!newKeywordLang}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                >
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowKeywordLangs(false)
                    setNewKeywordLang("")
                  }}
                  className="border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 bg-transparent"
                >
                  Cancelar
                </Button>
              </div>
            )}
            {addKeywordMessage && (
              <p className={`text-sm ${addKeywordMessage.type === "error" ? "text-red-400" : "text-green-400"}`}>
                {addKeywordMessage.text}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Palabras clave</h3>
            {keywords.length ? (
              <div className="bg-slate-800/50 rounded-lg p-4">
                <KeywordTable keywords={keywords} onToggle={handleKeywordToggle} />
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No hay keywords configuradas</p>
                <p className="text-slate-500 text-sm">Agrega tu primera keyword para comenzar</p>
              </div>
            )}

            <Button
              onClick={() => saveKeywordChanges()}
              disabled={Object.keys(keywordChanges).length === 0}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
            >
              Guardar cambios
            </Button>

            {saveKeywordMessage && (
              <p className={`text-sm ${saveKeywordMessage.type === "error" ? "text-red-400" : "text-green-400"}`}>
                {saveKeywordMessage.text}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
