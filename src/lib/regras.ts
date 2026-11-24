// Regras de negócio da Onda 2: matriz de SLA, classificação automática de
// prioridade, fila inteligente (prioridade > tempo de espera > SLA mais curto)
// e designação automática de técnicos. Puras — testáveis sem React.
import {
  Chamado,
  Cliente,
  HOJE_MOCK,
  PrioridadeChamado,
  StatusSLA,
  Tecnico,
  TipoChamado,
} from '@/data/mockData'

/* ---------------- Matriz de SLA (Fase 6) ----------------
   Suporte N1 → 4h alta, 8h média, 24h baixa
   Suporte N2 → 8h alta, 24h média, 48h baixa
   Implementação / Projetos → prazo manual na abertura            */
export const MATRIZ_SLA: Record<'Suporte N1' | 'Suporte N2', Record<PrioridadeChamado, number>> = {
  'Suporte N1': { Alta: 4, Média: 8, Baixa: 24 },
  'Suporte N2': { Alta: 8, Média: 24, Baixa: 48 },
}

export const TIPOS_PROJETO: TipoChamado[] = [
  'Implementação',
  'Projeto de Infra',
  'Dados',
  'Automação',
]

export const isTipoProjeto = (t: TipoChamado) => TIPOS_PROJETO.includes(t)

export const ROTULO_TIPO: Record<TipoChamado, string> = {
  'Suporte N1': 'Suporte N1',
  'Suporte N2': 'Suporte N2',
  Implementação: 'Implementação',
  'Projeto de Infra': 'Projeto de Infra',
  Dados: 'Dados',
  Automação: 'Automação',
}

export const ROTULO_SLA: Record<StatusSLA, string> = {
  dentro: 'Dentro do prazo',
  proximo: 'Próximo do vencimento',
  vencido: 'SLA vencido',
}

/** Prazo manual (em horas) para projetos/implementações. */
export const PRAZOS_PROJETO_HORAS = [24, 48, 72, 120, 168, 240] as const

/* ---------------- Estado de SLA de um chamado ---------------- */
export function slaStatusDe(
  chamado: Pick<Chamado, 'prazoISO' | 'status' | 'slaHoras'>,
  agora: Date = HOJE_MOCK,
): StatusSLA {
  if (chamado.status === 'Resolvido' || chamado.status === 'Fechado') return 'dentro'
  const restante = new Date(chamado.prazoISO).getTime() - agora.getTime()
  if (restante <= 0) return 'vencido'
  // "próximo" = menos de 20% do SLA restante (mínimo 2h de janela)
  const janela = Math.max(chamado.slaHoras * 0.2, 2) * 3600_000
  if (restante <= janela) return 'proximo'
  return 'dentro'
}

export function textoRestanteSLA(
  chamado: Pick<Chamado, 'prazoISO' | 'status'>,
  agora: Date = HOJE_MOCK,
): string {
  if (chamado.status === 'Resolvido' || chamado.status === 'Fechado') return 'Resolvido no prazo'
  const restante = new Date(chamado.prazoISO).getTime() - agora.getTime()
  if (restante <= 0) {
    const horas = Math.floor(-restante / 3600_000)
    return horas >= 24 ? `vencido há ${Math.floor(horas / 24)}d` : `vencido há ${horas}h`
  }
  const horas = Math.floor(restante / 3600_000)
  if (horas >= 24) return `restam ${Math.floor(horas / 24)}d ${horas % 24}h`
  if (horas >= 1) return `restam ${horas}h`
  return `restam ${Math.max(1, Math.floor(restante / 60_000))}min`
}

/** Tempo de espera ("há 2h", "há 3 dias") a partir da abertura. */
export function tempoEspera(aberturaISO: string, agora: Date = HOJE_MOCK): string {
  const min = Math.max(0, Math.floor((agora.getTime() - new Date(aberturaISO).getTime()) / 60_000))
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  const dias = Math.floor(h / 24)
  return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
}

/* ---------------- Classificação automática (Fase 6) ---------------- */
export interface EntradaChamado {
  clienteNome: string
  tipo: TipoChamado
  descricao: string
  equipamento?: string
  /** Prazo manual em horas (obrigatório para projetos/implementações). */
  prazoHoras?: number
}

