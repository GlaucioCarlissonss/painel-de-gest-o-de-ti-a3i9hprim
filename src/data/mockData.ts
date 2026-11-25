// Centralização dos dados mockados do Painel de Gestão de TI (ITLoc Gestão)
// Estruturado para fácil substituição futura por tabelas reais / API.
// Onda 2: central de chamados, SLA, fila inteligente, designação e locações.

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
  valorMensal: number // BRL
}

export type TipoChamado =
  | 'Suporte N1'
  | 'Suporte N2'
  | 'Implementação'
  | 'Projeto de Infra'
  | 'Dados'
  | 'Automação'

export type PrioridadeChamado = 'Alta' | 'Média' | 'Baixa'

export type StatusChamado = 'Aberto' | 'Em Atendimento' | 'Escalonado' | 'Resolvido' | 'Fechado'

export type StatusSLA = 'dentro' | 'proximo' | 'vencido'

/** Colunas do kanban, na ordem do fluxo */
export const COLUNAS_KANBAN: StatusChamado[] = [
  'Aberto',
  'Em Atendimento',
  'Escalonado',
  'Resolvido',
  'Fechado',
]

export interface EventoTimeline {
  id: string
  dataHora: string // ISO
  autor: string
  descricao: string
  tipo: 'abertura' | 'atualizacao' | 'escalonamento' | 'designacao' | 'resolucao' | 'fechamento'
}

export interface Chamado {
  id: string
  numero: string
  cliente: string
  equipamento?: string
  tipo: TipoChamado
  prioridade: PrioridadeChamado
  status: StatusChamado
  aberturaISO: string // ISO da abertura — base do tempo de espera e da fila
  slaHoras: number // SLA em horas conforme a matriz (projetos: prazo manual)
  prazoISO: string // ISO do vencimento do SLA
  descricao?: string
  tecnico?: string // undefined = aguardando atribuição
  timeline: EventoTimeline[]
  /** True quando o chamado foi aberto pelo cliente no Portal (Fase 8). */
  abertoViaPortal?: boolean
}

export interface Tecnico {
  id: string
  nome: string
  iniciais: string
  nivel: 'N1' | 'N2' | 'Gestor'
  especialidades: TipoChamado[]
  disponivel: boolean
}

