// Kanban da Central de Chamados: colunas Aberto → Fechado com botões de
// avanço/retorno de status (escolha robusta em vez de drag & drop).
import { ArrowRight, ArrowLeft, Clock, Wrench } from 'lucide-react'
import { Chamado, COLUNAS_KANBAN, StatusChamado } from '@/data/mockData'
import { ROTULO_SLA, slaStatusDe, tempoEspera, textoRestanteSLA } from '@/lib/regras'
import { BadgePrioridade, BadgeSla } from '@/components/badgesOperacao'
import { cn } from '@/lib/utils'

interface Props {
  chamados: Chamado[]
  onMover: (id: string, novoStatus: StatusChamado) => void
  onAbrirDetalhe: (id: string) => void
}

const COR_COLUNA: Record<StatusChamado, string> = {
  Aberto: 'bg-blue-600',
  'Em Atendimento': 'bg-indigo-600',
  Escalonado: 'bg-amber-500',
  Resolvido: 'bg-emerald-600',
  Fechado: 'bg-slate-400',
}

export default function KanbanChamados({ chamados, onMover, onAbrirDetalhe }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {COLUNAS_KANBAN.map((status) => {
        const daColuna = chamados.filter((c) => c.status === status)
        const idx = COLUNAS_KANBAN.indexOf(status)
        return (
          <section
            key={status}
            aria-label={`Coluna ${status}`}
            className="bg-slate-50/80 border border-slate-200 rounded-xl flex flex-col min-h-[220px]"
          >
            <div className="flex items-center gap-2 px-3.5 py-3 border-b border-slate-200">
              <span className={cn('w-2.5 h-2.5 rounded-full', COR_COLUNA[status])} />
              <h3 className="text-sm font-bold text-slate-800">{status}</h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-white border border-slate-200 text-slate-600">
                {daColuna.length}
              </span>
            </div>

            <div className="p-2.5 space-y-2.5 flex-1">
              {daColuna.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-6">Sem chamados</p>
              )}
              {daColuna.map((c) => {
                const sla = slaStatusDe(c)
                return (
                  <article
                    key={c.id}
                    className="bg-white rounded-lg border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-3 space-y-2"
                  >
                    <button
                      type="button"
                      onClick={() => onAbrirDetalhe(c.id)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {c.numero}
                        </span>
                        <BadgePrioridade prioridade={c.prioridade} />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mt-1.5 truncate group-hover:text-blue-700 transition-colors">
                        {c.cliente}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {c.descricao || c.tipo}
                      </p>
                    </button>

                    <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                        {c.tipo}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {tempoEspera(c.aberturaISO)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 truncate inline-flex items-center gap-1">
                        <Wrench className="w-3 h-3 shrink-0" />
                        {c.tecnico ?? 'Sem técnico'}
                      </span>
                      <BadgeSla status={sla} texto={textoRestanteSLA(c)} />
                    </div>

                    {/* Ações de fluxo */}
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => onMover(c.id, COLUNAS_KANBAN[idx - 1])}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label={`Retornar ${c.numero} para ${idx > 0 ? COLUNAS_KANBAN[idx - 1] : ''}`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === COLUNAS_KANBAN.length - 1}
                        onClick={() => onMover(c.id, COLUNAS_KANBAN[idx + 1])}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label={`Avançar ${c.numero} para ${idx < COLUNAS_KANBAN.length - 1 ? COLUNAS_KANBAN[idx + 1] : ''}`}
                      >
                        Avançar
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// Rótulo exportado para o painel de detalhe mostrar o SLA da mesma forma
export { ROTULO_SLA }
