// Dashboard — consome o estado compartilhado (AppDataContext) para refletir
// chamados, fila inteligente e locações criadas nesta sessão (Onda 2).
import {
  Monitor,
  Headphones,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Printer,
  Laptop,
  Smartphone,
  Server,
  UserX,
  ShieldAlert,
  CalendarClock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { KpiCardData, Chamado, Locacao, fmtBRL, HOJE_MOCK } from '@/data/mockData'
import { useAppData } from '@/state/AppDataContext'
import {
  ordenarFila,
  slaStatusDe,
  tempoEspera,
  textoRestanteSLA,
  alertasLocacao,
  parseDataBR,
} from '@/lib/regras'
import {
  BadgePrioridade,
  BadgeStatusChamado,
  BadgeSla,
  BadgeStatusLocacao,
} from '@/components/badgesOperacao'

const MS_DIA = 86_400_000

export default function Index() {
  const { chamados, locacoes } = useAppData()

  const ativos = locacoes.filter((l) => l.status !== 'Encerrado')
  const abertos = chamados.filter((c) => c.status !== 'Fechado')
  const emRisco = chamados.filter(
    (c) => c.status !== 'Fechado' && c.status !== 'Resolvido' && slaStatusDe(c) !== 'dentro',
  )
  const alertas = alertasLocacao(locacoes)
  const fila = ordenarFila(chamados).slice(0, 3)

  const kpis: KpiCardData[] = [
    {
      id: 'kpi-locacoes',
      titulo: 'Locações ativas',
      valor: String(ativos.length),
      delta: `${fmtBRL(ativos.reduce((s, l) => s + l.valorMensal, 0))}/mês`,
      deltaTipo: 'neutro',
      corTema: 'blue',
      icone: 'monitor',
    },
    {
      id: 'kpi-chamados',
      titulo: 'Chamados em andamento',
      valor: String(abertos.length),
      delta: `${chamados.filter((c) => c.status === 'Aberto').length} abertos agora`,
      deltaTipo: 'neutro',
      corTema: 'indigo',
      icone: 'ticket',
    },
    {
      id: 'kpi-sla-risco',
      titulo: 'Chamados com SLA em risco',
      valor: String(emRisco.length),
      delta:
        emRisco.length > 0
          ? `${emRisco.filter((c) => slaStatusDe(c) === 'vencido').length} vencido(s) hoje`
          : 'Nenhum vencido',
      deltaTipo: emRisco.some((c) => slaStatusDe(c) === 'vencido') ? 'negativo' : 'positivo',
      corTema: 'amber',
      icone: 'alert',
    },
    {
      id: 'kpi-locacoes-alerta',
      titulo: 'Locações vencendo em 7 dias',
      valor: String(alertas.total),
      delta:
        alertas.total > 0
          ? `mais crítica: ${alertas.diasRestantes < 0 ? 'vencida' : `${alertas.diasRestantes} dia(s)`}`
          : 'Nenhum vencimento próximo',
      deltaTipo: alertas.total > 0 ? 'negativo' : 'positivo',
      corTema: 'orange',
      icone: 'wrench',
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Título da página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral de locações e atendimento</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Sessão de {HOJE_MOCK.toLocaleDateString('pt-BR')} · Dados de demonstração
          </span>
        </div>
      </div>

      {/* 1. KPIs do topo */}
      <section aria-label="Indicadores principais">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* Alerta de locações vencendo em 7 dias */}
      {alertas.total > 0 && (
        <section
          aria-label="Alerta de vencimentos"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5"
          role="alert"
        >
          <CalendarRefresh className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>
              {alertas.total} locaç{alertas.total === 1 ? 'ão' : 'ões'} vencendo em até 7 dias:
            </strong>{' '}
            {alertas.locacoes.map((l) => l.cliente).join(', ')}.{' '}
            <Link
              to="/locacoes"
              className="font-semibold underline underline-offset-2 hover:text-amber-950"
            >
              Renovar na gestão de locações
            </Link>
          </p>
        </section>
      )}

      {/* 2. Locações ativas (esq) & chamados recentes (dir) */}
      <section aria-label="Operação diária" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Locações ativas */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-base font-semibold text-slate-900">Locações Ativas</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {ativos.length}
              </span>
            </div>
            <Link
              to="/locacoes"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                  <th className="py-3 px-4 sm:px-5">Cliente</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Equipamento</th>
                  <th className="py-3 px-4">Período</th>
                  <th className="py-3 px-4 sm:px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {ativos.map((loc) => (
                  <LocacaoRow key={loc.id} loc={loc} />
                ))}
                {ativos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-sm text-slate-400">
                      Nenhuma locação ativa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 px-5 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Mostrando {ativos.length} contratos ativos</span>
            <span className="text-emerald-700 font-medium">
              ● {ativos.filter((l) => l.status === 'Ativo').length} ativos · ▲ {alertas.total}{' '}
              vencendo em 7d
            </span>
          </div>
        </div>

        {/* Chamados recentes */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">Chamados Recentes</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {chamados.length}
              </span>
            </div>
            <Link
              to="/chamados"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {[...chamados]
              .sort((a, b) => new Date(b.aberturaISO).getTime() - new Date(a.aberturaISO).getTime())
              .slice(0, 6)
              .map((chamado) => (
                <ChamadoRow key={chamado.id} chamado={chamado} />
              ))}
          </div>

          <div className="p-3 px-5 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Ordenados por abertura</span>
            <span className="text-slate-600 font-medium">{emRisco.length} com SLA em risco</span>
          </div>
        </div>
      </section>

      {/* 3. Fila de Atendimento (fila inteligente, próximos 3) */}
      <section
        aria-label="Fila de atendimento"
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 transition-shadow hover:shadow-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Fila de Atendimento</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Fila inteligente · próximos 3
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ordenada por prioridade → tempo de espera → SLA mais curto
            </p>
          </div>
          <Link
            to="/chamados"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors group self-start sm:self-auto"
          >
            <span>Abrir fila completa</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {fila.map(({ chamado }, index) => (
            <FilaMiniCard key={chamado.id} chamado={chamado} posicao={index + 1} />
          ))}
          {fila.length === 0 && <p className="text-sm text-slate-400">Nenhum chamado na fila.</p>}
        </div>
      </section>
    </div>
  )
}

