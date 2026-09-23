import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle2, Loader2, MessageSquare } from 'lucide-react';

import { API_URL } from '@/lib/constants';

export function RecentSales() {
  const [qrData, setQrData] = useState<{ qr: string; isConnected: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQrStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/whatsapp/qr`);
        const data = await res.json();
        setQrData(data);
      } catch (error) {
        console.error('Error al obtener estado de WhatsApp:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQrStatus();
    // Consultar cada 3 segundos para detectar si ya se conectó en tiempo real
    const interval = setInterval(fetchQrStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex flex-col items-center justify-center min-h-[285px] text-center'>
      {loading ? (
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      ) : qrData?.isConnected ? (
        /* SI YA ESTÁ CONECTADO */
        <div className='flex flex-col items-center justify-center space-y-3 py-6'>
          <CheckCircle2 className='h-12 w-12 text-emerald-500 animate-bounce' />
          <h4 className='font-semibold text-lg text-emerald-600'>¡WhatsApp Conectado!</h4>
          <p className='text-sm text-muted-foreground max-w-xs'>
            El servicio de mensajería está vinculado correctamente y listo para operar.
          </p>
        </div>
      ) : qrData?.qr ? (
        /* SI NO ESTÁ CONECTADO Y HAY QR DISPONIBLE */
        <div className='flex flex-col items-center space-y-3'>
          <p className='text-xs text-muted-foreground'>
            Escanea este código QR con el WhatsApp de gymStrike:
          </p>
          <div className='p-3 bg-white rounded-xl shadow-md border'>
            <QRCodeSVG value={qrData.qr} size={170} />
          </div>
          <p className='text-xs text-muted-foreground '>
           ¡Es necesario estar conectado al whatsapp para enviar informacion a los clientes!
          </p>
        </div>
      ) : (
        /* ESTADO DE ESPERA INICIAL */
        <div className='flex flex-col items-center space-y-2'>
          <Loader2 className='h-6 w-6 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>Esperando código QR del servidor...</p>
        </div>
      )}
    </div>
  );
}