export interface ResultadoClassificacao {
  prioridade: PrioridadeChamado
  slaHoras: number
  motivos: string[] // regras disparadas, para a timeline
  escalonar: boolean // chamado repetido <7 dias → escalona automático
}

export function classificarChamado(
  entrada: EntradaChamado,
  contexto: {
    clientes: Cliente[]
    locacoes: { cliente: string; status: string; equipamento: string }[]
    chamadosExistentes: Pick<Chamado, 'equipamento' | 'aberturaISO' | 'numero' | 'status'>[]
    agora?: Date
  },
): ResultadoClassificacao {
  const agora = contexto.agora ?? HOJE_MOCK
  const motivos: string[] = []
  const cliente = contexto.clientes.find((c) => c.nome === entrada.clienteNome)
  const projeto = isTipoProjeto(entrada.tipo)

  let prioridade: PrioridadeChamado = projeto ? 'Baixa' : 'Média'
  if (projeto && (entrada.tipo === 'Projeto de Infra' || entrada.tipo === 'Dados')) {
    prioridade = 'Média'
    motivos.push(`Solicitação de ${entrada.tipo.toLowerCase()}: prioridade média por tipo.`)
  } else if (projeto) {
    motivos.push('Solicitação de projeto: prioridade baixa por tipo.')
  }

  // Cliente crítico (saúde ou enterprise) → alta
  if (cliente?.critico) {
    prioridade = 'Alta'
    motivos.push(
      `Cliente crítico (${cliente.segmento}${cliente.contrato === 'enterprise' ? ' · contrato enterprise' : ''}) → prioridade alta.`,
    )
  }

  // Falha em equipamento com locação ativa → alta
  const locacaoAtiva =
    entrada.equipamento &&
    contexto.locacoes.some(
      (l) =>
        l.cliente === entrada.clienteNome &&
        l.equipamento === entrada.equipamento &&
        l.status !== 'Encerrado',
    )
  if (entrada.equipamento && locacaoAtiva) {
    prioridade = 'Alta'
    motivos.push('Falha em equipamento com locação ativa → prioridade alta.')
  }

  // SLA pela matriz (projetos: prazo manual)
  let slaHoras: number
  if (projeto) {
    slaHoras = entrada.prazoHoras ?? 168
    motivos.push(`Prazo manual definido na abertura: ${slaHoras}h.`)
  } else {
    slaHoras = MATRIZ_SLA[entrada.tipo as 'Suporte N1' | 'Suporte N2'][prioridade]
    motivos.push(`Matriz de SLA ${entrada.tipo} · prioridade ${prioridade} → ${slaHoras}h.`)
  }

  // Chamado repetido no mesmo equipamento em menos de 7 dias → escalona
  const seteDias = 7 * 24 * 3600_000
  const repetido = entrada.equipamento
    ? contexto.chamadosExistentes.find(
        (c) =>
          c.equipamento === entrada.equipamento &&
          c.status !== 'Fechado' &&
          agora.getTime() - new Date(c.aberturaISO).getTime() < seteDias,
      )
    : undefined
  const escalonar = Boolean(repetido)
  if (repetido) {
    motivos.push(
      `Chamado repetido no mesmo equipamento em menos de 7 dias (${repetido.numero}) → escalonamento automático.`,
    )
  }

  return { prioridade, slaHoras, motivos, escalonar }
}

/* ---------------- Fila inteligente (Fase 7) ---------------- */
const PESO_PRIORIDADE: Record<PrioridadeChamado, number> = { Alta: 3, Média: 2, Baixa: 1 }

/**
 * Ordenação da fila: prioridade (desc) > tempo de espera (desc) > SLA mais
 * curto (asc). Devolve os chamados ainda não resolvidos/fechados.
 */
export function ordenarFila(
  chamados: Chamado[],
  agora: Date = HOJE_MOCK,
): { chamado: Chamado; esperaMs: number }[] {
  return chamados
    .filter(
      (c) => c.status === 'Aberto' || c.status === 'Escalonado' || c.status === 'Em Atendimento',
    )
    .map((c) => ({
      chamado: c,
      esperaMs: agora.getTime() - new Date(c.aberturaISO).getTime(),
    }))
    .sort((a, b) => {
      const p = PESO_PRIORIDADE[b.chamado.prioridade] - PESO_PRIORIDADE[a.chamado.prioridade]
      if (p !== 0) return p
      if (b.esperaMs !== a.esperaMs) return b.esperaMs - a.esperaMs
      return a.chamado.slaHoras - b.chamado.slaHoras
    })
}

