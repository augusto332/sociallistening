import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
export default function ReportsTable({ reports = [], onDownload, onDelete }) {
  return (
    <Table className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-md text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Plataformas</TableHead>
          <TableHead>Palabras clave</TableHead>
          <TableHead>Rango de fechas</TableHead>
          <TableHead>Comentarios</TableHead>
          <TableHead className="text-right"></TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((r, idx) => (
          <TableRow key={idx}>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell>
              {r.platforms
                .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                .join(', ') || '-'}
            </TableCell>
            <TableCell>{r.keywords?.join(', ') || '-'}</TableCell>
            <TableCell>
              {r.datePreset
                ? `Últimos ${r.datePreset} días`
                : `${r.startDate || '-'} a ${r.endDate || '-'}`}
            </TableCell>
            <TableCell>
              {(() => {
                const commentPlatforms = [
                  r.includeYoutubeComments && 'YouTube',
                  r.includeRedditComments && 'Reddit',
                ].filter(Boolean);
                if (r.platforms.includes('twitter') && commentPlatforms.length === 0) {
                  return 'N/A';
                }
                return commentPlatforms.length
                  ? `Si (${commentPlatforms.join(', ')})`
                  : 'No';
              })()}
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" onClick={() => onDownload && onDownload(r)}>
                Descargar
              </Button>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete && onDelete(idx)}
              >
                <X className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