/* ===================== Sub-componentes ===================== */

function LocacaoRow({ loc }: { loc: Locacao }) {
  const dias = Math.round((parseDataBR(loc.dataFim).getTime() - HOJE_MOCK.getTime()) / MS_DIA)
  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="py-3.5 px-4 sm:px-5">
        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
          {loc.cliente}
        </div>
        <div className="text-xs text-slate-500 sm:hidden mt-0.5 flex items-center gap-1">
          <EquipmentIcon tipo={loc.tipoEquipamento} />
          <span>{loc.equipamento}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 hidden sm:table-cell">
        <div className="flex items-center gap-2 text-slate-700">
          <EquipmentIcon tipo={loc.tipoEquipamento} />
          <span className="truncate max-w-[200px]" title={loc.equipamento}>
            {loc.equipamento}
          </span>
        </div>
      </td>
      <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
        <div className="font-medium text-slate-700">
          {loc.dataInicio} <span className="text-slate-400">→</span> {loc.dataFim}
        </div>
        <div className="text-[11px] text-slate-400">{fmtBRL(loc.valorMensal)}/mês</div>
      </td>
      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
        <BadgeStatusLocacao status={loc.status} />
        {dias <= 7 && dias >= 0 && (
          <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
            {dias === 0 ? 'vence hoje' : `vence em ${dias} dia${dias === 1 ? '' : 's'}`}
          </div>
        )}
        {dias < 0 && (
          <div className="text-[11px] font-semibold text-red-600 mt-0.5">
            vencida há {Math.abs(dias)} dia{Math.abs(dias) === 1 ? '' : 's'}
          </div>
        )}
      </td>
    </tr>
  )
}

