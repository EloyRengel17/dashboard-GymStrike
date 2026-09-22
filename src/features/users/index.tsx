import { useEffect, useState } from 'react'
import { getColumns } from './components/users-columns'
import { UsersTable } from './components/users-table'
import { UserFormSheet } from './components/user-create-sheet'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export interface Usuario {
  id: number
  cedula: string
  telefono: string
  nombre: string
  apellido: string
  genero: number
  tipoUsuario: string
  datosGym: {
    id: number
    fechaEntrada: string
    fechaPago: string
    suscripcion: string
    activo: boolean
  }
}

export function Users() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  const [openSheet, setOpenSheet] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)

  const obtenerUsuarios = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/usuarios')
      if (!response.ok) throw new Error('Error al conectar con el servidor')
      const data = await response.json()
      setUsuarios(data.usuario || [])
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setOpenSheet(true)
  }

  const handleEdit = (user: Usuario) => {
    setSelectedUser(user)
    setOpenSheet(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return

    try {
      const res = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        obtenerUsuarios()
      }
    } catch (err) {
      console.error('Error al eliminar usuario:', err)
    }
  }

  useEffect(() => {
    obtenerUsuarios()
  }, [])

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lista de Usuarios</h2>
          <p className="text-muted-foreground">
            Usuarios registrados en el gimnasio.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Crear +
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center">Cargando usuarios desde la API...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">Error: {error}</div>
      ) : (
        <UsersTable data={usuarios} columns={columns} />
      )}

      <UserFormSheet
        open={openSheet}
        onOpenChange={setOpenSheet}
        onUserSaved={obtenerUsuarios}
        userToEdit={selectedUser}
      />
    </div>
  )
}

export default Users