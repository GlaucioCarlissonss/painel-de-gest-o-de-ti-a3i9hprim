// Painel TV — modo exibição em tela cheia para monitor/TV.
// Blocos autorrotam a cada 15s (setInterval, limpo no unmount), relógio ao vivo
// com data por extenso em pt-BR, fundo escuro e tipografia grande.
// Fora do Layout do app: rota /tv sem sidebar nem header.
// Onda 2: consome o estado compartilhado (AppDataContext) — mesma fonte das telas.
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tv, X, Clock, AlertTriangle, CalendarClock, Boxes, CheckCircle } from 'lucide-react'
import { PrioridadeChamado, Chamado, Locacao, fmtBRL } from '@/data/mockData'
import { useAppData } from '@/state/AppDataContext'
import {
  ordenarFila,
  slaStatusDe,
  textoRestanteSLA,
  tempoEspera,
  alertasLocacao,
} from '@/lib/regras'
import { cn } from '@/lib/utils'

const ROTACAO_MS = 15_000

type BlocoId = 'prioridades' | 'fila' | 'sla' | 'locacoes'

const BLOCOS: { id: BlocoId; titulo: string; subtitulo: string }[] = [
  {
    id: 'prioridades',
    titulo: 'Chamados abertos por prioridade',
    subtitulo: 'Visão geral da demanda',
  },
  {
    id: 'fila',
    titulo: 'Fila de atendimento do momento',
    subtitulo: 'Ordenada por prioridade → tempo de espera → SLA mais curto',
  },
  { id: 'sla', titulo: 'SLA em risco', subtitulo: 'Contagem regressiva para o vencimento' },
  {
    id: 'locacoes',
    titulo: 'Locações vencendo nos próximos 7 dias',
    subtitulo: 'Renovações a confirmar',
  },
]

const CORES_PRIORIDADE: Record<PrioridadeChamado, { bg: string; text: string; border: string }> = {
  Alta: { bg: 'bg-red-950/60', text: 'text-red-300', border: 'border-red-800' },
  Média: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800' },
  Baixa: { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-800' },
}

function useRelogio() {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return agora
}

export default function PainelTv() {
  const navigate = useNavigate()
  const relogio = useRelogio()
  const [indice, setIndice] = useState(0)
  const { chamados, locacoes } = useAppData()

  // Autorrotação dos blocos a cada 15s; timer limpo ao desmontar
  useEffect(() => {
    const t = setInterval(() => {
      setIndice((i) => (i + 1) % BLOCOS.length)
    }, ROTACAO_MS)
    return () => clearInterval(t)
  }, [])

  const dataExtenso = relogio.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const hora = relogio.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const bloco = BLOCOS[indice]

  const porPrioridade = useMemo(() => {
    const abertos = chamados.filter((c) => c.status !== 'Resolvido' && c.status !== 'Fechado')
    return (['Alta', 'Média', 'Baixa'] as const).map((p) => ({
      prioridade: p,
      quantidade: abertos.filter((c) => c.prioridade === p).length,
    }))
  }, [chamados])

  const emRisco = useMemo(
    () =>
      chamados.filter(
        (c) => c.status !== 'Resolvido' && c.status !== 'Fechado' && slaStatusDe(c) !== 'dentro',
      ),
    [chamados],
  )

  const vencendo = useMemo(() => {
    const alertas = alertasLocacao(locacoes)
    const ids = new Set(alertas.locacoes.map((l) => l.id))
    return locacoes.filter((l) => ids.has(l.id))
  }, [locacoes])

  return (
    <div className="fixed inset-0 bg-[#0B1220] text-slate-100 overflow-y-auto font-sans antialiased">
      {/* Barra superior: marca, relógio ao vivo e saída discreta */}
      <header className="flex items-center justify-between gap-4 px-6 sm:px-10 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-base sm:text-lg font-bold text-white truncate">ITLoc Gestão</div>
            <div className="text-xs sm:text-sm text-slate-400 capitalize truncate">
              {dataExtenso}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-white">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" aria-hidden="true" />
            {hora}
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="opacity-40 hover:opacity-100 transition-opacity p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Sair do modo TV e voltar ao dashboard"
            title="Sair do modo TV"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Título do bloco atual + indicadores de rotação */}
      <div className="px-6 sm:px-10 pt-6 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {bloco.titulo}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-0.5">{bloco.subtitulo}</p>
        </div>
        <div className="flex items-center gap-2" role="tablist" aria-label="Blocos rotativos">
          {BLOCOS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              role="tab"
              aria-selected={i === indice}
              aria-label={`Mostrar bloco: ${b.titulo}`}
              onClick={() => setIndice(i)}
              className={cn(
                'h-2.5 rounded-full transition-all',
                i === indice ? 'w-8 bg-blue-500' : 'w-2.5 bg-slate-700 hover:bg-slate-600',
              )}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo do bloco ativo */}
      <main className="px-6 sm:px-10 pb-8 min-h-[60vh]">
        {bloco.id === 'prioridades' && <BlocoPrioridades itens={porPrioridade} />}
        {bloco.id === 'fila' && <BlocoFila chamados={chamados} />}
        {bloco.id === 'sla' && <BlocoSla emRisco={emRisco} />}
        {bloco.id === 'locacoes' && <BlocoLocacoes vencendo={vencendo} />}
      </main>

      {/* Rodapé discreto */}
      <footer className="px-6 sm:px-10 pb-6 text-xs text-slate-500 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          Dados de demonstração · rotação automática a cada 15s
        </span>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="underline-offset-2 hover:underline opacity-60 hover:opacity-100 transition-opacity"
        >
          Sair do modo TV
        </button>
      </footer>
    </div>
  )
}

