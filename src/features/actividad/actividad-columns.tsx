import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

export type Actividad = {
  id: number;
  cedula: string;
  horaEntrada: string;
  horaSalida: string | null;
  tipoUsuario: 'cliente' | 'admin';
};

export const actividadColumns: ColumnDef<Actividad>[] = [
  {
    accessorKey: 'cedula',
    header: 'Cédula',
    cell: ({ row }) => <span className="font-medium">{row.getValue('cedula')}</span>,
  },
  {
    accessorKey: 'horaEntrada',
    header: 'Hora de Entrada',
    cell: ({ row }) => {
      const fecha = row.getValue('horaEntrada') as string;
      return <span>{fecha ? new Date(fecha).toLocaleString() : 'N/A'}</span>;
    },
  },
  {
    accessorKey: 'horaSalida',
    header: 'Hora de Salida',
    cell: ({ row }) => {
      const fecha = row.getValue('horaSalida') as string | null;
      return (
        <span className={!fecha ? 'text-amber-500 font-semibold' : ''}>
          {fecha ? new Date(fecha).toLocaleString() : 'En el gimnasio (Sin salida)'}
        </span>
      );
    },
  },
  {
    accessorKey: 'tipoUsuario',
    header: 'Tipo de Usuario',
    cell: ({ row }) => {
      const tipo = row.getValue('tipoUsuario' as string);
      return (
        <Badge variant={tipo === 'admin' ? 'default' : 'secondary'} className="capitalize">
          {tipo}
        </Badge>
      );
    },
    // Filtro personalizado para que reconozca los valores del Select
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];