import { useEffect, useState } from 'react';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { columns, Actividad } from './components/tasks-columns';
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
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/lib/constants';

export function Tasks() {
  const [data, setData] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10, // Muestra 10 registros por página por defecto
      },
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
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Registro de Actividad</h2>
            <p className="text-muted-foreground">
              Historial de entradas y salidas del gimnasio en tiempo real.
            </p>
          </div>
        </div>

        {/* CONTROLES DE FILTRO Y BÚSQUEDA */}
        <div className="my-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {/* Buscador por Cédula */}
            <Input
              placeholder="Filtrar por cédula..."
              value={(table.getColumn('cedula')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('cedula')?.setFilterValue(event.target.value)
              }
              className="max-w-sm bg-background"
            />

            {/* Filtro por Fecha de Entrada */}
            <Input
              type="date"
              value={(table.getColumn('horaEntrada')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('horaEntrada')?.setFilterValue(event.target.value)
              }
              className="w-auto bg-background"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Selector de Tipo de Usuario */}
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
        </div>

        {/* TABLA */}
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No se encontraron registros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Main>
    </>
  );
}