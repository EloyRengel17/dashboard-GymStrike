import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableRowActions } from './data-table-row-actions'
import { Usuario } from '../index'

interface GetColumnsProps {
  onEdit: (user: Usuario) => void
  onDelete: (id: number) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<Usuario>[] => [
  {
    accessorKey: 'cedula',
    header: 'Cédula',
  },
  {
    accessorKey: 'nombre',
    header: 'Nombre',
  },
  {
    accessorKey: 'apellido',
    header: 'Apellido',
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono',
  },
  {
    accessorKey: 'tipoUsuario',
    header: 'Tipo',
  },
  {
    id: 'plan',
    accessorFn: (row) => row.datosGym?.suscripcion,
    header: 'Plan',
    cell: ({ row }) => {
      const plan = row.original.datosGym?.suscripcion
      return <span className="capitalize">{plan || 'N/A'}</span>
    },
  },
  {
    id: 'estado',
    accessorFn: (row) => row.datosGym?.activo,
    header: 'Estado',
    cell: ({ row }) => {
      const activo = row.original.datosGym?.activo

      return (
        <Badge variant={activo ? 'default' : 'destructive'} className="capitalize">
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
  },
  {
    id: 'fechaPago',
    accessorFn: (row) => row.datosGym?.fechaPago,
    header: 'Fecha de Pago',
    cell: ({ row }) => {
      const fecha = row.original.datosGym?.fechaPago
      return <span>{fecha || 'N/A'}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DataTableRowActions 
        row={row} 
        onEdit={() => onEdit(row.original)} 
        onDelete={() => onDelete(row.original.id)} 
      />
    ),
  },
]