import React from 'react'
import { Box, Ticket, Users, BarChart3, ArrowLeft, Calendar, Layers, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PlaceholderProps {
  titulo: string
  subtitulo: string
  descricao: string
  tipo: 'locacoes' | 'chamados' | 'clientes' | 'relatorios'
  recursosPlanejados: string[]
}

export function PlaceholderPage({
  titulo,
  subtitulo,
  descricao,
  tipo,
  recursosPlanejados,
}: PlaceholderProps) {
  const getIcon = () => {
    switch (tipo) {
      case 'locacoes':
        return <Box className="w-12 h-12 text-blue-600" />
      case 'chamados':
        return <Ticket className="w-12 h-12 text-indigo-600" />
      case 'clientes':
        return <Users className="w-12 h-12 text-emerald-600" />
      case 'relatorios':
        return <BarChart3 className="w-12 h-12 text-amber-600" />
    }
  }

  const getBadgeColor = () => {
    switch (tipo) {
      case 'locacoes':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'chamados':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'clientes':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'relatorios':
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 text-center flex flex-col items-center">
        {/* Ícone estilizado */}
        <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-inner">
          {getIcon()}
        </div>

        {/* Tag de Módulo */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${getBadgeColor()}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Módulo em Construção</span>
        </span>

        {/* Título e Texto */}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{titulo}</h1>
        <p className="text-base text-slate-600 font-medium mt-1">{subtitulo}</p>
        <p className="text-sm text-slate-500 max-w-lg mt-3">{descricao}</p>

        {/* Recursos futuros previstos */}
        <div className="w-full max-w-md my-8 p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Funcionalidades na Fase 2</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-600">
            {recursosPlanejados.map((rec, idx) => (
              <li key={idx} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botão de retorno ao Dashboard */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  )
}

export function LocacoesPage() {
  return (
    <PlaceholderPage
      tipo="locacoes"
      titulo="Locações"
      subtitulo="Gestão completa de contratos de locação em breve."
      descricao="Aqui você poderá gerenciar o ciclo de vida de contratos de locação de impressoras, desktops, notebooks e dispositivos móveis, com renovações e faturamento automático."
      recursosPlanejados={[
        'Cadastro e renovação de contratos de locação',
        'Controle de números de série e patrimônio alocado',
        'Alertas de vencimento antecipado em 30, 15 e 7 dias',
        'Emissão de termos de entrega e devolução',
      ]}
    />
  )
}

export function ChamadosPage() {
  return (
    <PlaceholderPage
      tipo="chamados"
      titulo="Chamados"
      subtitulo="Central de chamados e SLA em breve."
      descricao="Aqui você terá o Service Desk completo com abertura de tickets N1/N2/N3, regras estritas de SLA, histórico de atendimento e automação de roteamento."
      recursosPlanejados={[
        'Abertura de chamados por e-mail, portal e WhatsApp',
        'Temporizador de SLA com escalonamento automático',
        'Atribuição inteligente por fila de especialidade',
        'Base de conhecimento e apontamento de horas',
      ]}
    />
  )
}

export function ClientesPage() {
  return (
    <PlaceholderPage
      tipo="clientes"
      titulo="Clientes"
      subtitulo="Cadastro e segmentação de clientes em breve."
      descricao="Visão 360º de todas as empresas contratantes, filiais, pontos de contato técnico, contratos vigentes e histórico consolidado de chamados abertos."
      recursosPlanejados={[
        'Cadastro completo de empresas (CNPJ, filiais e responsáveis)',
        'Classificação por faixa de SLA e nível de atendimento (Tier 1/2)',
        'Mapeamento de parque de máquinas por cliente',
        'Histórico financeiro e adimplência de contratos',
      ]}
    />
  )
}

export function RelatoriosPage() {
  return (
    <PlaceholderPage
      tipo="relatorios"
      titulo="Relatórios"
      subtitulo="Painéis de gestão e exportação em breve."
      descricao="Métricas operacionais avançadas, tempo médio de atendimento (TMA), cumprimento de SLA, taxa de ocupação de equipamentos e relatórios executivos para clientes."
      recursosPlanejados={[
        'Relatório de cumprimento de SLA por cliente e técnico',
        'Taxa de disponibilidade e depreciação de equipamentos',
        'Exportação em PDF executivo e planilha Excel',
        'Envio automático de relatório mensal de desempenho',
      ]}
    />
  )
}
