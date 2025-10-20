import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import KeywordTable from "@/components/KeywordTable"
import { Search, Plus } from "lucide-react"

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
}) {
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
              onClick={saveKeywordChanges}
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
