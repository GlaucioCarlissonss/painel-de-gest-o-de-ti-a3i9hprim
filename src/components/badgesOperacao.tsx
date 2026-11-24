// Badges compartilhados dos módulos da Onda 2 (Chamados e Locações).
import { CheckCircle2, AlertCircle, AlertTriangle, Clock } from 'lucide-react'
import type { PrioridadeChamado, StatusSLA, StatusChamado, StatusLocacao } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function BadgePrioridade({ prioridade }: { prioridade: PrioridadeChamado }) {
  const cfg = {
    Alta: 'bg-red-50 text-red-700 border-red-200',
    Média: 'bg-amber-50 text-amber-700 border-amber-200',
    Baixa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }[prioridade]
  const ponto = { Alta: 'bg-red-600', Média: 'bg-amber-500', Baixa: 'bg-emerald-600' }[prioridade]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border shrink-0',
        cfg,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', ponto)} />
      {prioridade}
    </span>
  )
}

export function BadgeStatusChamado({ status }: { status: StatusChamado }) {
  const cfg: Record<StatusChamado, string> = {
    Aberto: 'bg-blue-50 text-blue-700 border-blue-200',
    'Em Atendimento': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Escalonado: 'bg-amber-50 text-amber-700 border-amber-200',
    Resolvido: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Fechado: 'bg-slate-100 text-slate-600 border-slate-200',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border',
        cfg[status],
      )}
    >
      {status}
    </span>
  )
}

export function BadgeSla({
  status,
  texto,
  className,
}: {
  status: StatusSLA
  texto: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border',
        status === 'dentro' && 'text-emerald-600 bg-emerald-50 border-emerald-100',
        status === 'proximo' && 'text-orange-600 bg-orange-50 border-orange-200',
        status === 'vencido' && 'text-red-600 bg-red-50 border-red-200',
        className,
      )}
    >
      {status === 'dentro' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {status === 'proximo' && <AlertCircle className="w-3.5 h-3.5" />}
      {status === 'vencido' && <AlertTriangle className="w-3.5 h-3.5" />}
      <span>{texto}</span>
    </span>
  )
}

export function BadgeStatusLocacao({ status }: { status: StatusLocacao }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        status === 'Ativo' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
        status === 'Vencendo em 7 dias' && 'bg-amber-50 text-amber-700 border-amber-200',
        status === 'Encerrado' && 'bg-slate-100 text-slate-600 border-slate-200',
      )}
    >
      {status === 'Ativo' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {status === 'Vencendo em 7 dias' && <AlertTriangle className="w-3.5 h-3.5" />}
      {status === 'Encerrado' && <Clock className="w-3.5 h-3.5" />}
      {status}
    </span>
  )
}

export function AvatarTecnico({
  nome,
  iniciais,
  atribuido,
  size = 'md',
}: {
  nome: string
  iniciais: string
  atribuido: boolean
  size?: 'sm' | 'md'
}) {
  const tam = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
  if (!atribuido) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 text-[11px] font-medium bg-slate-200 text-slate-700 rounded px-1.5 py-0.5',
          tam,
        )}
        title="Sem técnico designado"
      >
        {iniciais}
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-700 border border-blue-200 font-bold shrink-0',
        tam,
      )}
      title={nome}
    >
      {iniciais}
    </span>
  )
}

export const iniciaisDe = (nome: string) =>
  nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
