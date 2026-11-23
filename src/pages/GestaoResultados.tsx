// Visão de Resultado — indicadores de gestão no estilo do módulo "Gestão"
// do repositório de referência STI.IARX. Todos os dados vêm de src/data
// (demonstração; nenhum dado persiste).
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Timer } from 'lucide-react'
import {
  MOCK_INDICADORES,
  MOCK_CHAMADOS_POR_TIPO,
  MOCK_LOCACOES_POR_EQUIPAMENTO,
  MOCK_ENCERRAMENTOS,
  ContagemPorTipo,
} from '@/data/gestaoData'
import { Sparkline } from '@/components/charts'
import { BadgeDegradeSLA } from '@/components/badges'
import { cn } from '@/lib/utils'

function BlocoBarras({ titulo, dados }: { titulo: string; dados: ContagemPorTipo[] }) {
  const max = Math.max(...dados.map((d) => d.quantidade))
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">{titulo}</h2>
      <p className="text-xs text-slate-500 mb-4">Últimos 30 dias · dados de demonstração</p>
      <div className="space-y-3">
        {dados.map((item) => (
          <div key={item.tipo} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-sm text-slate-700">{item.tipo}</span>
            <div className="flex-1 h-6 rounded-md bg-slate-100 overflow-hidden">
              <div
                className={cn('h-full rounded-md transition-all', item.cor)}
                style={{ width: `${(item.quantidade / max) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right text-sm font-bold text-slate-900 tabular-nums">
              {item.quantidade}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GestaoResultados() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Cabeçalho + badge de demonstração */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Visão de Resultado
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Indicadores de gestão de locações e atendimento · comparação com o mês anterior
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          Dados de demonstração
        </span>
      </div>

      {/* Indicadores: número grande + comparativo + sparkline */}
      <section aria-label="Indicadores de gestão">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {MOCK_INDICADORES.map((ind) => {
            const melhora = ind.percentualMesAnterior > 0
            const melhorGeral =
              ind.formato === 'tempo'
                ? ind.percentualMesAnterior < 0
                : ind.percentualMesAnterior > 0
            return (
              <div
                key={ind.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-slate-600 leading-snug">{ind.titulo}</h3>
                  <Timer className="w-4 h-4 text-slate-300 shrink-0" aria-hidden="true" />
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                  {ind.valor}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{ind.valorSecundario}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs font-semibold',
                        melhorGeral ? 'text-emerald-600' : 'text-red-600',
                      )}
                    >
                      {melhora ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {ind.percentualMesAnterior > 0 ? '+' : ''}
                      {ind.percentualMesAnterior.toLocaleString('pt-BR', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                      %
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {ind.descricaoComparativo}
                    </div>
                  </div>
                  <Sparkline data={ind.tendencia} width={90} height={30} className="shrink-0" />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Chamados por tipo + Locações por equipamento (barras horizontais) */}
      <section aria-label="Distribuição por tipo" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlocoBarras titulo="Chamados por tipo" dados={MOCK_CHAMADOS_POR_TIPO} />
        <BlocoBarras titulo="Locações por equipamento" dados={MOCK_LOCACOES_POR_EQUIPAMENTO} />
      </section>

      {/* Últimos encerramentos */}
      <section
        aria-label="Últimos encerramentos"
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-base font-semibold text-slate-900">Últimos encerramentos</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {MOCK_ENCERRAMENTOS.length}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4 sm:px-5">Chamado</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4 hidden sm:table-cell">Tipo</th>
                <th className="py-3 px-4 hidden md:table-cell">Técnico</th>
                <th className="py-3 px-4 sm:px-5 text-right">Encerrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {MOCK_ENCERRAMENTOS.map((enc) => (
                <tr key={enc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-5">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {enc.numero}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{enc.cliente}</td>
                  <td className="py-3.5 px-4 text-slate-600 hidden sm:table-cell">{enc.tipo}</td>
                  <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">{enc.tecnico}</td>
                  <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                    <div className="text-xs text-slate-500">{enc.encerradoHa}</div>
                    <BadgeDegradeSLA dentroDoSLA={enc.dentroDoSLA} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
