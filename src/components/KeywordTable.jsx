import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

export default function KeywordTable({ keywords, onToggle }) {
  const handleToggle = (id, current) => {
    if (onToggle) onToggle(id, !current)
  }

  return (
    <Table className="bg-secondary rounded-md text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Keyword</TableHead>
          <TableHead>Fecha de creación</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">&nbsp;</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keywords.map((k) => (
          <TableRow key={k.keyword_id}>
            <TableCell className="font-medium">{k.keyword}</TableCell>
            <TableCell>{format(new Date(k.created_at), "dd/MM/yyyy", { locale: es })}</TableCell>
            <TableCell>{k.active ? "Activo" : "Inactivo"}</TableCell>
            <TableCell className="text-right">
              <Switch
                checked={k.active}
                onCheckedChange={() => handleToggle(k.keyword_id, k.active)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
