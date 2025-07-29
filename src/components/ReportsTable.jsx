import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ReportsTable({ reports = [], onDownload }) {
  return (
    <Table className="bg-secondary rounded-md text-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Plataformas</TableHead>
          <TableHead>Rango de fechas</TableHead>
          <TableHead>Comentarios</TableHead>
          <TableHead className="text-right">Descargar</TableHead>
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
            <TableCell>
              {r.datePreset
                ? `Últimos ${r.datePreset} días`
                : `${r.startDate || '-'} a ${r.endDate || '-'}`}
            </TableCell>
              <TableCell>
                {(() => {
                  const platforms = [
                    r.includeYoutubeComments && 'YouTube',
                    r.includeRedditComments && 'Reddit',
                  ].filter(Boolean);
                  return platforms.length
                    ? `Si (${platforms.join(', ')})`
                    : 'No';
                })()}
              </TableCell>
            <TableCell className="text-right">
              <Button size="sm" onClick={() => onDownload && onDownload(r)}>
                Descargar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
