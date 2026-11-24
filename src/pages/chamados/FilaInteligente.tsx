// Fila inteligente (Fase 7): ordenação por prioridade > tempo de espera >
// SLA mais curto, carga de trabalho por atendente e "Minha Fila" por técnico.
import { useState } from 'react'
import { ListOrdered, Gauge, UserRound } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Chamado, TECNICOS } from '@/data/mockData'
import {
  cargaPorTecnico,
  ordenarFila,
  slaStatusDe,
  textoRestanteSLA,
  tempoEspera,
} from '@/lib/regras'
import { BadgePrioridade, BadgeSla, AvatarTecnico, iniciaisDe } from '@/components/badgesOperacao'
import { cn } from '@/lib/utils'

const nivelDe = (nome: string | undefined) => TECNICOS.find((t) => t.nome === nome)?.nivel ?? '—'

interface Props {
  chamados: Chamado[]
  onAbrirDetalhe: (id: string) => void
  onAtribuir: (id: string, tecnico: string) => void
}

export default function FilaInteligente({ chamados, onAbrirDetalhe, onAtribuir }: Props) {
  const [tecnico, setTecnico] = useState(TECNICOS[0].nome)
  const fila = ordenarFila(chamados)
  const cargas = cargaPorTecnico(TECNICOS, chamados)
  const minhaFila = fila.filter((f) => f.chamado.tecnico === tecnico)
  const naoAtribuidos = fila.filter((f) => !f.chamado.tecnico)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Fila automática ordenada */}
      <section className="xl:col-span-2 rounded-xl border border-slate-200 bg-white overflow-hidden">
        <header className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/70">
          <ListOrdered className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Fila de Atendimento (automática)</h3>
          <span className="ml-auto text-xs font-semibold text-slate-500">
            prioridade → espera → SLA
          </span>
        </header>
        <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
          {fila.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-10">Nenhum chamado na fila</p>
          )}
          {fila.map(({ chamado: c }, i) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 hover:bg-blue-50/40 transition-colors"
            >
              <span className="w-6 text-center text-xs font-bold text-slate-400">{i + 1}º</span>
              <button
                type="button"
                onClick={() => onAbrirDetalhe(c.id)}
                className="font-mono text-xs font-bold text-blue-700 hover:underline"
              >
                {c.numero}
              </button>
              <div className="min-w-[180px] flex-1">
                <p className="text-sm font-semibold text-slate-800">{c.cliente}</p>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {c.tipo} · {c.descricao}
                </p>
              </div>
              <BadgePrioridade prioridade={c.prioridade} />
              <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                <UserRound className="w-3.5 h-3.5" />
                {c.tecnico ? `${c.tecnico} (${nivelDe(c.tecnico)})` : 'sem técnico'}
              </span>
              {!c.tecnico && (
                <Select onValueChange={(v) => onAtribuir(c.id, v)}>
                  <SelectTrigger className="h-7 w-[150px] text-xs">
                    <SelectValue placeholder="Designar…" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECNICOS.map((t) => (
                      <SelectItem key={t.id} value={t.nome}>
                        {t.nome} · {t.nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <BadgeSla
                status={slaStatusDe(c)}
                texto={`${tempoEspera(c.aberturaISO)} · ${textoRestanteSLA(c)}`}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Coluna lateral: carga de trabalho + Minha Fila */}
      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <header className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/70">
            <Gauge className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Carga por atendente</h3>
          </header>
          <ul className="divide-y divide-slate-100">
            {cargas.map(({ tecnico: t, ativos, tempoMedio }) => (
              <li key={t.id} className="flex items-center gap-2.5 px-4 py-2.5">
                <AvatarTecnico nome={t.nome} iniciais={t.iniciais} atribuido />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {t.nome}{' '}
                    <span className="text-[11px] font-normal text-slate-500">({t.nivel})</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {ativos} ativo{ativos === 1 ? '' : 's'} · tempo médio {tempoMedio}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0" aria-label={`${ativos} chamados ativos`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        'w-1.5 h-4 rounded-sm',
                        i < ativos
                          ? ativos >= 4
                            ? 'bg-red-500'
                            : ativos >= 3
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          : 'bg-slate-100',
                      )}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Minha Fila (técnico selecionável, mock) */}
        <section className="rounded-xl border border-blue-200 bg-blue-50/40 overflow-hidden">
          <header className="px-4 py-3 border-b border-blue-100">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800">Minha Fila</h3>
              <Select value={tecnico} onValueChange={setTecnico}>
                <SelectTrigger className="h-7 w-[170px] text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TECNICOS.map((t) => (
                    <SelectItem key={t.id} value={t.nome}>
                      {t.nome} · {t.nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>
          <ul className="divide-y divide-blue-100/70">
            {minhaFila.length === 0 && (
              <li className="text-sm text-slate-400 text-center py-6">
                Nada na fila de {tecnico.split(' ')[0]}
              </li>
            )}
            {minhaFila.map(({ chamado: c }) => (
              <li key={c.id} className="px-4 py-2.5">
                <button
                  type="button"
                  onClick={() => onAbrirDetalhe(c.id)}
                  className="w-full text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 group-hover:text-blue-700">
                      {c.numero}
                    </span>
                    <BadgePrioridade prioridade={c.prioridade} />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                    {c.cliente} · {c.descricao}
                  </p>
                  <BadgeSla status={slaStatusDe(c)} texto={textoRestanteSLA(c)} className="mt-1" />
                </button>
              </li>
            ))}
          </ul>
          {naoAtribuidos.length > 0 && (
            <p className="px-4 py-2 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-100">
              {naoAtribuidos.length} chamado{naoAtribuidos.length > 1 ? 's' : ''} sem técnico
              aguardando designação na fila geral.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