/* ---------------- Bloco A: chamados abertos por prioridade ---------------- */
function BlocoPrioridades({
  itens,
}: {
  itens: { prioridade: PrioridadeChamado; quantidade: number }[]
}) {
  const total = itens.reduce((acc, i) => acc + i.quantidade, 0)
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
      {itens.map(({ prioridade, quantidade }) => {
        const cor = CORES_PRIORIDADE[prioridade]
        return (
          <div
            key={prioridade}
            className={cn(
              'rounded-2xl border p-8 flex flex-col justify-between',
              cor.bg,
              cor.border,
            )}
          >
            <div className={cn('text-xl font-semibold uppercase tracking-wide', cor.text)}>
              Prioridade {prioridade}
            </div>
            <div className="text-7xl sm:text-8xl font-bold tabular-nums text-white leading-none mt-6">
              {quantidade}
            </div>
            <div className="text-base text-slate-400 mt-3">
              {quantidade === 0
                ? 'nenhum chamado'
                : quantidade === 1
                  ? 'chamado aberto'
                  : 'chamados abertos'}
              {' · '}
              {total > 0 ? Math.round((quantidade / total) * 100) : 0}% do total
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- Bloco B: fila de atendimento com técnicos ---------------- */
function BlocoFila({ chamados }: { chamados: Chamado[] }) {
  const fila = useMemo(() => ordenarFila(chamados).slice(0, 5), [chamados])
  return (
    <div className="space-y-4 mt-4">
      {fila.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-2xl font-bold text-slate-300">
          Nenhum chamado na fila
        </div>
      )}
      {fila.map(({ chamado }, i) => (
        <div
          key={chamado.id}
          className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="text-5xl font-bold text-slate-600 tabular-nums w-14 shrink-0">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-lg font-bold text-blue-300">{chamado.numero}</span>
              <span className="text-2xl font-bold text-white truncate">{chamado.cliente}</span>
            </div>
            <div className="text-base text-slate-400 mt-1">{chamado.tipo}</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div
              className={cn(
                'w-11 h-11 rounded-full border text-sm font-bold flex items-center justify-center',
                chamado.tecnico
                  ? 'bg-blue-600/30 text-blue-200 border-blue-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700',
              )}
            >
              {chamado.tecnico ? iniciais(chamado.tecnico) : '—'}
            </div>
            <div className="text-left">
              <div className="text-base font-semibold text-white">
                {chamado.tecnico ?? 'Aguardando designação'}
              </div>
              <div className="text-xs text-slate-400">
                na fila há {tempoEspera(chamado.aberturaISO)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------------- Bloco C: SLA em risco com contagem regressiva ---------------- */
function BlocoSla({ emRisco }: { emRisco: Chamado[] }) {
  return (
    <div className="space-y-4 mt-4">
      {emRisco.length === 0 && (
        <div className="rounded-2xl border border-emerald-900 bg-emerald-950/40 p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" aria-hidden="true" />
          <p className="text-2xl font-bold text-emerald-200 mt-3">Nenhum SLA em risco agora</p>
        </div>
      )}
      {emRisco.map((c) => {
        const status = slaStatusDe(c)
        return (
          <div
            key={c.id}
            className={cn(
              'rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4',
              status === 'vencido'
                ? 'border-red-800 bg-red-950/40'
                : 'border-amber-800 bg-amber-950/40',
            )}
          >
            <AlertTriangle
              className={cn(
                'w-9 h-9 shrink-0',
                status === 'vencido' ? 'text-red-400' : 'text-amber-400',
              )}
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-lg font-bold text-slate-200">{c.numero}</span>
                <span className="text-2xl font-bold text-white truncate">{c.cliente}</span>
              </div>
              <div className="text-base text-slate-300 mt-1 truncate">{c.descricao || c.tipo}</div>
            </div>
            <div className="text-right shrink-0">
              <div
                className={cn(
                  'text-3xl sm:text-4xl font-bold tabular-nums',
                  status === 'vencido' ? 'text-red-300' : 'text-amber-300',
                )}
              >
                {textoRestanteSLA(c)}
              </div>
              <div className="text-sm text-slate-400 mt-0.5">
                SLA · na fila há {tempoEspera(c.aberturaISO)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------------- Bloco D: locações vencendo nos próximos 7 dias ---------------- */
function BlocoLocacoes({ vencendo }: { vencendo: Locacao[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
      {vencendo.length === 0 && (
        <div className="rounded-2xl border border-emerald-900 bg-emerald-950/40 p-8 text-center md:col-span-2">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" aria-hidden="true" />
          <p className="text-2xl font-bold text-emerald-200 mt-3">
            Nenhuma locação vencendo nos próximos 7 dias
          </p>
        </div>
      )}
      {vencendo.map((l) => (
        <div key={l.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-bold text-white truncate">{l.cliente}</span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold shrink-0 bg-amber-950/80 text-amber-300 border border-amber-800">
              {statusVencimento(l)}
            </span>
          </div>
          <div className="text-base text-slate-300 mt-2 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
            {l.equipamento}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-base">
            <span className="text-slate-400 inline-flex items-center gap-2">
              <CalendarClock className="w-5 h-5" aria-hidden="true" />
              Fim em {l.dataFim}
            </span>
            <span className="font-bold text-white tabular-nums">{fmtBRL(l.valorMensal)}/mês</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function iniciais(nome: string) {
  return nome
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function statusVencimento(l: Locacao) {
  if (l.status === 'Encerrado') return 'Encerrado'
  const dias = diasRestantes(l)
  if (dias < 0) return `vencida há ${Math.abs(dias)} dia(s)`
  if (dias === 0) return 'vence hoje'
  return `vence em ${dias} dia(s)`
}

function diasRestantes(l: Locacao) {
  return Math.ceil(
    (new Date(l.dataFim.split('/').reverse().join('-')).getTime() - HOJE.getTime()) / 86_400_000,
  )
}

const HOJE = new Date('2025-06-10T09:00:00')
