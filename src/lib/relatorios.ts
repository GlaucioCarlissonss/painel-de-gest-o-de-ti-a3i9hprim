// Cálculos dos relatórios da Fase 9 (Relatórios e Painéis de Gestão):
// MTTR por tipo/técnico, % de chamados resolvidos dentro do prazo,
// ocupação/churn de equipamentos e financeiro de locações por período/cliente.
// Fonte: chamados ativos (AppDataContext) + histórico encerrado (mock).
import { Chamado, Locacao, HOJE_MOCK, fmtBRL } from '@/data/mockData'
import { parseDataBR } from '@/lib/regras'

const MS_DIA = 86_400_000

/* ---------- Helpers de datas ---------- */
export type Periodo = '30d' | '90d' | 'tudo'

const INICIO_CURSO: Record<Periodo, Date> = {
  '30d': new Date(HOJE_MOCK.getTime() - 30 * MS_DIA),
  '90d': new Date(HOJE_MOCK.getTime() - 90 * MS_DIA),
  tudo: new Date('2020-01-01T00:00:00'),
}

export const dentroDoPeriodo = (iso: string, periodo: Periodo) =>
  new Date(iso) >= INICIO_CURSO[periodo]

/** Data de resolução de um chamado: último evento 'resolucao' (ou fechamento). */
export const dataResolucao = (c: Chamado): Date => {
  const evRes = [...c.timeline]
    .reverse()
    .find((t) => t.tipo === 'resolucao' || t.tipo === 'fechamento')
  return evRes ? new Date(evRes.dataHora) : new Date(c.prazoISO)
}

export const horasEntre = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 3_600_000

/* ---------- MTTR ---------- */
export interface LinhaMTTR {
  rotulo: string
  qtd: number
  mttrHoras: number
  mttrTexto: string
  menor: number
  maior: number
}

const fmtHoras = (h: number) =>
  h < 24 ? `${h.toFixed(1).replace('.', ',')}h` : `${Math.round(h / 24)}d ${Math.round(h % 24)}h`

export function mttrPorTipo(chamados: Chamado[]): LinhaMTTR[] {
  const grupos = new Map<string, Chamado[]>()
  for (const c of chamados) {
    if (!grupos.has(c.tipo)) grupos.set(c.tipo, [])
    grupos.get(c.tipo)!.push(c)
  }
  return [...grupos.entries()]
    .map(([tipo, lista]) => {
      const horas = lista.map((c) => horasEntre(new Date(c.aberturaISO), dataResolucao(c)))
      const mttr = horas.reduce((s, h) => s + h, 0) / horas.length
      return {
        rotulo: tipo,
        qtd: lista.length,
        mttrHoras: mttr,
        mttrTexto: fmtHoras(mttr),
        menor: Math.min(...horas),
        maior: Math.max(...horas),
      }
    })
    .sort((a, b) => b.mttrHoras - a.mttrHoras)
}

export function mttrPorTecnico(chamados: Chamado[]): LinhaMTTR[] {
  const grupos = new Map<string, Chamado[]>()
  for (const c of chamados) {
    if (!c.tecnico) continue
    if (!grupos.has(c.tecnico)) grupos.set(c.tecnico, [])
    grupos.get(c.tecnico)!.push(c)
  }
  return [...grupos.entries()]
    .map(([tecnico, lista]) => {
      const horas = lista.map((c) => horasEntre(new Date(c.aberturaISO), dataResolucao(c)))
      const mttr = horas.reduce((s, h) => s + h, 0) / horas.length
      return {
        rotulo: tecnico,
        qtd: lista.length,
        mttrHoras: mttr,
        mttrTexto: fmtHoras(mttr),
        menor: Math.min(...horas),
        maior: Math.max(...horas),
      }
    })
    .sort((a, b) => a.mttrHoras - b.mttrHoras)
}

/* ---------- Satisfação de SLA ---------- */
export interface LinhaSla {
  rotulo: string
  resolvidos: number
  noPrazo: number
  percentual: number
}

const resolvidoNoPrazo = (c: Chamado) => dataResolucao(c) <= new Date(c.prazoISO)