export interface Cliente {
  nome: string
  segmento: string
  contrato: 'enterprise' | 'padrao'
  critico: boolean
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

export const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// 4 Cards de Resumo no Topo (estáticos — natureza do card é editorial)
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

// Referência temporal dos mocks (mantém o cenário coerente): a data de "hoje".
// Telas novas usam datas relativas a esta base.
export const HOJE_MOCK = new Date('2025-06-10T09:00:00')

const d = (iso: string) => new Date(iso)

// 8 Locações conforme especificação (datas em 2025, cenário fixo em junho/2025)
export const MOCK_LOCACOES: Locacao[] = [
  {
    id: 'loc-1',
    cliente: 'TechNova Sistemas',
    equipamento: 'Impressora Laserjet M404',
    tipoEquipamento: 'Impressora Laser',
    dataInicio: '05/03/2025',
    dataFim: '05/06/2025',
    status: 'Ativo',
    valorMensal: 480,
  },
  {
    id: 'loc-2',
    cliente: 'Clínica VitalCare',
    equipamento: 'Notebook ThinkPad E14',
    tipoEquipamento: 'Notebook',
    dataInicio: '12/03/2025',
    dataFim: '13/06/2025', // vence em 3 dias → alerta
    status: 'Vencendo em 7 dias',
    valorMensal: 620,
  },
  {
    id: 'loc-3',
    cliente: 'Construtora Alfa',
    equipamento: 'Computador Dell OptiPlex',
    tipoEquipamento: 'Computador Desktop',
    dataInicio: '20/12/2024',
    dataFim: '20/03/2025',
    status: 'Encerrado',
    valorMensal: 550,
  },
  {
    id: 'loc-4',
    cliente: 'Escola Saber',
    equipamento: '10× Notebooks Acer',
    tipoEquipamento: 'Notebook',
    dataInicio: '03/03/2025',
    dataFim: '03/09/2025',
    status: 'Ativo',
    valorMensal: 3800,
  },
  {
    id: 'loc-5',
    cliente: 'LogTrans Express',
    equipamento: 'Impressora térmica Zebra',
    tipoEquipamento: 'Impressora Térmica',
    dataInicio: '15/03/2025',
    dataFim: '15/06/2025', // vence em 5 dias → alerta
    status: 'Vencendo em 7 dias',
    valorMensal: 390,
  },
  {
    id: 'loc-6',
    cliente: 'Advocacia Andrade',
    equipamento: 'Notebook MacBook Air',
    tipoEquipamento: 'Notebook',
    dataInicio: '28/02/2025',
    dataFim: '28/05/2025',
    status: 'Ativo',
    valorMensal: 890,
  },
  {
    id: 'loc-7',
    cliente: 'Varejo Max',
    equipamento: 'Tablet Samsung Tab',
    tipoEquipamento: 'Tablet / Mobile',
    dataInicio: '10/12/2024',
    dataFim: '10/03/2025',
    status: 'Encerrado',
    valorMensal: 290,
  },
  {
    id: 'loc-8',
    cliente: 'LogTrans Express',
    equipamento: 'Notebook Dell Latitude 5440',
    tipoEquipamento: 'Notebook',
    dataInicio: '10/05/2025',
    dataFim: '09/06/2025', // já vencido há 1 dia → alerta crítico
    status: 'Vencendo em 7 dias',
    valorMensal: 640,
  },
]

export const CLIENTES: Cliente[] = [
  { nome: 'TechNova Sistemas', segmento: 'Tecnologia', contrato: 'enterprise', critico: false },
  { nome: 'Clínica VitalCare', segmento: 'Saúde', contrato: 'padrao', critico: true },
  { nome: 'Construtora Alfa', segmento: 'Construção', contrato: 'padrao', critico: false },
  { nome: 'Escola Saber', segmento: 'Educação', contrato: 'padrao', critico: false },
  { nome: 'LogTrans Express', segmento: 'Logística', contrato: 'enterprise', critico: true },
  { nome: 'Advocacia Andrade', segmento: 'Jurídico', contrato: 'padrao', critico: false },
  { nome: 'Varejo Max', segmento: 'Varejo', contrato: 'padrao', critico: false },
]

export const TECNICOS: Tecnico[] = [
  {
    id: 'tec-1',
    nome: 'Carlos Andrade',
    iniciais: 'CA',
    nivel: 'N1',
    especialidades: ['Suporte N1'],
    disponivel: true,
  },
  {
    id: 'tec-2',
    nome: 'Bruna Teixeira',
    iniciais: 'BT',
    nivel: 'N1',
    especialidades: ['Suporte N1'],
    disponivel: true,
  },
  {
    id: 'tec-3',
    nome: 'Felipe Santos',
    iniciais: 'FS',
    nivel: 'N2',
    especialidades: ['Suporte N2', 'Dados'],
    disponivel: true,
  },
  {
    id: 'tec-4',
    nome: 'Marina Costa',
    iniciais: 'MC',
    nivel: 'N2',
    especialidades: ['Suporte N2', 'Automação'],
    disponivel: true,
  },
  {
    id: 'tec-5',
    nome: 'Rodrigo Lima',
    iniciais: 'RL',
    nivel: 'N2',
    especialidades: ['Implementação', 'Projeto de Infra'],
    disponivel: false,
  },
]

const ev = (
  id: string,
  dataHora: string,
  autor: string,
  descricao: string,
  tipo: EventoTimeline['tipo'] = 'abertura',
): EventoTimeline => ({ id, dataHora, autor, descricao, tipo })

// Chamados — cenário fixo em 10/06/2025 09:00 (aberturas espalhadas pelos dias anteriores)
export const MOCK_CHAMADOS: Chamado[] = [
  {
    id: 'ch-1',
    numero: '#CT-1042',
    cliente: 'TechNova Sistemas',
    equipamento: 'Impressora Laserjet M404',
    tipo: 'Suporte N2',
    prioridade: 'Alta',
    status: 'Em Atendimento',
    aberturaISO: '2025-06-10T08:15:00',
    slaHoras: 24,
    prazoISO: '2025-06-11T08:15:00',
    descricao: 'Falha intermitente na conexão de rede e compartilhamento de arquivos',
    tecnico: 'Felipe Santos',
    timeline: [
      ev('t1-1', '2025-06-10T08:15:00', 'Portal do Cliente', 'Chamado aberto via portal'),
      ev(
        't1-2',
        '2025-06-10T08:20:00',
        'Sistema (fila inteligente)',
        'Prioridade alta definida: equipamento com locação ativa. Designado a Felipe Santos (N2, menor carga).',
        'designacao',
      ),
      ev(
        't1-3',
        '2025-06-10T08:40:00',
        'Felipe Santos',
        'Em atendimento. Replicando falha com o switch do 2º andar.',
        'atualizacao',
      ),
    ],
  },
  {
    id: 'ch-2',
    numero: '#CT-1041',
    cliente: 'Clínica VitalCare',
    equipamento: 'Impressora térmica Zebra',
    tipo: 'Suporte N1',
    prioridade: 'Alta',
    status: 'Aberto',
    aberturaISO: '2025-06-10T07:00:00',
    slaHoras: 4,
    prazoISO: '2025-06-10T11:00:00',
    descricao: 'Impressora térmica de etiquetas do laboratório não inicializa',
    tecnico: 'Carlos Andrade',
    timeline: [
      ev('t2-1', '2025-06-10T07:00:00', 'Recepção da Clínica', 'Chamado aberto por telefone'),
      ev(
        't2-2',
        '2025-06-10T07:05:00',
        'Sistema (classificação automática)',
        'Cliente crítico (saúde) → prioridade alta. SLA de 4h aplicado.',
        'atualizacao',
      ),
    ],
  },
  {
    id: 'ch-3',
    numero: '#CT-1040',
    cliente: 'Varejo Max',
    equipamento: 'Tablet Samsung Tab',
    tipo: 'Implementação',
    prioridade: 'Média',
    status: 'Escalonado',
    aberturaISO: '2025-06-10T04:00:00',
    slaHoras: 72,
    prazoISO: '2025-06-13T04:00:00',
    descricao: 'Configuração do novo PDV e terminal de consulta',
    tecnico: 'Rodrigo Lima',
    timeline: [
      ev('t3-1', '2025-06-10T04:00:00', 'Varejo Max', 'Chamado aberto com prazo definido: 3 dias'),
      ev(
        't3-2',
        '2025-06-10T06:30:00',
        'Rafael Mendes',
        'Escalonado ao N2: implementação requer acesso administrativo ao servidor da loja.',
        'escalonamento',
      ),
    ],
  },
  {
    id: 'ch-4',
    numero: '#CT-1039',
    cliente: 'Escola Saber',
    equipamento: '10× Notebooks Acer',
    tipo: 'Automação',
    prioridade: 'Baixa',
    status: 'Em Atendimento',
    aberturaISO: '2025-06-09T05:00:00',
    slaHoras: 120,
    prazoISO: '2025-06-14T05:00:00',
    descricao: 'Ajuste no script de backup automático das estações dos alunos',
    tecnico: 'Marina Costa',
    timeline: [
      ev('t4-1', '2025-06-09T05:00:00', 'Coordenação Escola Saber', 'Chamado aberto'),
      ev(
        't4-2',
        '2025-06-09T09:10:00',
        'Sistema (fila inteligente)',
        'Designado a Marina Costa (N2, especialidade Automação).',
        'designacao',
      ),
    ],
  },
  {
    id: 'ch-5',
    numero: '#CT-1038',
    cliente: 'LogTrans Express',
    equipamento: 'Notebook Dell Latitude 5440',
    tipo: 'Projeto de Infra',
    prioridade: 'Média',
    status: 'Aberto',
    aberturaISO: '2025-06-10T06:00:00',
    slaHoras: 168,
    prazoISO: '2025-06-17T06:00:00',
    descricao: 'Mapeamento de pontos de rede adicionais para galpão 3',
    tecnico: undefined,
    timeline: [
      ev('t5-1', '2025-06-10T06:00:00', 'LogTrans Express', 'Chamado aberto com prazo: 7 dias'),
      ev(
        't5-2',
        '2025-06-10T06:01:00',
        'Sistema (classificação automática)',
        'Projeto de infraestrutura: designação manual pelo gestor.',
        'atualizacao',
      ),
    ],
  },
  {
    id: 'ch-6',
    numero: '#CT-1037',
    cliente: 'Advocacia Andrade',
    equipamento: 'Notebook MacBook Air',
    tipo: 'Suporte N1',
    prioridade: 'Baixa',
    status: 'Resolvido',
    aberturaISO: '2025-06-08T13:00:00',
    slaHoras: 24,
    prazoISO: '2025-06-09T13:00:00',
    descricao: 'Instalação de certificado digital e drivers no MacBook',
    tecnico: 'Carlos Andrade',
    timeline: [
      ev('t6-1', '2025-06-08T13:00:00', 'Advocacia Andrade', 'Chamado aberto'),
      ev(
        't6-2',
        '2025-06-08T16:45:00',
        'Carlos Andrade',
        'Certificado instalado e drivers atualizados.',
        'resolucao',
      ),
    ],
  },
  {
    id: 'ch-7',
    numero: '#CT-1036',
    cliente: 'Varejo Max',
    equipamento: 'Tablet Samsung Tab',
    tipo: 'Suporte N1',
    prioridade: 'Baixa',
    status: 'Fechado',
    aberturaISO: '2025-06-05T10:00:00',
    slaHoras: 8,
    prazoISO: '2025-06-05T18:00:00',
    descricao: 'Tablet do caixa 2 travando ao emitir cupom',
    tecnico: 'Bruna Teixeira',
    timeline: [
      ev('t7-1', '2025-06-05T10:00:00', 'Varejo Max', 'Chamado aberto'),
      ev(
        't7-2',
        '2025-06-05T14:20:00',
        'Bruna Teixeira',
        'Cache limpo e app do caixa reinstalado.',
        'resolucao',
      ),
      ev(
        't7-3',
        '2025-06-06T09:00:00',
        'Rafael Mendes',
        'Chamado fechado após validação do cliente.',
        'fechamento',
      ),
    ],
  },
  {
    id: 'ch-8',
    numero: '#CT-1035',
    cliente: 'Varejo Max',
    equipamento: 'Tablet Samsung Tab',
    tipo: 'Suporte N1',
    prioridade: 'Baixa',
    status: 'Aberto',
    aberturaISO: '2025-06-10T05:30:00',
    slaHoras: 8,
    prazoISO: '2025-06-10T13:30:00',
    descricao: 'Tablet do caixa 2 travando novamente ao emitir cupom',
    tecnico: undefined,
    timeline: [
      ev('t8-1', '2025-06-10T05:30:00', 'Varejo Max', 'Chamado aberto'),
      ev(
        't8-2',
        '2025-06-10T05:31:00',
        'Sistema (classificação automática)',
        'Chamado repetido no mesmo equipamento em menos de 7 dias (#CT-1036) → escalonamento automático.',
        'escalonamento',
      ),
    ],
  },
]

export const USUARIO_LOGADO = {
  nome: 'Rafael Mendes',
  iniciais: 'RM',
  cargo: 'Admin / Gestor',
  empresa: 'ITLoc Gestão',
  subtitulo: 'Locações & Service Desk',
}
