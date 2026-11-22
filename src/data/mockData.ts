// Centralização dos dados mockados do Painel de Gestão de TI (ITLoc Gestão)
// Estruturado para fácil substituição futura por tabelas reais / API

export type TipoEquipamento =
  | 'Impressora Laser'
  | 'Impressora Térmica'
  | 'Notebook'
  | 'Computador Desktop'
  | 'Tablet / Mobile'

export type StatusLocacao = 'Ativo' | 'Vencendo em 7 dias' | 'Encerrado'

export interface Locacao {
  id: string
  cliente: string
  equipamento: string
  tipoEquipamento: TipoEquipamento
  dataInicio: string
  dataFim: string
  status: StatusLocacao
  valorMensal?: string
}

export type TipoChamado =
  | 'Suporte N1'
  | 'Suporte N2'
  | 'Implementação'
  | 'Projeto de Infra'
  | 'Automação'

export type PrioridadeChamado = 'Alta' | 'Média' | 'Baixa'

export type StatusChamado = 'Aberto' | 'Em Atendimento' | 'Escalonado' | 'Resolvido'

export type StatusSLA = 'dentro' | 'proximo' | 'vencido'

export interface Chamado {
  id: string
  numero: string
  cliente: string
  tipo: TipoChamado
  prioridade: PrioridadeChamado
  status: StatusChamado
  tempoDecorrido: string
  slaStatus: StatusSLA
  slaTexto: string
  descricao?: string
  tecnico?: string
}

export interface ItemFila {
  id: string
  numero: string
  cliente: string
  tipo: TipoChamado
  prioridade: PrioridadeChamado
  tecnico: string
  tecnicoIniciais: string
  tecnicoAtribuido: boolean
  tempoFila: string
  slaStatus: StatusSLA
  slaDescricao: string
}

export interface KpiCardData {
  id: string
  titulo: string
  valor: string
  delta: string
  deltaTipo: 'positivo' | 'negativo' | 'neutro'
  corTema: 'blue' | 'indigo' | 'amber' | 'orange'
  icone: 'monitor' | 'ticket' | 'alert' | 'wrench'
}

// 4 Cards de Resumo no Topo
export const MOCK_KPIS: KpiCardData[] = [
  {
    id: 'kpi-equipamentos',
    titulo: 'Total de Equipamentos Locados',
    valor: '248',
    delta: '▲ 12 este mês',
    deltaTipo: 'positivo',
    corTema: 'blue',
    icone: 'monitor',
  },
  {
    id: 'kpi-chamados-hoje',
    titulo: 'Chamados Abertos Hoje',
    valor: '14',
    delta: '▲ 3 vs ontem',
    deltaTipo: 'positivo',
    corTema: 'indigo',
    icone: 'ticket',
  },
  {
    id: 'kpi-sla-risco',
    titulo: 'Chamados com SLA em Risco',
    valor: '4',
    delta: '1 vencido hoje',
    deltaTipo: 'negativo',
    corTema: 'amber',
    icone: 'alert',
  },
  {
    id: 'kpi-manutencao',
    titulo: 'Equipamentos com Manutenção Programada',
    valor: '9',
    delta: '3 para esta semana',
    deltaTipo: 'neutro',
    corTema: 'orange',
    icone: 'wrench',
  },
]

// 7 Locações Ativas conforme especificação
export const MOCK_LOCACOES: Locacao[] = [
  {
    id: 'loc-1',
    cliente: 'TechNova Sistemas',
    equipamento: 'Impressora Laserjet M404',
    tipoEquipamento: 'Impressora Laser',
    dataInicio: '05/01/2025',
    dataFim: '05/04/2025',
    status: 'Ativo',
    valorMensal: 'R$ 480,00',
  },
  {
    id: 'loc-2',
    cliente: 'Clínica VitalCare',
    equipamento: 'Notebook ThinkPad E14',
    tipoEquipamento: 'Notebook',
    dataInicio: '12/02/2025',
    dataFim: '12/05/2025',
    status: 'Vencendo em 7 dias',
    valorMensal: 'R$ 620,00',
  },
  {
    id: 'loc-3',
    cliente: 'Construtora Alfa',
    equipamento: 'Computador Dell OptiPlex',
    tipoEquipamento: 'Computador Desktop',
    dataInicio: '20/11/2024',
    dataFim: '20/02/2025',
    status: 'Encerrado',
    valorMensal: 'R$ 550,00',
  },
  {
    id: 'loc-4',
    cliente: 'Escola Saber',
    equipamento: '10× Notebooks Acer',
    tipoEquipamento: 'Notebook',
    dataInicio: '03/03/2025',
    dataFim: '03/06/2025',
    status: 'Ativo',
    valorMensal: 'R$ 3.800,00',
  },
  {
    id: 'loc-5',
    cliente: 'LogTrans Express',
    equipamento: 'Impressora térmica Zebra',
    tipoEquipamento: 'Impressora Térmica',
    dataInicio: '15/01/2025',
    dataFim: '15/04/2025',
    status: 'Ativo',
    valorMensal: 'R$ 390,00',
  },
  {
    id: 'loc-6',
    cliente: 'Advocacia Andrade',
    equipamento: 'Notebook MacBook Air',
    tipoEquipamento: 'Notebook',
    dataInicio: '28/02/2025',
    dataFim: '28/03/2025',
    status: 'Vencendo em 7 dias',
    valorMensal: 'R$ 890,00',
  },
  {
    id: 'loc-7',
    cliente: 'Varejo Max',
    equipamento: 'Tablet Samsung Tab',
    tipoEquipamento: 'Tablet / Mobile',
    dataInicio: '10/12/2024',
    dataFim: '10/03/2025',
    status: 'Encerrado',
    valorMensal: 'R$ 290,00',
  },
]