export function satisfacaoSla(chamados: Chamado[], por: 'cliente' | 'tipo'): LinhaSla[] {
  const grupos = new Map<string, Chamado[]>()
  for (const c of chamados) {
    const chave = por === 'cliente' ? c.cliente : c.tipo
    if (!grupos.has(chave)) grupos.set(chave, [])
    grupos.get(chave)!.push(c)
  }
  return [...grupos.entries()]
    .map(([rotulo, lista]) => {
      const noPrazo = lista.filter(resolvidoNoPrazo).length
      return {
        rotulo,
        resolvidos: lista.length,
        noPrazo,
        percentual: Math.round((noPrazo / lista.length) * 100),
      }
    })
    .sort((a, b) => b.percentual - a.percentual || b.resolvidos - a.resolvidos)
}

/* ---------- Ocupação de equipamentos ---------- */
export interface LinhaOcupacao {
  cliente: string
  total: number
  ativos: number
  ocupacao: number // % de locações ativas
  encerrados: number
  churn: number // % de locações encerradas que não foram renovadas
}

export function ocupacaoEquipamentos(locacoes: Locacao[], chamados: Chamado[]): LinhaOcupacao[] {
  const clientes = [...new Set(locacoes.map((l) => l.cliente))]
  return clientes
    .map((cliente) => {
      const doCliente = locacoes.filter((l) => l.cliente === cliente)
      const ativos = doCliente.filter((l) => l.status !== 'Encerrado').length
      const encerrados = doCliente.length - ativos
      // Churn: cliente sem nenhuma locação ativa (100%) ou taxa proporcional de contratos findados
      const chamadosAbertos = chamados.filter(
        (c) => c.cliente === cliente && c.status !== 'Fechado',
      )
      const semAtividade = ativos === 0
      const churn = semAtividade ? 100 : Math.round((encerrados / doCliente.length) * 100)
      return {
        cliente,
        total: doCliente.length,
        ativos,
        ocupacao: doCliente.length ? Math.round((ativos / doCliente.length) * 100) : 0,
        encerrados,
        churn,
        chamadosAbertos: chamadosAbertos.length,
      }
    })
    .sort((a, b) => b.ocupacao - a.ocupacao || b.total - a.total)
}

/* ---------- Financeiro de locações ---------- */
export interface LinhaFinanceira {
  cliente: string
  contratos: number
  totalPeriodo: number
  textoTotal: string
  detalhePeriodo: string
}

export function financeiroLocacoes(locacoes: Locacao[], periodo: Periodo): LinhaFinanceira[] {
  const fim = HOJE_MOCK
  const inicio = INICIO_CURSO[periodo]
  return [...new Set(locacoes.map((l) => l.cliente))]
    .map((cliente) => {
      const doCliente = locacoes.filter((l) => l.cliente === cliente)
      let total = 0
      let contratos = 0
      for (const l of doCliente) {
        const ini = parseDataBR(l.dataInicio)
        const fimL = l.status === 'Encerrado' ? parseDataBR(l.dataFim) : fim
        // meses do contrato dentro do período filtrado
        const iniCorte = ini < inicio ? inicio : ini
        const fimCorte = fimL > fim ? fim : fimL
        const meses = Math.max(
          0,
          Math.round((fimCorte.getTime() - iniCorte.getTime()) / (30 * MS_DIA)),
        )
        if (meses > 0) {
          total += meses * l.valorMensal
          contratos += 1
        }
      }
      return {
        cliente,
        contratos,
        totalPeriodo: total,
        textoTotal: fmtBRL(total),
        detalhePeriodo: `${contratos} contrato(s) faturado(s) no período`,
      }
    })
    .filter((l) => l.contratos > 0)
    .sort((a, b) => b.totalPeriodo - a.totalPeriodo)
}

/* ---------- CSV ---------- */
export function baixarCSV(nomeArquivo: string, cabecalho: string[], linhas: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v)
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const conteudo = [cabecalho.map(esc).join(';'), ...linhas.map((l) => l.map(esc).join(';'))].join(
    '\n',
  )
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  a.click()
  URL.revokeObjectURL(url)
}
