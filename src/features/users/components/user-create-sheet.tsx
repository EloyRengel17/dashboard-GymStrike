import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Usuario } from '../index'

interface UserFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserSaved: () => void
  userToEdit?: Usuario | null
}

const initialForm = {
  cedula: '',
  telefono: '',
  nombre: '',
  apellido: '',
  genero: 1,
  tipoUsuario: 'cliente',
  suscripcion: 'matutino',
}

export function UserFormSheet({
  open,
  onOpenChange,
  onUserSaved,
  userToEdit,
}: UserFormSheetProps) {
  const [formData, setFormData] = useState(initialForm)
  const [loading, setLoading] = useState(false)

  const isEditing = Boolean(userToEdit)

  // Cargar datos si se pasa un usuario para editar
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        cedula: userToEdit.cedula || '',
        telefono: userToEdit.telefono || '',
        nombre: userToEdit.nombre || '',
        apellido: userToEdit.apellido || '',
        genero: userToEdit.genero,
        tipoUsuario: userToEdit.tipoUsuario || 'cliente',
        suscripcion: userToEdit.datosGym?.suscripcion || 'matutino',
      })
    } else {
      setFormData(initialForm)
    }
  }, [userToEdit, open])

  const calcularFechas = () => {
    const hoy = new Date()
    const proximoMes = new Date()
    proximoMes.setMonth(hoy.getMonth() + 1)
    const formatoFecha = (fecha: Date) => fecha.toISOString().split('T')[0]

    return {
      fechaEntrada: formatoFecha(hoy),
      fechaPago: formatoFecha(proximoMes),
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { fechaEntrada, fechaPago } = calcularFechas()

    const payload = {
      cedula: formData.cedula,
      telefono: formData.telefono,
      nombre: formData.nombre,
      apellido: formData.apellido,
      genero: Number(formData.genero),
      tipoUsuario: formData.tipoUsuario,
      datosGym: {
        ...(isEditing && userToEdit?.datosGym ? { id: userToEdit.datosGym.id } : {}),
        fechaEntrada: userToEdit?.datosGym?.fechaEntrada || fechaEntrada,
        fechaPago: userToEdit?.datosGym?.fechaPago || fechaPago,
        suscripcion: formData.suscripcion,
        activo: userToEdit?.datosGym?.activo ?? true,
      },
    }

    const url = isEditing
      ? `http://localhost:3000/usuarios/${userToEdit.id}`
      : 'http://localhost:3000/usuarios'

    const method = isEditing ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onUserSaved()
        onOpenChange(false)
      }
    } catch (err) {
      console.error('Error al guardar usuario:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar Usuario' : 'Crear Usuario'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Modifica los datos del usuario seleccionado.'
              : 'Ingresa los datos personales y de membresía del nuevo usuario.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="cedula">Cédula</Label>
            <Input id="cedula" name="cedula" value={formData.cedula} onChange={handleChange} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>

          <div className="space-y-1">
            <Label htmlFor="apellido">Apellido</Label>
            <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label>Género</Label>
            <RadioGroup
              value={String(formData.genero)}
              onValueChange={(val) => setFormData({ ...formData, genero: Number(val) })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="m" />
                <Label htmlFor="m" className="font-normal cursor-pointer">Masculino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id="f" />
                <Label htmlFor="f" className="font-normal cursor-pointer">Femenino</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-1">
            <Label>Tipo de Usuario</Label>
            <Select
              value={formData.tipoUsuario}
              onValueChange={(val) => setFormData({ ...formData, tipoUsuario: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4 my-2 font-semibold text-sm text-muted-foreground">
            Datos del Gimnasio
          </div>

          <div className="space-y-2">
            <Label>Suscripción</Label>
            <RadioGroup
              value={formData.suscripcion}
              onValueChange={(val) => setFormData({ ...formData, suscripcion: val })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="matutino" id="matutino" />
                <Label htmlFor="matutino" className="font-normal cursor-pointer">Matutino</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="font-normal cursor-pointer">Full</Label>
              </div>
            </RadioGroup>
          </div>

          <SheetFooter className="pt-6">
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </SheetClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar Usuario'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}