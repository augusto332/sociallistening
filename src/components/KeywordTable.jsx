import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Power } from "lucide-react"

export default function KeywordTable({ keywords, onToggle }) {
  const handleToggle = (id, current) => {
    if (onToggle) onToggle(id, !current)
  }

  return (
    <Table className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-md text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead>Fecha de creación</TableHead>
          <TableHead>Última extracción de datos</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">
            <Power className="w-4 h-4 inline" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((k) => {
          const dates = [
            k.last_processed_at_yt,
            k.last_processed_at_rd,
            k.last_processed_at_tw,
          ]
            .filter(Boolean)
            .map((d) => new Date(d))
          const lastDate =
            dates.length > 0 ? new Date(Math.max(...dates)) : null
          return (
            <TableRow key={k.keyword_id}>
              <TableCell className="font-medium">{k.keyword}</TableCell>
              <TableCell>
                {format(new Date(k.created_at), "dd/MM/yyyy", { locale: es })}
              </TableCell>
              <TableCell>
                {lastDate
                  ? format(lastDate, "dd/MM/yyyy HH:mm", { locale: es })
                  : "-"}
              </TableCell>
              <TableCell>{k.active ? "Activo" : "Inactivo"}</TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={k.active}
                  onCheckedChange={() => handleToggle(k.keyword_id, k.active)}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
