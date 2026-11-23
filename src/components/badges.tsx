// Badges de status reutilizados entre as novas telas (Gestão, Mapa, Financeiro).
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react'
import type { StatusFilial, StatusTitulo } from '@/data/gestaoData'
import { cn } from '@/lib/utils'

/* SLA do encerramento do chamado */
export function BadgeDegradeSLA({ dentroDoSLA }: { dentroDoSLA: boolean }) {
  return dentroDoSLA ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
      <CheckCircle2 className="w-3 h-3" /> No SLA
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
      <AlertTriangle className="w-3 h-3" /> Fora do SLA
    </span>
  )
}

/* Status da filial no mapa: ok / risco / critico */
export const CORES_STATUS_FILIAL: Record<
  StatusFilial,
  { fill: string; stroke: string; label: string }
> = {
  ok: { fill: '#16A34A', stroke: '#15803D', label: 'Tudo em ordem' },
  risco: { fill: '#D97706', stroke: '#B45309', label: 'Chamados em risco' },
  critico: { fill: '#DC2626', stroke: '#B91C1C', label: 'SLA vencido' },
}

export function BadgeStatusFilial({ status }: { status: StatusFilial }) {
  const cor = CORES_STATUS_FILIAL[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        status === 'ok' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        status === 'risco' && 'bg-amber-50 text-amber-700 border border-amber-200',
        status === 'critico' && 'bg-red-50 text-red-700 border border-red-200',
      )}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cor.fill }} />
      {cor.label}
    </span>
  )
}

/* Status de título financeiro: Pago / Pendente / Vencido */
export function BadgeStatusTitulo({ status }: { status: StatusTitulo }) {
  switch (status) {
    case 'Pago':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" /> Pago
        </span>
      )
    case 'Pendente':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <AlertCircle className="w-3.5 h-3.5" /> Pendente
        </span>
      )
    case 'Vencido':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5" /> Vencido
        </span>
      )
  }
}
