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
  const [keywordDistribution, setKeywordDistribution] = useState([])
  const [savedKeywordDistribution, setSavedKeywordDistribution] = useState(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsMessage, setSettingsMessage] = useState(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)

  const distributeByRatio = (items, total) => {
    if (!items.length) return []
    if (total <= 0) {
      return items.map((item) => ({ ...item, percentage: 0 }))
    }

    const currentTotal = items.reduce((sum, item) => sum + item.percentage, 0)

    if (currentTotal === 0) {
      const even = Math.floor(total / items.length)
      let remainder = total - even * items.length
      return items.map((item, index) => ({
        ...item,
        percentage: even + (index < remainder ? 1 : 0),
      }))
    }

    const normalized = items.map((item) => {
      const raw = (item.percentage / currentTotal) * total
      const base = Math.floor(raw)
      return {
        ...item,
        percentage: base,
        remainder: raw - base,
      }
    })

    let remainder = total - normalized.reduce((sum, item) => sum + item.percentage, 0)
    const remainderOrder = normalized
      .map((item, index) => ({ index, remainder: item.remainder }))
      .sort((a, b) => b.remainder - a.remainder)

    for (let i = 0; i < remainderOrder.length && remainder > 0; i++) {
      const { index } = remainderOrder[i]
      normalized[index].percentage += 1
      remainder -= 1
    }

    return normalized.map(({ remainder, ...item }) => item)
  }

  useEffect(() => {
    if (!accountId) {
      setActiveSources(defaultActiveSources)
      setSavedKeywordDistribution(null)
      setKeywordDistribution([])
      return
    }

    let isMounted = true

    setSettingsMessage(null)

    const loadAccountSettings = async () => {
      setIsLoadingSettings(true)
      const { data, error } = await supabase
        .from("account_settings")
        .select(
          "keyword_distribution, is_youtube_active, is_twitter_active, is_reddit_active, is_instagram_active, is_tiktok_active, is_facebook_active, is_others_active",
        )
        .eq("account_id", accountId)
        .maybeSingle()

      if (!isMounted) return

      if (error) {
        console.error("Error fetching account settings", error)
        setActiveSources(defaultActiveSources)
        setSavedKeywordDistribution(null)
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
        setSavedKeywordDistribution(
          Array.isArray(data.keyword_distribution) || data.keyword_distribution === null
            ? data.keyword_distribution
            : null,
        )
      } else {
        setActiveSources(defaultActiveSources)
        setSavedKeywordDistribution(null)
      }

      setIsLoadingSettings(false)
    }

    loadAccountSettings()

    return () => {
      isMounted = false
    }
  }, [accountId, accountSettingsVersion, defaultActiveSources])

  useEffect(() => {
    if (!keywords.length) {
      setKeywordDistribution([])
      return
    }

    const savedItems = Array.isArray(savedKeywordDistribution)
      ? savedKeywordDistribution
      : []

    setKeywordDistribution((prev) => {
      const prevMap = new Map(prev.map((item) => [item.id, item]))
      const savedMap = new Map(
        savedItems.map((item) => [item.keyword_id, item.percentage ?? 0]),
      )

      const activeKeywords = keywords.filter((keyword) => keyword.active)
      const inactiveKeywords = keywords.filter((keyword) => !keyword.active)

      const activeItems = activeKeywords.map((keyword) => {
        const prevItem = prevMap.get(keyword.keyword_id)
        const savedValue = savedMap.get(keyword.keyword_id)

        const basePercentage =
          typeof prevItem?.percentage === "number"
            ? prevItem.percentage
            : typeof savedValue === "number"
              ? savedValue
              : 0

        return {
          id: keyword.keyword_id,
          label: keyword.keyword,
          percentage: basePercentage,
          active: true,
        }
      })

      const redistributedActive = activeItems.length
        ? distributeByRatio(activeItems, 100)
        : []

      const inactiveItems = inactiveKeywords.map((keyword) => ({
        id: keyword.keyword_id,
        label: keyword.keyword,
        percentage: 0,
        active: false,
      }))

      const combined = new Map(
        [...redistributedActive, ...inactiveItems].map((item) => [item.id, item]),
      )

      return keywords.map((keyword) => {
        const item = combined.get(keyword.keyword_id)
        if (item) {
          return item
        }

        return {
          id: keyword.keyword_id,
          label: keyword.keyword,
          percentage: 0,
          active: !!keyword.active,
        }
      })
    })
  }, [keywords, savedKeywordDistribution])

  const activeKeywordCount = useMemo(
    () => keywordDistribution.filter((item) => item.active).length,
    [keywordDistribution],
  )

  const toggleSource = (id) => {
    setActiveSources((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleDistributionChange = (id, value) => {
    const normalizedValue = Math.max(0, Math.min(100, value))

    setKeywordDistribution((prev) => {
      if (!prev.length) return prev

      const targetIndex = prev.findIndex((item) => item.id === id)
      if (targetIndex === -1) return prev

      const target = prev[targetIndex]
      if (!target.active) return prev

      const activeItems = prev.filter((item) => item.active)
      if (activeItems.length <= 1) {
        return prev.map((item) => {
          if (!item.active) {
            return { ...item, percentage: 0 }
          }

          return {
            ...item,
            percentage: item.id === id ? 100 : 0,
          }
        })
      }

      const remainder = 100 - normalizedValue
      const others = activeItems
        .filter((item) => item.id !== id)
        .map((item) => ({ ...item }))

      const redistributedOthers = distributeByRatio(others, remainder)
      const updatedMap = new Map(
        redistributedOthers.map((item) => [item.id, item]),
      )

      return prev.map((item) => {
        if (!item.active) {
          return { ...item, percentage: 0 }
        }

        if (item.id === id) {
          return { ...item, percentage: normalizedValue }
        }

        const updated = updatedMap.get(item.id)
        return updated ? { ...item, percentage: updated.percentage } : item
      })
    })
  }

  const handleSaveSettings = async () => {
    if (!accountId) return
    setIsSavingSettings(true)
    setSettingsMessage(null)

    const formattedDistribution = keywordDistribution.length
      ? keywordDistribution.map((item) => ({
          keyword_id: item.id,
          percentage: item.percentage,
        }))
      : null

    const payload = {
      account_id: accountId,
      is_youtube_active: !!activeSources.youtube,
      is_twitter_active: !!activeSources.twitter,
      is_reddit_active: !!activeSources.reddit,
      is_instagram_active: !!activeSources.instagram,
      is_tiktok_active: !!activeSources.tiktok,
      is_facebook_active: !!activeSources.facebook,
      is_others_active: !!activeSources.others,
      keyword_distribution: formattedDistribution,
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
      setSavedKeywordDistribution(formattedDistribution)
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
                Ajusta tus preferencias y decide cómo repartir tus menciones entre plataformas y keywords.
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">
                  Distribución de menciones por palabra clave
                </span>
                <span className="text-xs text-slate-400">Distribuye el 100% de tus menciones</span>
              </div>

              {keywordDistribution.length ? (
                <div className="space-y-4">
                  {keywordDistribution.map((item) => {
                    const isActive = item.active
                    const sliderDisabled = !isActive || activeKeywordCount <= 1
                    return (
                      <div
                        key={item.id}
                        className={`space-y-2 ${isActive ? "" : "opacity-60"}`}
                      >
                        <div
                          className={`flex items-center justify-between text-sm ${
                            isActive ? "text-slate-300" : "text-slate-500"
                          }`}
                        >
                          <span className="font-medium">{item.label}</span>
                          <span className={`${isActive ? "text-slate-400" : "text-slate-500"}`}>
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="relative h-3">
                          <div
                            className={`h-2 rounded-full ${
                              isActive ? "bg-slate-700/60" : "bg-slate-800/50"
                            }`}
                          />
                          <div
                            className={`absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full ${
                              isActive
                                ? "bg-gradient-to-r from-blue-500 to-purple-600"
                                : "bg-slate-600/60"
                            }`}
                            style={{ width: `${isActive ? item.percentage : 0}%` }}
                          />
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={item.percentage}
                            onChange={(event) => handleDistributionChange(item.id, Number(event.target.value))}
                            disabled={sliderDisabled}
                            className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Agrega keywords para poder distribuir tus menciones.
                </p>
              )}
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
              onClick={() => saveKeywordChanges(keywordDistribution)}
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
