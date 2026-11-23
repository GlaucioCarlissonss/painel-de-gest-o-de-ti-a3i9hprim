// Dados de demonstração para os módulos Gestão (Visão de Resultado),
// Mapa das Filiais e Financeiro (Títulos a Pagar / a Receber).
// Estruturados para fácil substituição futura por tabelas reais / API.

/* =========================================================================
   VISÃO DE RESULTADO — indicadores de gestão
   ========================================================================= */

export interface IndicadorGestao {
  id: string
  titulo: string
  valor: string
  valorSecundario: string
  percentualMesAnterior: number // variação % vs. mês anterior (positivo = melhora)
  descricaoComparativo: string
  tendencia: number[] // últimos 12 meses (micro-gráfico / sparkline)
  formato: 'tempo' | 'moeda' | 'percentual'
}

export const MOCK_INDICADORES: IndicadorGestao[] = [
  {
    id: 'ind-media-atendimento',
    titulo: 'Média de Atendimento',
    valor: '18 min',
    valorSecundario: 'tempo médio de 1ª resposta',
    percentualMesAnterior: -14.5, // negativo = respondeu mais rápido (melhora)
    descricaoComparativo: 'vs. mês anterior (21 min)',
    tendencia: [26, 24, 25, 23, 22, 24, 21, 20, 22, 19, 21, 18],
    formato: 'tempo',
  },
  {
    id: 'ind-faturamento',
    titulo: 'Faturamento do Mês',
    valor: 'R$ 184.320,00',
    valorSecundario: 'mensalidades + contratos de suporte',
    percentualMesAnterior: 8.2,
    descricaoComparativo: 'vs. mês anterior (R$ 170.350,00)',
    tendencia: [142, 148, 151, 149, 156, 158, 163, 161, 167, 172, 170, 184],
    formato: 'moeda',
  },
  {
    id: 'ind-ocupacao-frota',
    titulo: 'Ocupação da Frota',
    valor: '87,4%',
    valorSecundario: '248 de 284 equipamentos locados',
    percentualMesAnterior: 3.1,
    descricaoComparativo: 'vs. mês anterior (84,3%)',
    tendencia: [78, 79, 81, 80, 82, 81, 83, 84, 83, 85, 84, 87],
    formato: 'percentual',
  },
  {
    id: 'ind-cumprimento-sla',
    titulo: 'Cumprimento de SLA',
    valor: '96,2%',
    valorSecundario: 'chamados resolvidos dentro do prazo',
    percentualMesAnterior: 1.8,
    descricaoComparativo: 'vs. mês anterior (94,4%)',
    tendencia: [91, 92, 90, 93, 92, 94, 93, 95, 94, 95, 94, 96],
    formato: 'percentual',
  },
]

export interface ContagemPorTipo {
  tipo: string
  quantidade: number
  cor: string // classes Tailwind para a barra
}

export const MOCK_CHAMADOS_POR_TIPO: ContagemPorTipo[] = [
  { tipo: 'Suporte N1', quantidade: 128, cor: 'bg-blue-600' },
  { tipo: 'Suporte N2', quantidade: 74, cor: 'bg-indigo-600' },
  { tipo: 'Implementação', quantidade: 41, cor: 'bg-cyan-600' },
  { tipo: 'Projeto de Infra', quantidade: 23, cor: 'bg-amber-500' },
  { tipo: 'Automação', quantidade: 17, cor: 'bg-emerald-600' },
]

export const MOCK_LOCACOES_POR_EQUIPAMENTO: ContagemPorTipo[] = [
  { tipo: 'Impressora', quantidade: 96, cor: 'bg-blue-600' },
  { tipo: 'Computador', quantidade: 78, cor: 'bg-indigo-600' },
  { tipo: 'Notebook', quantidade: 54, cor: 'bg-cyan-600' },
  { tipo: 'Mobile', quantidade: 20, cor: 'bg-emerald-600' },
]

export interface EncerramentoRecente {
  id: string
  numero: string
  cliente: string
  tipo: string
  tecnico: string
  encerradoHa: string
  dentroDoSLA: boolean
}

