// Acompanhamento dos chamados do cliente no portal (Fase 8):
// lista com status em tempo real (via AppDataContext), histórico de
// interações/resoluções anteriores e acordeão com a timeline de cada chamado.
import { useState } from 'react'
import { History, MessageSquare, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BadgePrioridade, BadgeSla, BadgeStatusChamado } from '@/components/badgesOperacao'
import { textoRestanteSLA, slaStatusDe, tempoEspera } from '@/lib/regras'
import type { Chamado } from '@/data/mockData'

const fmtData = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function ListaChamadosPortal({
  cliente,
  chamados,
}: {
  cliente: string
  chamados: Chamado[]
}) {
  const [aba, setAba] = useState<'ativos' | 'historico'>('ativos')

  const ativos = chamados.filter((c) => c.status !== 'Fechado' && c.status !== 'Resolvido')
  const historico = chamados.filter((c) => c.status === 'Resolvido' || c.status === 'Fechado')
  const lista = aba === 'ativos' ? ativos : historico

  return (
    <section aria-label="Meus chamados">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          {aba === 'ativos' ? 'Meus chamados ativos' : 'Histórico de interações e resoluções'}
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {lista.length}
          </span>
        </h2>
        <div
          className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5"
          role="tablist"
          aria-label="Alternar entre chamados ativos e histórico"
        >
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'ativos'}
            onClick={() => setAba('ativos')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              aba === 'ativos'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Ativos ({ativos.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'historico'}
            onClick={() => setAba('historico')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              aba === 'historico'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5 inline mr-1" aria-hidden />
            Histórico ({historico.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        {lista.length === 0 && (
          <p className="p-8 text-center text-sm text-slate-400">
            {aba === 'ativos'
              ? `Nenhum chamado ativo para ${cliente} no momento.`
              : 'Nenhuma resolução anterior registrada.'}
          </p>
        )}

        {lista.map((c) => (
          <Accordion key={c.id} type="single" collapsible>
            <AccordionItem value={c.id} className="border-none">
              <AccordionTrigger className="px-4 py-3.5 hover:no-underline hover:bg-slate-50/70">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full text-left">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0 self-start">
                    {c.numero}
                  </span>
                  <span className="font-semibold text-sm text-slate-900 flex-1 min-w-0 truncate">
                    {c.descricao}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <BadgeStatusChamado status={c.status} />
                    <BadgePrioridade prioridade={c.prioridade} />
                    {c.status !== 'Resolvido' && c.status !== 'Fechado' && (
                      <BadgeSla status={slaStatusDe(c)} texto={textoRestanteSLA(c)} />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 mb-3">
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase text-[10px]">
                      Equipamento
                    </span>
                    {c.equipamento ?? '—'}
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase text-[10px]">
                      Tipo
                    </span>
                    {c.tipo}
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase text-[10px]">
                      Técnico responsável
                    </span>
                    {c.tecnico ?? 'Aguardando designação'}
                  </div>
                </div>

                {/* Timeline de interações */}
                <div aria-label="Linha do tempo do chamado">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Interações
                  </p>
                  <ol className="space-y-2.5 border-l-2 border-slate-100 pl-4 ml-1">
                    {c.timeline.map((t) => (
                      <li key={t.id} className="relative">
                        <span
                          className="absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white"
                          aria-hidden
                        />
                        <p className="text-sm text-slate-800">{t.descricao}</p>
                        <p className="text-[11px] text-slate-400">
                          {t.autor} · {fmtData(t.dataHora)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="text-[11px] text-slate-400 mt-3">
                  Aberto {tempoEspera(c.aberturaISO)} · último evento:{' '}
                  {fmtData(c.timeline[c.timeline.length - 1]?.dataHora ?? c.aberturaISO)}
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </section>
  )
}
