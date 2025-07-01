
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'

interface TimeEntry {
  id: string;
  description: string;
  duration_minutes: number;
  is_billable: boolean;
  created_at: string;
  case?: {
    id: string;
    title: string;
    contact?: {
      name: string;
    };
  };
}

interface TimeSheetProps {
  timeEntries: TimeEntry[];
}

export const TimeSheet = ({ timeEntries }: TimeSheetProps) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-16">Hora</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="w-32">Caso</TableHead>
            <TableHead className="w-20">Tiempo</TableHead>
            <TableHead className="w-24">Tipo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeEntries.map((entry) => (
            <TableRow key={entry.id} className="hover:bg-gray-50">
              <TableCell className="text-sm text-gray-500">
                {format(new Date(entry.created_at), 'HH:mm')}
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm truncate">
                    {entry.description || 'Sin descripción'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                {entry.case ? (
                  <div className="text-xs">
                    <p className="font-medium truncate">{entry.case.title}</p>
                    {entry.case.contact && (
                      <p className="text-gray-500 truncate">
                        {entry.case.contact.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">Sin caso</span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm font-medium">
                  {formatDuration(entry.duration_minutes)}
                </span>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={entry.is_billable ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {entry.is_billable ? 'Fact.' : 'No fact.'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
