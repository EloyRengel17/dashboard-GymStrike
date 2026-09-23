import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Search } from 'lucide-react';
import { API_URL } from '@/lib/constants';

export function RegisterPaymentModal() {
  const [open, setOpen] = useState(false);
  const [loadingClient, setLoadingClient] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Campos del formulario
  const [cedula, setCedula] = useState('');
  const [clientData, setClientData] = useState<{ 
    id: number; 
    nombre: string; 
    planNombre: string; 
    fechaPagoAnterior: string;
    planId: number;
  } | null>(null);
  
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState('');
  const [montoPagado, setMontoPagado] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);

  // Atajo de teclado: Ctrl + Q para abrir el modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Búsqueda del cliente por cédula adaptada a tu backend
  const handleSearchClient = async () => {
    if (!cedula.trim()) return;
    setLoadingClient(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/${cedula.trim()}`);
      if (!res.ok) throw new Error('Usuario no encontrado');
      const data = await res.json();
      
      setClientData({
        id: data.id,
        nombre: `${data.nombre} ${data.apellido || ''}`,
        planNombre: data.datosGym?.suscripcion ? `Suscripción: ${data.datosGym.suscripcion}` : 'Plan general',
        fechaPagoAnterior: data.datosGym?.fechaPago || 'No registrada',
        // Asegúrate de mapear el ID del plan correctamente según venga en tu respuesta (aquí ponemos un respaldo numérico 2 por defecto si viniera vacío)
        planId: data.datosGym?.planId || 2, 
      });
    } catch (error) {
      alert('No se encontró ningún usuario con esa cédula.');
      setClientData(null);
    } finally {
      setLoadingClient(false);
    }
  };

  // Enviar el registro de pago al backend
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientData) return;

    setSubmitting(true);
    try {
      // Estructura exacta requerida por tu DTO de NestJS
      const payload = {
        stripePaymentIntentId: stripePaymentIntentId || 'REF-MANUAL',
        montoPagado: Number(montoPagado),
        fechaPago: new Date(fechaPago).toISOString(),
        usuario: clientData.id,
        plan: clientData.planId, // <-- Ahora sí envía el número del plan correctamente
      };

      const res = await fetch(`${API_URL}/stripe/pagohistorial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        console.error('Detalle del error del backend:', errorBody);
        throw new Error('Error al registrar el pago en el servidor');
      }

      alert('¡Pago registrado con éxito!');
      setOpen(false);
      // Limpiar campos
      setCedula('');
      setClientData(null);
      setStripePaymentIntentId('');
      setMontoPagado('');
    } catch (error: any) {
      alert(`Ocurrió un error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='gap-1.5'>
          <PlusCircle className='h-4 w-4' />
          Registrar Pago <span className='ml-1 text-[10px] bg-primary-foreground/20 px-1 rounded'>Ctrl+Q</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Registrar Pago Manual</DialogTitle>
          <DialogDescription>
            Presiona <span className='font-semibold'>Ctrl + Q</span> para abrir o cerrar. Ingresa la cédula del socio para continuar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmitPayment} className='space-y-4 py-2'>
          {/* 1. Búsqueda por Cédula */}
          <div className='space-y-2'>
            <Label htmlFor='cedula'>Cédula del Cliente</Label>
            <div className='flex gap-2'>
              <Input
                id='cedula'
                placeholder='Ej. 27080179'
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchClient();
                  }
                }}
              />
              <Button type='button' variant='secondary' onClick={handleSearchClient} disabled={loadingClient}>
                {loadingClient ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
              </Button>
            </div>
          </div>

          {/* Datos del cliente encontrados */}
          {clientData && (
            <div className='p-3 bg-muted rounded-lg text-xs space-y-1 border'>
              <p className='font-semibold text-sm text-primary'>{clientData.nombre}</p>
              <p className='text-muted-foreground'>{clientData.planNombre}</p>
              <p className='text-muted-foreground font-medium'>
                Próxima fecha de pago: <span className='text-foreground font-semibold'>{clientData.fechaPagoAnterior}</span>
              </p>
            </div>
          )}

          {/* 2. Código de Referencia */}
          <div className='space-y-2'>
            <Label htmlFor='referencia'>Referencia / Código de Pago</Label>
            <Input
              id='referencia'
              placeholder='Ej. Ref-123456'
              value={stripePaymentIntentId}
              onChange={(e) => setStripePaymentIntentId(e.target.value)}
              required
            />
          </div>

          {/* 3. Monto Pagado */}
          <div className='space-y-2'>
            <Label htmlFor='monto'>Monto Pagado</Label>
            <Input
              id='monto'
              type='number'
              step='0.01'
              placeholder='0.00'
              value={montoPagado}
              onChange={(e) => setMontoPagado(e.target.value)}
              required
            />
          </div>

          {/* Fecha Real del Pago */}
          <div className='space-y-2'>
            <Label htmlFor='fecha'>Fecha del Pago Realizado</Label>
            <Input
              id='fecha'
              type='date'
              value={fechaPago}
              onChange={(e) => setFechaPago(e.target.value)}
              required
            />
          </div>

          <DialogFooter className='pt-4'>
            {/* El botón permanece bloqueado (!clientData) hasta que se busque y encuentre al usuario */}
            <Button type='submit' disabled={submitting || !clientData}>
              {submitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Guardar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}