export const MOCK_ENCERRAMENTOS: EncerramentoRecente[] = [
  {
    id: 'enc-1',
    numero: '#CT-1037',
    cliente: 'Advocacia Andrade',
    tipo: 'Suporte N1',
    tecnico: 'Carlos N1',
    encerradoHa: 'há 2 dias',
    dentroDoSLA: true,
  },
  {
    id: 'enc-2',
    numero: '#CT-1035',
    cliente: 'TechNova Sistemas',
    tipo: 'Implementação',
    tecnico: 'Rodrigo Lima',
    encerradoHa: 'há 3 dias',
    dentroDoSLA: true,
  },
  {
    id: 'enc-3',
    numero: '#CT-1033',
    cliente: 'LogTrans Express',
    tipo: 'Projeto de Infra',
    tecnico: 'Marina N2',
    encerradoHa: 'há 4 dias',
    dentroDoSLA: false,
  },
  {
    id: 'enc-4',
    numero: '#CT-1031',
    cliente: 'Varejo Max',
    tipo: 'Suporte N2',
    tecnico: 'Felipe Santos',
    encerradoHa: 'há 5 dias',
    dentroDoSLA: true,
  },
  {
    id: 'enc-5',
    numero: '#CT-1029',
    cliente: 'Clínica VitalCare',
    tipo: 'Automação',
    tecnico: 'Marina N2',
    encerradoHa: 'há 1 semana',
    dentroDoSLA: true,
  },
]

/* =========================================================================
   MAPA DAS FILIAIS — unidades com pino colorido por status
   ========================================================================= */

export type StatusFilial = 'ok' | 'risco' | 'critico'

export interface Filial {
  id: string
  nome: string
  cidade: string
  estado: string
  latitude: number
  longitude: number
  status: StatusFilial
  equipamentosLocados: number
  chamadosAbertos: number
  tecnicoResponsavel: string
  cliente: string
}

export const MOCK_FILIAIS: Filial[] = [
  {
    id: 'fil-1',
    nome: 'Matriz São Paulo — Av. Paulista',
    cidade: 'São Paulo',
    estado: 'SP',
    latitude: -23.5613,
    longitude: -46.6565,
    status: 'ok',
    equipamentosLocados: 64,
    chamadosAbertos: 2,
    tecnicoResponsavel: 'Felipe Santos',
    cliente: 'TechNova Sistemas',
  },
  {
    id: 'fil-2',
    nome: 'Filial Campinas — Techno Park',
    cidade: 'Campinas',
    estado: 'SP',
    latitude: -22.9071,
    longitude: -47.0626,
    status: 'ok',
    equipamentosLocados: 38,
    chamadosAbertos: 1,
    tecnicoResponsavel: 'Marina N2',
    cliente: 'TechNova Sistemas',
  },
  {
    id: 'fil-3',
    nome: 'Clínica VitalCare — Unidade Centro',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    latitude: -19.9167,
    longitude: -43.9345,
    status: 'critico',
    equipamentosLocados: 21,
    chamadosAbertos: 4,
    tecnicoResponsavel: 'Carlos N1',
    cliente: 'Clínica VitalCare',
  },
  {
    id: 'fil-4',
    nome: 'Centro de Distribuição LogTrans',
    cidade: 'Guarulhos',
    estado: 'SP',
    latitude: -23.4543,
    longitude: -46.5337,
    status: 'risco',
    equipamentosLocados: 45,
    chamadosAbertos: 3,
    tecnicoResponsavel: 'Rodrigo Lima',
    cliente: 'LogTrans Express',
  },
  {
    id: 'fil-5',
    nome: 'Escola Saber — Unidade Jardins',
    cidade: 'Curitiba',
    estado: 'PR',
    latitude: -25.4284,
    longitude: -49.2733,
    status: 'ok',
    equipamentosLocados: 32,
    chamadosAbertos: 1,
    tecnicoResponsavel: 'Marina N2',
    cliente: 'Escola Saber',
  },
  {
    id: 'fil-6',
    nome: 'Loja Varejo Max — Shopping Barra',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    latitude: -22.9068,
    longitude: -43.1729,
    status: 'risco',
    equipamentosLocados: 18,
    chamadosAbertos: 2,
    tecnicoResponsavel: 'Aguardando atribuição',
    cliente: 'Varejo Max',
  },
  {
    id: 'fil-7',
    nome: 'Construtora Alfa — Canteiro Obras',
    cidade: 'Salvador',
    estado: 'BA',
    latitude: -12.9777,
    longitude: -38.5016,
    status: 'ok',
    equipamentosLocados: 12,
    chamadosAbertos: 0,
    tecnicoResponsavel: '—',
    cliente: 'Construtora Alfa',
  },
  {
    id: 'fil-8',
    nome: 'Advocacia Andrade — Escritório Principal',
    cidade: 'Porto Alegre',
    estado: 'RS',
    latitude: -30.0346,
    longitude: -51.2177,
    status: 'ok',
    equipamentosLocados: 6,
    chamadosAbertos: 0,
    tecnicoResponsavel: 'Carlos N1',
    cliente: 'Advocacia Andrade',
  },
  {
    id: 'fil-9',
    nome: 'Indústria MetalTech — Planta 2',
    cidade: 'Joinville',
    estado: 'SC',
    latitude: -26.3044,
    longitude: -48.8456,
    status: 'critico',
    equipamentosLocados: 27,
    chamadosAbertos: 5,
    tecnicoResponsavel: 'Felipe Santos',
    cliente: 'MetalTech Indústria',
  },
  {
    id: 'fil-10',
    nome: 'Agro Pecuária Forte — Sede',
    cidade: 'Goiânia',
    estado: 'GO',
    latitude: -16.6869,
    longitude: -49.2648,
    status: 'ok',
    equipamentosLocados: 9,
    chamadosAbertos: 1,
    tecnicoResponsavel: 'Rodrigo Lima',
    cliente: 'Agro Forte',
  },
  {
    id: 'fil-11',
    nome: 'Rede Farmácias BemViver — CD Norte',
    cidade: 'Recife',
    estado: 'PE',
    latitude: -8.0476,
    longitude: -34.877,
    status: 'risco',
    equipamentosLocados: 23,
    chamadosAbertos: 3,
    tecnicoResponsavel: 'Marina N2',
    cliente: 'Farmácias BemViver',
  },
  {
    id: 'fil-12',
    nome: 'Hotel Costa Atlântica — Recepção',
    cidade: 'Fortaleza',
    estado: 'CE',
    latitude: -3.7319,
    longitude: -38.5267,
    status: 'ok',
    equipamentosLocados: 14,
    chamadosAbertos: 1,
    tecnicoResponsavel: 'Carlos N1',
    cliente: 'Costa Atlântica Hoteis',
  },
]