// 6 Chamados Recentes conforme especificação
export const MOCK_CHAMADOS: Chamado[] = [
  {
    id: 'ch-1',
    numero: '#CT-1042',
    cliente: 'TechNova Sistemas',
    tipo: 'Suporte N2',
    prioridade: 'Alta',
    status: 'Em Atendimento',
    tempoDecorrido: 'há 45min',
    slaStatus: 'dentro',
    slaTexto: 'Dentro do prazo',
    descricao: 'Falha intermitente na conexão de rede e compartilhamento de arquivos',
    tecnico: 'Felipe Santos',
  },
  {
    id: 'ch-2',
    numero: '#CT-1041',
    cliente: 'Clínica VitalCare',
    tipo: 'Suporte N1',
    prioridade: 'Alta',
    status: 'Aberto',
    tempoDecorrido: 'há 2h',
    slaStatus: 'vencido',
    slaTexto: 'SLA vencido',
    descricao: 'Impressora térmica de etiquetas do laboratório não inicializa',
    tecnico: 'Carlos N1',
  },
  {
    id: 'ch-3',
    numero: '#CT-1040',
    cliente: 'Varejo Max',
    tipo: 'Implementação',
    prioridade: 'Média',
    status: 'Escalonado',
    tempoDecorrido: 'há 5h',
    slaStatus: 'proximo',
    slaTexto: 'Próximo do vencimento',
    descricao: 'Configuração do novo PDV e terminal de consulta',
    tecnico: 'Rodrigo Lima',
  },
  {
    id: 'ch-4',
    numero: '#CT-1039',
    cliente: 'Escola Saber',
    tipo: 'Automação',
    prioridade: 'Baixa',
    status: 'Em Atendimento',
    tempoDecorrido: 'há 1 dia',
    slaStatus: 'dentro',
    slaTexto: 'Dentro do prazo',
    descricao: 'Ajuste no script de backup automático das estações dos alunos',
    tecnico: 'Marina N2',
  },
  {
    id: 'ch-5',
    numero: '#CT-1038',
    cliente: 'LogTrans Express',
    tipo: 'Projeto de Infra',
    prioridade: 'Média',
    status: 'Aberto',
    tempoDecorrido: 'há 3h',
    slaStatus: 'proximo',
    slaTexto: 'Próximo do vencimento',
    descricao: 'Mapeamento de pontos de rede adicionais para galpão 3',
    tecnico: 'Aguardando atribuição',
  },
  {
    id: 'ch-6',
    numero: '#CT-1037',
    cliente: 'Advocacia Andrade',
    tipo: 'Suporte N1',
    prioridade: 'Baixa',
    status: 'Resolvido',
    tempoDecorrido: 'há 2 dias',
    slaStatus: 'dentro',
    slaTexto: 'Dentro do prazo',
    descricao: 'Instalação de certificado digital e drivers no MacBook',
    tecnico: 'Carlos N1',
  },
]

// 3 Chamados na Fila de Atendimento (Seção Inferior)
export const MOCK_FILA: ItemFila[] = [
  {
    id: 'fila-1',
    numero: '#CT-1041',
    cliente: 'Clínica VitalCare',
    tipo: 'Suporte N1',
    prioridade: 'Alta',
    tecnico: 'Carlos N1',
    tecnicoIniciais: 'CN',
    tecnicoAtribuido: true,
    tempoFila: 'há 2h',
    slaStatus: 'vencido',
    slaDescricao: 'há 2h — SLA vencido',
  },
  {
    id: 'fila-2',
    numero: '#CT-1038',
    cliente: 'LogTrans Express',
    tipo: 'Projeto de Infra',
    prioridade: 'Média',
    tecnico: 'Atribuir manualmente',
    tecnicoIniciais: '?',
    tecnicoAtribuido: false,
    tempoFila: 'há 3h',
    slaStatus: 'proximo',
    slaDescricao: 'há 3h — próx. vencimento',
  },
  {
    id: 'fila-3',
    numero: '#CT-1039',
    cliente: 'Escola Saber',
    tipo: 'Automação',
    prioridade: 'Baixa',
    tecnico: 'Marina N2',
    tecnicoIniciais: 'MN',
    tecnicoAtribuido: true,
    tempoFila: 'há 4h',
    slaStatus: 'dentro',
    slaDescricao: 'há 4h — dentro do prazo',
  },
]

export const USUARIO_LOGADO = {
  nome: 'Rafael Mendes',
  iniciais: 'RM',
  cargo: 'Admin / Gestor',
  empresa: 'ITLoc Gestão',
  subtitulo: 'Locações & Service Desk',
}
