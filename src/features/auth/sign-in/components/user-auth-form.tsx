import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

// 1. Ajustamos el esquema de Zod para cédula y clave
const formSchema = z.object({
  cedula: z.string().min(1, 'Por favor ingrese su cédula.'),
  clave: z.string().min(1, 'Por favor ingrese su clave.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cedula: '',
      clave: '',
    },
  })

  // 2. Petición real a la API NestJS
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:3000/login-pc/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cedula: data.cedula,
          clave: data.clave,
        }),
      })

      const resData = await response.json()

      if (!response.ok) {
        throw new Error(resData.message || 'Error al iniciar sesión')
      }

      // 3. Guardar token y usuario en el Store de la plantilla (Zustand)
      auth.setUser(resData.usuario)
      auth.setAccessToken(resData.access_token)

      // 4. Guardar también en localStorage por respaldo
      localStorage.setItem('access_token', resData.access_token)

      toast.success(`¡Bienvenido de nuevo, ${resData.usuario.nombre || data.cedula}!`)

      // 5. Redirigir al dashboard
      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })

    } catch (error: any) {
      toast.error(error.message || 'Error de conexión con el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        {/* Campo Cédula */}
        <FormField
          control={form.control}
          name='cedula'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cédula</FormLabel>
              <FormControl>
                <Input placeholder='12345678' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo Clave */}
        <FormField
          control={form.control}
          name='clave'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Clave</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                ¿Olvidó su clave?
              </Link>
            </FormItem>
          )}
        />

        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Iniciar Sesión
        </Button>
      </form>
    </Form>
  )
}