/* =========================================================================
   FINANCEIRO — Títulos a Pagar e Títulos a Receber
   ========================================================================= */

export type StatusTitulo = 'Pago' | 'Pendente' | 'Vencido'

export interface TituloPagar {
  id: string
  fornecedor: string
  descricao: string
  categoria: string
  valor: number // em BRL
  vencimento: string // dd/mm/aaaa
  status: StatusTitulo
  locacaoVinculada?: string // nº da locação / contrato quando aplicável
}

export interface TituloReceber {
  id: string
  cliente: string
  descricao: string
  categoria: string
  valor: number // em BRL
  vencimento: string // dd/mm/aaaa
  status: StatusTitulo
  locacaoVinculada?: string
  chamadoVinculado?: string // nº do chamado de suporte/projeto quando aplicável
}

export const MOCK_TITULOS_PAGAR: TituloPagar[] = [
  {
    id: 'pg-1',
    fornecedor: 'ImprimeStore Suprimentos',
    descricao: 'Insumos de impressão (toner e cilindros) para frota terceirizada',
    categoria: 'Insumos de impressora',
    valor: 7480.0,
    vencimento: '10/06/2025',
    status: 'Pendente',
    locacaoVinculada: 'LOC-0007',
  },
  {
    id: 'pg-2',
    fornecedor: 'TransTec Logística',
    descricao: 'Frete e instalação de 12 impressoras no CD Guarulhos',
    categoria: 'Logística e instalação',
    valor: 3250.0,
    vencimento: '05/06/2025',
    status: 'Vencido',
    locacaoVinculada: 'LOC-0012',
  },
  {
    id: 'pg-3',
    fornecedor: 'ManutenPro Assistência Técnica',
    descricao: 'Contrato mensal de manutenção corretiva da frota',
    categoria: 'Manutenção',
    valor: 5900.0,
    vencimento: '15/06/2025',
    status: 'Pendente',
  },
  {
    id: 'pg-4',
    fornecedor: 'Imobiliária Paulista Prime',
    descricao: 'Aluguel do depósito/logística de frota',
    categoria: 'Aluguel de galpão',
    valor: 12800.0,
    vencimento: '01/06/2025',
    status: 'Pago',
  },
  {
    id: 'pg-5',
    fornecedor: 'AlfaPeças Componentes',
    descricao: 'Compra de peças para revisão de notebooks Acer (lote Escola Saber)',
    categoria: 'Peças de reposição',
    valor: 4370.0,
    vencimento: '12/06/2025',
    status: 'Pendente',
    locacaoVinculada: 'LOC-0004',
  },
  {
    id: 'pg-6',
    fornecedor: 'NetLink Telecom',
    descricao: 'Link dedicado de internet da matriz',
    categoria: 'Infraestrutura',
    valor: 2150.0,
    vencimento: '03/06/2025',
    status: 'Vencido',
  },
  {
    id: 'pg-7',
    fornecedor: 'SoftLic Licenças',
    descricao: 'Licenças antivírus corporativo (248 estações)',
    categoria: 'Software e licenças',
    valor: 6200.0,
    vencimento: '20/06/2025',
    status: 'Pendente',
  },
  {
    id: 'pg-8',
    fornecedor: 'TransporteSul Fretes',
    descricao: 'Transporte de 8 tablets para a loja Varejo Max (RJ)',
    categoria: 'Logística e instalação',
    valor: 1180.0,
    vencimento: '28/05/2025',
    status: 'Pago',
    locacaoVinculada: 'LOC-0007',
  },
]

