import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function OnboardingHome() {
  const [keywords, setKeywords] = useState([])
  const [newKeyword, setNewKeyword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const addKeyword = () => {
    const kw = newKeyword.trim()
    if (kw && !keywords.includes(kw)) {
      setKeywords([...keywords, kw])
      setNewKeyword('')
    }
  }

  const removeKeyword = (kw) => {
    setKeywords(keywords.filter((k) => k !== kw))
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
    const { error } = await supabase.from('dim_keywords').insert(rows)
    setSaving(false)
    if (!error) {
      setSaved(true)
    } else {
      console.error('Error saving keywords', error)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Bienvenido a Social Listening</h1>
      <p className="text-muted-foreground">
        Descubre qué se dice sobre tu marca en las redes sociales.
      </p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Carga tus keywords</li>
        <li>Revisa las menciones</li>
        <li>Recibe alertas</li>
      </ol>
      <div className="flex gap-2">
        <Input
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          placeholder="Nueva keyword"
        />
        <Button type="button" onClick={addKeyword}>
          Agregar
        </Button>
      </div>
      {keywords.length > 0 && (
        <ul className="list-disc list-inside space-y-1">
          {keywords.map((kw) => (
            <li key={kw} className="flex items-center justify-between">
              <span>{kw}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeKeyword(kw)}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
      {!saved ? (
        <Button
          type="button"
          onClick={saveKeywords}
          disabled={saving || keywords.length === 0}
        >
          Guardar y continuar
        </Button>
      ) : (
        <Button type="button" onClick={() => navigate('/app/mentions')}>
          Ir al inicio
        </Button>
      )}
    </div>
  )
}
