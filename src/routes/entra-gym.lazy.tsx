import { createLazyFileRoute } from '@tanstack/react-router'
import CedulaLanding from '@/features/cedula'

export const Route = createLazyFileRoute('/entra-gym')({
  component: CedulaLanding,
})