/**
 * Designação automática:
 *  - N1 → primeiro técnico N1 disponível (menor carga como desempate);
 *  - N2 → técnico N2 com menor carga ou especialidade alinhada;
 *  - projeto (infra/dados/automação/implementação) → null (designação manual).
 */
export function designarAutomatico(
  tipo: TipoChamado,
  tecnicos: Tecnico[],
  chamadosAtivos: Chamado[],
): Tecnico | null {
  if (isTipoProjeto(tipo)) return null
  const nivel: 'N1' | 'N2' = tipo === 'Suporte N1' ? 'N1' : 'N2'
  const carga = (tec: Tecnico) => chamadosAtivos.filter((c) => c.tecnico === tec.nome).length

  const candidatos = tecnicos.filter((t) => t.nivel === nivel)
  const comEspecialidade = candidatos.filter((t) => t.especialidades.includes(tipo))
  const alvo = comEspecialidade.length > 0 ? comEspecialidade : candidatos

  const disponiveis = alvo.filter((t) => t.disponivel)
  const pool = disponiveis.length > 0 ? disponiveis : alvo
  if (pool.length === 0) return null
  return [...pool].sort((a, b) => carga(a) - carga(b))[0]
}

/* ---------------- Carga de trabalho por atendente ---------------- */
export interface CargaTecnico {
  tecnico: Tecnico
  ativos: number
  minutosTotais: number
  tempoMedio: string
}

export function cargaPorTecnico(
  tecnicos: Tecnico[],
  chamados: Chamado[],
  agora: Date = HOJE_MOCK,
): CargaTecnico[] {
  const ativos = chamados.filter((c) => c.status !== 'Resolvido' && c.status !== 'Fechado')
  return tecnicos.map((t) => {
    const meus = ativos.filter((c) => c.tecnico === t.nome)
    const minutosTotais = meus.reduce(
      (acc, c) => acc + Math.max(0, agora.getTime() - new Date(c.aberturaISO).getTime()) / 60_000,
      0,
    )
    const media = meus.length > 0 ? minutosTotais / meus.length : 0
    const h = Math.floor(media / 60)
    return {
      tecnico: t,
      ativos: meus.length,
      minutosTotais: Math.round(minutosTotais),
      tempoMedio: meus.length === 0 ? '—' : h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : `${h}h`,
    }
  })
}

/* ---------------- Utilidades de locação (Onda 2.4) ---------------- */
const MS_DIA = 24 * 3600_000

/** Converte "dd/mm/aaaa" em Date local. */
export function parseDataBR(dataBR: string): Date {
  const [d, m, a] = dataBR.split('/').map(Number)
  return new Date(a, m - 1, d)
}

export function formatarDataBR(data: Date): string {
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export interface AlertaLocacao {
  tipo: 'vencendo' | 'vencida'
  diasRestantes: number
}

/** Locações ativas vencendo em até 7 dias (ou já vencidas) — alerta do dashboard. */
export function alertasLocacao<
  T extends { id: string; cliente: string; dataFim: string; status: string },
>(locacoes: T[], agora: Date = HOJE_MOCK): { diasRestantes: number; total: number; locacoes: T[] } {
  const alvo: T[] = []
  let maisCritico = Infinity
  for (const l of locacoes) {
    if (l.status === 'Encerrado') continue
    const dias = Math.round((parseDataBR(l.dataFim).getTime() - agora.getTime()) / MS_DIA)
    if (dias <= 7) {
      alvo.push(l)
      maisCritico = Math.min(maisCritico, dias)
    }
  }
  return {
    diasRestantes: maisCritico === Infinity ? 0 : maisCritico,
    total: alvo.length,
    locacoes: alvo,
  }
}

export function proximoNumeroChamado(chamados: Pick<Chamado, 'numero'>[]): string {
  const maior = chamados.reduce((acc, c) => {
    const n = parseInt(c.numero.replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? Math.max(acc, n) : acc
  }, 1000)
  return `#CT-${maior + 1}`
}
