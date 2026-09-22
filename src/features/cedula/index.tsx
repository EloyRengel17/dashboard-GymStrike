import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

export default function CedulaLanding() {
  const [cedula, setCedula] = useState('');
  const [cargando, setCargando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'error' | 'exito'; texto: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cedulaLimpia = cedula.trim();

    if (!cedulaLimpia) {
      setFeedback({ tipo: 'error', texto: 'Por favor, ingrese una cédula válida.' });
      return;
    }

    setCargando(true);
    setFeedback(null);

    try {
      const respuesta = await axios.post('http://localhost:3000/actividad', {
        cedula: String(cedulaLimpia),
      });

      setFeedback({
        tipo: 'exito',
        texto: respuesta.data.usuario ? `Bienvenido, ${respuesta.data.usuario}` : 'Acceso concedido.',
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setFeedback({
          tipo: 'error',
          texto: error.response.data.message || 'Acceso no autorizado.',
        });
      } else {
        setFeedback({
          tipo: 'error',
          texto: 'Error al conectar con el servidor.',
        });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <ContenedorPrincipal>
      <TarjetaFormulario onSubmit={handleSubmit}>
        <Titulo>Bienvenido</Titulo>
        <CampoWrapper>
          <InputCedula
            type="text"
            placeholder="Ingrese su cédula"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            disabled={cargando}
            autoFocus
          />
          <BotonEnviar type="submit" disabled={cargando}>
            {cargando ? '...' : '→'}
          </BotonEnviar>
        </CampoWrapper>
        {feedback && <Mensaje $tipo={feedback.tipo}>{feedback.texto}</Mensaje>}
      </TarjetaFormulario>
    </ContenedorPrincipal>
  );
}

// Estilos encapsulados

const ContenedorPrincipal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #fafafa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const TarjetaFormulario = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 320px;
  padding: 2rem;
`;

const Titulo = styled.h1`
  font-size: 1.25rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 1.5rem;
  letter-spacing: -0.025em;
`;

const CampoWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const InputCedula = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 44px 0 16px;
  font-size: 0.95rem;
  color: #1f2937;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #d1d5db;
  }

  &:focus {
    border-color: #111827;
    box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.05);
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;

const BotonEnviar = styled.button`
  position: absolute;
  right: 6px;
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #111827;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: #f3f4f6;
  }

  &:disabled {
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const Mensaje = styled.p<{ $tipo: 'error' | 'exito' }>`
  margin-top: 1rem;
  font-size: 0.85rem;
  text-align: center;
  color: ${(props) => (props.$tipo === 'error' ? '#ef4444' : '#10b981')};
`;