export const MOCK_TITULOS_RECEBER: TituloReceber[] = [
  {
    id: 'rc-1',
    cliente: 'TechNova Sistemas',
    descricao: 'Mensalidade de locação de frota (junho/2025)',
    categoria: 'Mensalidade de locação',
    valor: 18400.0,
    vencimento: '10/06/2025',
    status: 'Pendente',
    locacaoVinculada: 'LOC-0001',
  },
  {
    id: 'rc-2',
    cliente: 'Escola Saber',
    descricao: 'Mensalidade do contrato de 10 notebooks Acer',
    categoria: 'Mensalidade de locação',
    valor: 3800.0,
    vencimento: '05/06/2025',
    status: 'Vencido',
    locacaoVinculada: 'LOC-0004',
  },
  {
    id: 'rc-3',
    cliente: 'Clínica VitalCare',
    descricao: 'Contrato de suporte técnico dedicado (SLA 4h)',
    categoria: 'Contrato de suporte',
    valor: 5600.0,
    vencimento: '15/06/2025',
    status: 'Pendente',
    chamadoVinculado: '#CT-1041',
  },
  {
    id: 'rc-4',
    cliente: 'LogTrans Express',
    descricao: 'Mensalidade de locação de impressoras térmicas + suporte',
    categoria: 'Mensalidade de locação',
    valor: 3120.0,
    vencimento: '08/06/2025',
    status: 'Pendente',
    locacaoVinculada: 'LOC-0005',
  },
  {
    id: 'rc-5',
    cliente: 'Varejo Max',
    descricao: 'Locação de tablets PDV (junho/2025)',
    categoria: 'Mensalidade de locação',
    valor: 1980.0,
    vencimento: '12/06/2025',
    status: 'Pendente',
    locacaoVinculada: 'LOC-0007',
  },
  {
    id: 'rc-6',
    cliente: 'Advocacia Andrade',
    descricao: 'Locação de MacBook Air + certificado digital',
    categoria: 'Mensalidade de locação',
    valor: 990.0,
    vencimento: '20/05/2025',
    status: 'Vencido',
    locacaoVinculada: 'LOC-0006',
  },
  {
    id: 'rc-7',
    cliente: 'MetalTech Indústria',
    descricao: 'Projeto de infraestrutura de rede — 2ª parcela',
    categoria: 'Projeto de infra',
    valor: 14500.0,
    vencimento: '25/06/2025',
    status: 'Pendente',
    chamadoVinculado: '#CT-1033',
  },
  {
    id: 'rc-8',
    cliente: 'Agro Forte',
    descricao: 'Contrato de suporte remoto N1/N2 (junho/2025)',
    categoria: 'Contrato de suporte',
    valor: 2400.0,
    vencimento: '01/06/2025',
    status: 'Pago',
  },
  {
    id: 'rc-9',
    cliente: 'Construtora Alfa',
    descricao: 'Locação de desktops para canteiro (maio/2025)',
    categoria: 'Mensalidade de locação',
    valor: 2750.0,
    vencimento: '30/05/2025',
    status: 'Pago',
    locacaoVinculada: 'LOC-0003',
  },
]

/* =========================================================================
   FLUXO DE CAIXA DO MÊS — entradas vs. saídas por semana
   ========================================================================= */

export interface FluxoCaixaSemana {
  semana: string // rótulo curto, ex.: "Sem 1"
  periodo: string
  entradas: number
  saidas: number
}

export const MOCK_FLUXO_CAIXA: FluxoCaixaSemana[] = [
  { semana: 'Sem 1', periodo: '01–07/06', entradas: 64500, saidas: 32100 },
  { semana: 'Sem 2', periodo: '08–14/06', entradas: 41800, saidas: 28400 },
  { semana: 'Sem 3', periodo: '15–21/06', entradas: 38200, saidas: 19650 },
  { semana: 'Sem 4', periodo: '22–30/06', entradas: 49820, saidas: 26300 },
]
