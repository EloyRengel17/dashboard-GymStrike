import { useEffect, useState } from 'react';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { actividadColumns, Actividad } from './components/actividad-columns';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/constants';


export default function RegistroActividadPage() {
  const [data, setData] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Petición al backend para traer todos los registros de actividad
  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const response = await fetch(`${API_URL}/actividad`);
        const result = await response.json();
        if (response.ok) {
          setData(result);
        }
      } catch (error) {
        console.error('Error al cargar actividades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActividades();
  }, []);

  const table = useReactTable({
    data,
    columns: actividadColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
  });

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Registro de Actividad</h2>
        <p className="text-muted-foreground">
          Historial completo de entradas y salidas del gimnasio en tiempo real.
        </p>
      </div>

      {/* CONTROLES DE BÚSQUEDA Y FILTROS */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        {/* Buscador por Cédula */}
        <Input
          placeholder="Filtrar por cédula..."
          value={(table.getColumn('cedula')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('cedula')?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-background"
        />

        {/* Selector de Tipo de Usuario (Cliente / Admin) */}
        <Select
          value={(table.getColumn('tipoUsuario')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('tipoUsuario')?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Tipo de usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLA DE DATOS */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={actividadColumns.length} className="h-24 text-center">
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}