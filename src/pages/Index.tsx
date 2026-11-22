import React from 'react'
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
  UserCheck,
  UserX,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  MOCK_KPIS,
  MOCK_LOCACOES,
  MOCK_CHAMADOS,
  MOCK_FILA,
  KpiCardData,
  StatusLocacao,
  PrioridadeChamado,
  StatusChamado,
  StatusSLA,
} from '@/data/mockData'

export default function Index() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral de locações e atendimento</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Atualizado agora · Mocks</span>
        </div>
      </div>

      {/* 1. CARDS DE RESUMO NO TOPO (4 KPIs) */}
      <section aria-label="Indicadores principais">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {MOCK_KPIS.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* 2. DUAS COLUNAS: LOCAÇÕES ATIVAS (ESQ) & CHAMADOS RECENTES (DIR) */}
      <section aria-label="Operação diária" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna da Esquerda: Locações Ativas (~55% = 7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
          {/* Header do Card */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h2 className="text-base font-semibold text-slate-900">Locações Ativas</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {MOCK_LOCACOES.length}
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

          {/* Tabela / Lista de Locações */}
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
                {MOCK_LOCACOES.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Cliente + Equipamento no mobile */}
                    <td className="py-3.5 px-4 sm:px-5">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {loc.cliente}
                      </div>
                      <div className="text-xs text-slate-500 sm:hidden mt-0.5 flex items-center gap-1">
                        <EquipmentIcon tipo={loc.tipoEquipamento} />
                        <span>{loc.equipamento}</span>
                      </div>
                    </td>

                    {/* Equipamento (desktop) */}
                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2 text-slate-700">
                        <EquipmentIcon tipo={loc.tipoEquipamento} />
                        <span className="truncate max-w-[200px]" title={loc.equipamento}>
                          {loc.equipamento}
                        </span>
                      </div>
                    </td>

                    {/* Período */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="font-medium text-slate-700">
                        {loc.dataInicio} <span className="text-slate-400">→</span> {loc.dataFim}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {loc.valorMensal || 'Contrato mensal'}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                      <StatusLocacaoBadge status={loc.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rodapé informativo */}
          <div className="p-3 px-5 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Mostrando {MOCK_LOCACOES.length} contratos recentes</span>
            <span className="text-emerald-700 font-medium">● 4 ativos · ▲ 2 vencendo em 7d</span>
          </div>
        </div>

        {/* Coluna da Direita: Chamados Recentes (~45% = 5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md">
          {/* Header do Card */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              <h2 className="text-base font-semibold text-slate-900">Chamados Recentes</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {MOCK_CHAMADOS.length}
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

          {/* Lista de Chamados Recentes */}
          <div className="divide-y divide-slate-100 flex-1">
            {MOCK_CHAMADOS.map((chamado) => (
              <div
                key={chamado.id}
                className="p-4 sm:p-4.5 hover:bg-slate-50/80 transition-colors group"
              >
                {/* Linha superior: ID + Cliente + Prioridade */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {chamado.numero}
                    </span>
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {chamado.cliente}
                    </span>
                  </div>
                  <PrioridadeBadge prioridade={chamado.prioridade} />
                </div>

                {/* Linha intermediária: Tipo + Status */}
                <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    {chamado.tipo}
                  </span>
                  <span>•</span>
                  <StatusChamadoBadge status={chamado.status} />
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">{chamado.tempoDecorrido}</span>
                </div>

                {/* Linha inferior: Indicador SLA */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100/70">
                  <span className="text-slate-400 text-[11px]">
                    Técnico:{' '}
                    <strong className="text-slate-600 font-medium">{chamado.tecnico}</strong>
                  </span>
                  <SlaIndicator status={chamado.slaStatus} texto={chamado.slaTexto} />
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé informativo */}
          <div className="p-3 px-5 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Últimas 24 horas</span>
            <span className="text-slate-600 font-medium">
              SLA médio de resposta: <strong>18 min</strong>
            </span>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO INFERIOR — FILA DE ATENDIMENTO (3 MINI-CARDS) */}
      <section
        aria-label="Fila de atendimento"
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 transition-shadow hover:shadow-md"
      >
        {/* Header da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Fila de Atendimento</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Próximos 3 chamados
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Próximos chamados aguardando atendimento ou ação do técnico designado
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

        {/* 3 Mini-Cards da Fila */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {MOCK_FILA.map((item, index) => (
            <FilaMiniCard key={item.id} item={item} posicao={index + 1} />
          ))}
        </div>
      </section>
    </div>
  )
}

/* =========================================================================
   SUB-COMPONENTES MODULARES
   ========================================================================= */

// Card de KPI do topo
function KpiCard({ kpi }: { kpi: KpiCardData }) {
  const getColors = () => {
    switch (kpi.corTema) {
      case 'blue':
        return {
          iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
          accentBorder: 'hover:border-blue-300',
        }
      case 'indigo':
        return {
          iconBg: 'bg-[#F5F3FF] text-[#7C3AED]',
          accentBorder: 'hover:border-purple-300',
        }
      case 'amber':
        return {
          iconBg: 'bg-[#FFFBEB] text-[#D97706]',
          accentBorder: 'hover:border-amber-300',
        }
      case 'orange':
        return {
          iconBg: 'bg-[#FFF7ED] text-[#EA580C]',
          accentBorder: 'hover:border-orange-300',
        }
    }
  }

  const renderIcon = () => {
    switch (kpi.icone) {
      case 'monitor':
        return <Monitor className="w-6 h-6" />
      case 'ticket':
        return <Headphones className="w-6 h-6" />
      case 'alert':
        return <AlertTriangle className="w-6 h-6" />
      case 'wrench':
        return <Wrench className="w-6 h-6" />
    }
  }

  const { iconBg, accentBorder } = getColors()

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-150 group ${accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBg} transition-transform group-hover:scale-105 duration-150 shrink-0`}
        >
          {renderIcon()}
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

// Badge de Status de Locação
function StatusLocacaoBadge({ status }: { status: StatusLocacao }) {
  switch (status) {
    case 'Ativo':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Ativo
        </span>
      )
    case 'Vencendo em 7 dias':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse" />
          Vencendo em 7 dias
        </span>
      )
    case 'Encerrado':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#64748B] border border-slate-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
          Encerrado
        </span>
      )
  }
}

// Badge de Prioridade de Chamado
function PrioridadeBadge({ prioridade }: { prioridade: PrioridadeChamado }) {
  switch (prioridade) {
    case 'Alta':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-red-200 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
          Alta
        </span>
      )
    case 'Média':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-amber-200 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
          Média
        </span>
      )
    case 'Baixa':
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#16A34A] border border-emerald-200 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Baixa
        </span>
      )
  }
}

// Badge de Status de Chamado
function StatusChamadoBadge({ status }: { status: StatusChamado }) {
  switch (status) {
    case 'Aberto':
      return <span className="font-semibold text-blue-600">Aberto</span>
    case 'Em Atendimento':
      return <span className="font-semibold text-indigo-600">Em Atendimento</span>
    case 'Escalonado':
      return <span className="font-semibold text-amber-600">Escalonado</span>
    case 'Resolvido':
      return <span className="font-semibold text-emerald-600">Resolvido</span>
  }
}

// Indicador visual de SLA
function SlaIndicator({ status, texto }: { status: StatusSLA; texto: string }) {
  switch (status) {
    case 'dentro':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{texto}</span>
        </span>
      )
    case 'proximo':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 rounded border border-orange-200">
          <AlertCircle className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>{texto}</span>
        </span>
      )
    case 'vencido':
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-red-200">
          <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
          <span>{texto}</span>
        </span>
      )
  }
}

// Ícone do equipamento
function EquipmentIcon({ tipo }: { tipo: string }) {
  if (tipo.includes('Impressora')) {
    return <Printer className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  }
  if (tipo.includes('Notebook')) {
    return <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  }
  if (tipo.includes('Computador')) {
    return <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
  }
  return <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
}

// Mini-Card da Fila de Atendimento
function FilaMiniCard({ item, posicao }: { item: (typeof MOCK_FILA)[0]; posicao: number }) {
  const getBorderColor = () => {
    switch (item.prioridade) {
      case 'Alta':
        return 'border-l-4 border-l-[#DC2626]'
      case 'Média':
        return 'border-l-4 border-l-[#D97706]'
      case 'Baixa':
        return 'border-l-4 border-l-[#16A34A]'
    }
  }

  const getSlaTextColor = () => {
    switch (item.slaStatus) {
      case 'vencido':
        return 'text-[#DC2626] font-semibold'
      case 'proximo':
        return 'text-[#EA580C] font-semibold'
      case 'dentro':
        return 'text-[#16A34A] font-semibold'
    }
  }

  return (
    <div
      className={`bg-slate-50/70 hover:bg-white rounded-lg p-4 border border-slate-200 transition-all shadow-xs hover:shadow-md ${getBorderColor()} flex flex-col justify-between`}
    >
      <div>
        {/* Topo do mini-card: Posição + Número + Prioridade */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
              #{posicao}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">{item.numero}</span>
          </div>
          <PrioridadeBadge prioridade={item.prioridade} />
        </div>

        {/* Cliente & Tipo */}
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.cliente}</h4>
          <span className="inline-block text-xs text-slate-500 font-medium mt-0.5">
            {item.tipo}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        {/* Técnico designado com Avatar */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">Técnico:</span>
          <div className="flex items-center gap-1.5">
            {item.tecnicoAtribuido ? (
              <>
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center justify-center">
                  {item.tecnicoIniciais}
                </div>
                <span className="font-semibold text-slate-800">{item.tecnico}</span>
              </>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700 inline-flex items-center gap-1">
                <UserX className="w-3 h-3" />
                {item.tecnico}
              </span>
            )}
          </div>
        </div>

        {/* SLA Status na fila */}
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-400">Tempo & SLA:</span>
          <span className={getSlaTextColor()}>{item.slaDescricao}</span>
        </div>
      </div>
    </div>
  )
}
