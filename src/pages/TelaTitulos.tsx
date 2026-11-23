// Tela compartilhada por Títulos a Pagar e Títulos a Receber:
// cards de total no topo, filtro por status, tabela e fluxo de caixa por semana.
import { useMemo, useState } from 'react'
import { CheckCircle2, AlertCircle, AlertTriangle, BarChart3 } from 'lucide-react'
import { BadgeStatusTitulo } from '@/components/badges'
import { MiniBarChart } from '@/components/charts'
import type { StatusTitulo, FluxoCaixaSemana } from '@/data/gestaoData'
import { cn } from '@/lib/utils'

export type FiltroStatus = 'todos' | StatusTitulo

interface LinhaTitulo {
  id: string
  parte: string
  rotuloParte: string
  descricao: string
  valor: number
  vencimento: string
  status: StatusTitulo
  vinculo?: string
}

interface Props {
  titulo: string
  subtitulo: string
  icone: React.ReactNode
  iconeTotal: React.ReactNode
  titulos: LinhaTitulo[]
  fluxo: FluxoCaixaSemana[]
  formatoValor: (v: number) => string
}

const FILTROS: { valor: FiltroStatus; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'Pago', label: 'Pagos' },
  { valor: 'Pendente', label: 'Pendentes' },
  { valor: 'Vencido', label: 'Vencidos' },
]

export default function TelaTitulos({
  titulo,
  subtitulo,
  icone,
  iconeTotal,
  titulos,
  fluxo,
  formatoValor,
}: Props) {
  const [filtro, setFiltro] = useState<FiltroStatus>('todos')

  const totais = useMemo(
    () => ({
      doMes: titulos.reduce((acc, t) => acc + t.valor, 0),
      pago: titulos.filter((t) => t.status === 'Pago').reduce((a, t) => a + t.valor, 0),
      pendente: titulos.filter((t) => t.status === 'Pendente').reduce((a, t) => a + t.valor, 0),
      vencido: titulos.filter((t) => t.status === 'Vencido').reduce((a, t) => a + t.valor, 0),
    }),
    [titulos],
  )

  const filtrados = filtro === 'todos' ? titulos : titulos.filter((t) => t.status === filtro)

  const cards = [
    {
      titulo: 'Total do mês',
      valor: totais.doMes,
      icone: iconeTotal,
      cor: 'text-slate-900',
      bg: 'bg-slate-100',
    },
    {
      titulo: 'Pago',
      valor: totais.pago,
      icone: <CheckCircle2 className="w-5 h-5" />,
      cor: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      titulo: 'Pendente',
      valor: totais.pendente,
      icone: <AlertCircle className="w-5 h-5" />,
      cor: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      titulo: 'Vencido',
      valor: totais.vencido,
      icone: <AlertTriangle className="w-5 h-5" />,
      cor: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho + badge de demonstração */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            {icone}
            {titulo}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{subtitulo}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          Dados de demonstração
        </span>
      </div>

      {/* Cards de total no topo */}
      <section
        aria-label="Totais"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        {cards.map((c) => (
          <div
            key={c.titulo}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-medium text-slate-600">{c.titulo}</span>
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                  c.bg,
                  c.cor,
                )}
              >
                {c.icone}
              </div>
            </div>
            <div
              className={cn(
                'mt-3 text-2xl sm:text-3xl font-bold tracking-tight tabular-nums',
                c.cor,
              )}
            >
              {formatoValor(c.valor)}
            </div>
          </div>
        ))}
      </section>

      {/* Tabela de títulos com filtro por status (funcional, no cliente) */}
      <section
        aria-label="Lista de títulos"
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
          <h2 className="text-base font-semibold text-slate-900">
            {titulo} <span className="text-slate-400 font-normal">({filtrados.length})</span>
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {FILTROS.map((f) => (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltro(f.valor)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  filtro === f.valor
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4 sm:px-5">Fornecedor / Cliente</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4 text-right">Valor</th>
                <th className="py-3 px-4 hidden md:table-cell">Vencimento</th>
                <th className="py-3 px-4 sm:px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtrados.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-5">
                    <div className="font-semibold text-slate-900">{t.parte}</div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wide">
                      {t.rotuloParte}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-[280px]">
                    <div className="truncate" title={t.descricao}>
                      {t.descricao}
                    </div>
                    {t.vinculo && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
                        {t.vinculo}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatoValor(t.valor)}
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell text-slate-600 whitespace-nowrap">
                    {t.vencimento}
                  </td>
                  <td className="py-3.5 px-4 sm:px-5 text-right">
                    <BadgeStatusTitulo status={t.status} />
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                    Nenhum título com o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Fluxo de caixa do mês: entradas vs. saídas por semana */}
      <section
        aria-label="Fluxo de caixa do mês"
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6"
      >
        <div className="flex items-center gap-2.5 mb-1">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">Fluxo de caixa do mês</h2>
        </div>
        <p className="text-xs text-slate-500 mb-5">
          Entradas vs. saídas por semana · dados de demonstração
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {fluxo.map((semana) => {
            const maior = Math.max(semana.entradas, semana.saidas) || 1
            return (
              <div
                key={semana.semana}
                className="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{semana.semana}</span>
                  <span className="text-[11px] text-slate-400">{semana.periodo}</span>
                </div>
                <div className="mt-3 flex items-end justify-center gap-6 h-24">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 rounded-t-md bg-emerald-500"
                      style={{ height: `${(semana.entradas / maior) * 88}px` }}
                      title={`Entradas: ${formatoValor(semana.entradas)}`}
                    />
                    <span className="text-[10px] font-semibold text-emerald-700">Entradas</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 rounded-t-md bg-red-500"
                      style={{ height: `${(semana.saidas / maior) * 88}px` }}
                      title={`Saídas: ${formatoValor(semana.saidas)}`}
                    />
                    <span className="text-[10px] font-semibold text-red-700">Saídas</span>
                  </div>
                </div>
                <div className="mt-3 space-y-0.5 text-[11px] tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Entradas</span>
                    <span className="text-slate-700 font-medium">
                      {formatoValor(semana.entradas)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Saídas</span>
                    <span className="text-slate-700 font-medium">
                      {formatoValor(semana.saidas)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-semibold">Saldo</span>
                    <span
                      className={cn(
                        'font-bold',
                        semana.entradas - semana.saidas >= 0 ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      {formatoValor(semana.entradas - semana.saidas)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