function ChamadoRow({ chamado: c }: { chamado: Chamado }) {
  return (
    <div className="p-4 hover:bg-slate-50/80 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {c.numero}
          </span>
          <span className="font-semibold text-sm text-slate-900 truncate">{c.cliente}</span>
        </div>
        <BadgePrioridade prioridade={c.prioridade} />
      </div>

      <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mb-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
          {c.tipo}
        </span>
        <span>•</span>
        <BadgeStatusChamado status={c.status} />
        <span className="text-slate-300">•</span>
        <span className="text-slate-400">há {tempoEspera(c.aberturaISO)}</span>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100/70">
        <span className="text-slate-400 text-[11px]">
          Técnico: <strong className="text-slate-600 font-medium">{c.tecnico ?? '—'}</strong>
        </span>
        <BadgeSla status={slaStatusDe(c)} texto={textoRestanteSLA(c)} />
      </div>
    </div>
  )
}

function KpiCard({ kpi }: { kpi: KpiCardData }) {
  const cores = {
    blue: { iconBg: 'bg-blue-50 text-blue-600', accentBorder: 'hover:border-blue-300' },
    indigo: { iconBg: 'bg-indigo-50 text-indigo-600', accentBorder: 'hover:border-purple-300' },
    amber: { iconBg: 'bg-amber-50 text-amber-600', accentBorder: 'hover:border-amber-300' },
    orange: { iconBg: 'bg-orange-50 text-orange-600', accentBorder: 'hover:border-orange-300' },
  }[kpi.corTema]

  const icone = {
    monitor: <Monitor className="w-6 h-6" />,
    ticket: <Headphones className="w-6 h-6" />,
    alert: <AlertTriangle className="w-6 h-6" />,
    wrench: <Wrench className="w-6 h-6" />,
  }[kpi.icone]

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-150 group ${cores.accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl ${cores.iconBg} transition-transform group-hover:scale-105 duration-150 shrink-0`}
        >
          {icone}
        </div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">
          KPI
        </span>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
          {kpi.valor}
        </div>
        <div className="text-xs sm:text-sm font-medium text-slate-600 mt-1 line-clamp-1">
          {kpi.titulo}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
        {kpi.deltaTipo === 'positivo' && (
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 inline" />
            {kpi.delta}
          </span>
        )}
        {kpi.deltaTipo === 'negativo' && (
          <span className="text-red-600 font-semibold flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 inline" />
            {kpi.delta}
          </span>
        )}
        {kpi.deltaTipo === 'neutro' && (
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 inline" />
            {kpi.delta}
          </span>
        )}
      </div>
    </div>
  )
}

function FilaMiniCard({ chamado: c, posicao }: { chamado: Chamado; posicao: number }) {
  const corBorda =
    c.prioridade === 'Alta'
      ? 'border-l-[#DC2626]'
      : c.prioridade === 'Média'
        ? 'border-l-[#D97706]'
        : 'border-l-[#16A34A]'
  return (
    <div
      className={`bg-slate-50/70 hover:bg-white rounded-lg p-4 border border-slate-200 border-l-4 ${corBorda} transition-all shadow-xs hover:shadow-md flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
              #{posicao}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">{c.numero}</span>
          </div>
          <BadgePrioridade prioridade={c.prioridade} />
        </div>
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{c.cliente}</h4>
          <span className="inline-block text-xs text-slate-500 font-medium mt-0.5">{c.tipo}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">Técnico:</span>
          {c.tecnico ? (
            <span className="font-semibold text-slate-800">{c.tecnico}</span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700 inline-flex items-center gap-1">
              <UserX className="w-3 h-3" />
              sem técnico
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-400">Tempo & SLA:</span>
          <span className="text-slate-700 font-semibold">
            {tempoEspera(c.aberturaISO)} · {textoRestanteSLA(c)}
          </span>
        </div>
      </div>
    </div>
  )
}

function EquipmentIcon({ tipo }: { tipo: string }) {
  if (tipo.includes('Impressora'))
    return <Printer className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  if (tipo.includes('Notebook')) return <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  if (tipo.includes('Computador')) return <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  return <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
}
