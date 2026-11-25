// Relatórios e Painéis de Gestão (Fase 9): MTTR, satisfação de SLA,
// ocupação de equipamentos e financeiro de locações, com filtros de
// período/cliente/tipo/técnico e exportação CSV real (Blob + download).
import { useMemo, useState } from 'react'
import { Download, FileBarChart, Database, Users, Monitor, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppData } from '@/state/AppDataContext'
import { CHAMADOS_HISTORICOS } from '@/data/historicoChamados'
import { HOJE_MOCK, TipoChamado, fmtBRL } from '@/data/mockData'
import {
  LinhaFinanceira,
  LinhaMTTR,
  LinhaOcupacao,
  LinhaSla,
  Periodo,
  baixarCSV,
  dataResolucao,
  financeiroLocacoes,
  mttrPorTecnico,
  mttrPorTipo,
  ocupacaoEquipamentos,
  satisfacaoSla,
  dentroDoPeriodo,
} from '@/lib/relatorios'

const ROTULO_PERIODO: Record<Periodo, string> = {
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  tudo: 'Todo o período',
}

type Aba = 'mttr' | 'sla' | 'ocupacao' | 'financeiro'

export default function Relatorios() {
  const { chamados, locacoes, clientes, tecnicos } = useAppData()
  const [periodo, setPeriodo] = useState<Periodo>('90d')
  const [cliente, setCliente] = useState<string>('todos')
  const [tipo, setTipo] = useState<string>('todos')
  const [tecnico, setTecnico] = useState<string>('todos')
  const [aba, setAba] = useState<Aba>('mttr')

  // Conjunto base: ativos da sessão + histórico encerrado (dados de demonstração)
  const todosChamados = useMemo(() => {
    const base = [...chamados, ...CHAMADOS_HISTORICOS]
    return base.filter((c) => {
      if (cliente !== 'todos' && c.cliente !== cliente) return false
      if (tipo !== 'todos' && c.tipo !== (tipo as TipoChamado)) return false
      if (tecnico !== 'todos' && c.tecnico !== tecnico) return false
      return dentroDoPeriodo(c.aberturaISO, periodo)
    })
  }, [chamados, cliente, tipo, tecnico, periodo])

  const locacoesFiltradas = useMemo(
    () => locacoes.filter((l) => cliente === 'todos' || l.cliente === cliente),
    [locacoes, cliente],
  )

  const temFiltro = cliente !== 'todos' || tipo !== 'todos' || tecnico !== 'todos'

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Relatórios e Painéis de Gestão
            <FileBarChart className="w-6 h-6 text-blue-600" aria-hidden />
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            MTTR, satisfação de SLA, ocupação de equipamentos e financeiro de locações · base de{' '}
            {HOJE_MOCK.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
          <Database className="w-3.5 h-3.5" /> Dados de demonstração
        </span>
      </header>

      {/* Filtros */}
      <section
        aria-label="Filtros dos relatórios"
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className="space-y-1.5">
          <Label htmlFor="filtro-periodo">Período</Label>
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
            <SelectTrigger id="filtro-periodo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ROTULO_PERIODO) as Periodo[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {ROTULO_PERIODO[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filtro-cliente">Cliente</Label>
          <Select value={cliente} onValueChange={setCliente}>
            <SelectTrigger id="filtro-cliente">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os clientes</SelectItem>
              {clientes.map((c) => (
                <SelectItem key={c.nome} value={c.nome}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filtro-tipo">Tipo de chamado</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger id="filtro-tipo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {[
                'Suporte N1',
                'Suporte N2',
                'Implementação',
                'Projeto de Infra',
                'Dados',
                'Automação',
              ].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filtro-tecnico">Técnico</Label>
          <Select value={tecnico} onValueChange={setTecnico}>
            <SelectTrigger id="filtro-tecnico">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os técnicos</SelectItem>
              {tecnicos.map((t) => (
                <SelectItem key={t.id} value={t.nome}>
                  {t.nome} ({t.nivel})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {temFiltro && (
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-2 text-xs text-slate-500">
            Filtros ativos — {todosChamados.length} chamado(s) e {locacoesFiltradas.length}{' '}
            locação(ões) na amostra.
            <button
              type="button"
              className="font-semibold text-blue-600 hover:underline"
              onClick={() => {
                setCliente('todos')
                setTipo('todos')
                setTecnico('todos')
                setPeriodo('90d')
              }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </section>

      {/* Abas */}
      <div role="tablist" aria-label="Seções do relatório" className="flex flex-wrap gap-2">
        {(
          [
            ['mttr', 'MTTR'],
            ['sla', 'Satisfação de SLA'],
            ['ocupacao', 'Ocupação de equipamentos'],
            ['financeiro', 'Financeiro de locações'],
          ] as [Aba, string][]
        ).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={aba === id}
            onClick={() => setAba(id)}
            className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg border transition-colors ${
              aba === id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aba === 'mttr' && (
        <SecaoMTTR
          porTipo={mttrPorTipo(todosChamados)}
          porTecnico={mttrPorTecnico(todosChamados)}
          onExportar={() => {
            baixarCSV(
              'mttr.csv',
              ['Métrica', 'Rótulo', 'Chamados resolvidos', 'MTTR (h)'],
              [
                ...mttrPorTipo(todosChamados).map((l) => [
                  'Por tipo',
                  l.rotulo,
                  l.qtd,
                  l.mttrHoras.toFixed(1),
                ]),
                ...mttrPorTecnico(todosChamados).map((l) => [
                  'Por técnico',
                  l.rotulo,
                  l.qtd,
                  l.mttrHoras.toFixed(1),
                ]),
              ],
            )
          }}
        />
      )}
      {aba === 'sla' && (
        <SecaoSla
          porCliente={satisfacaoSla(todosChamados, 'cliente')}
          porTipo={satisfacaoSla(todosChamados, 'tipo')}
          onExportar={() => {
            baixarCSV(
              'satisfacao-sla.csv',
              ['Métrica', 'Rótulo', 'Resolvidos', 'No prazo', '% no prazo'],
              [
                ...satisfacaoSla(todosChamados, 'cliente').map((l) => [
                  'Por cliente',
                  l.rotulo,
                  l.resolvidos,
                  l.noPrazo,
                  `${l.percentual}%`,
                ]),
                ...satisfacaoSla(todosChamados, 'tipo').map((l) => [
                  'Por tipo',
                  l.rotulo,
                  l.resolvidos,
                  l.noPrazo,
                  `${l.percentual}%`,
                ]),
              ],
            )
          }}
        />
      )}
      {aba === 'ocupacao' && (
        <SecaoOcupacao
          linhas={ocupacaoEquipamentos(locacoesFiltradas, chamados)}
          onExportar={() => {
            baixarCSV(
              'ocupacao-equipamentos.csv',
              ['Cliente', 'Contratos', 'Ativos', 'Encerrados', 'Ocupação %', 'Churn %'],
              ocupacaoEquipamentos(locacoesFiltradas, chamados).map((l) => [
                l.cliente,
                l.total,
                l.ativos,
                l.encerrados,
                `${l.ocupacao}%`,
                `${l.churn}%`,
              ]),
            )
          }}
        />
      )}
      {aba === 'financeiro' && (
        <SecaoFinanceiro
          linhas={financeiroLocacoes(locacoesFiltradas, periodo)}
          periodo={ROTULO_PERIODO[periodo]}
          onExportar={() => {
            baixarCSV(
              'financeiro-locacoes.csv',
              ['Cliente', 'Contratos', `Receita no período (${ROTULO_PERIODO[periodo]})`],
              financeiroLocacoes(locacoesFiltradas, periodo).map((l) => [
                l.cliente,
                l.contratos,
                l.totalPeriodo.toFixed(2).replace('.', ','),
              ]),
            )
          }}
        />
      )}
    </div>
  )
}

/* ===================== Seções ===================== */

function SecaoMTTR({
  porTipo,
  porTecnico,
  onExportar,
}: {
  porTipo: LinhaMTTR[]
  porTecnico: LinhaMTTR[]
  onExportar: () => void
}) {
  const geral = [...porTipo, ...porTecnico]
  const total = geral.reduce((s, l) => s + l.qtd, 0)
  const media =
    geral.length > 0 ? geral.reduce((s, l) => s + l.mttrHoras * l.qtd, 0) / Math.max(1, total) : 0
  return (
    <Secao titulo="Tempo médio de resolução (MTTR)" onExportar={onExportar}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlocoMTTR titulo="Por tipo de chamado" linhas={porTipo} />
        <BlocoMTTR titulo="Por técnico" linhas={porTecnico} />
      </div>
      <p className="text-xs text-slate-500 mt-4">
        Média geral ponderada:{' '}
        <strong>{media > 0 ? `${media.toFixed(1).replace('.', ',')}h` : '—'}</strong> · {total}{' '}
        chamado(s) resolvido(s) na amostra.
      </p>
    </Secao>
  )
}

function BlocoMTTR({ titulo, linhas }: { titulo: string; linhas: LinhaMTTR[] }) {
  const max = Math.max(...linhas.map((l) => l.mttrHoras), 1)
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">{titulo}</h3>
      <p className="text-xs text-slate-500 mb-4">Menor → maior tempo médio</p>
      {linhas.length === 0 && <p className="text-sm text-slate-400">Sem dados na amostra.</p>}
      <div className="space-y-3">
        {linhas.map((l) => (
          <div key={l.rotulo} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm text-slate-700 truncate" title={l.rotulo}>
              {l.rotulo}
            </span>
            <div className="flex-1 h-6 rounded-md bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-md bg-gradient-to-r from-blue-500 to-blue-600"
                style={{ width: `${(l.mttrHoras / max) * 100}%` }}
              />
            </div>
            <span className="w-20 text-right text-sm font-bold text-slate-900 tabular-nums shrink-0">
              {l.mttrTexto}
            </span>
            <span className="w-16 text-right text-[11px] text-slate-400 tabular-nums shrink-0">
              {l.qtd} ch.
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecaoSla({
  porCliente,
  porTipo,
  onExportar,
}: {
  porCliente: LinhaSla[]
  porTipo: LinhaSla[]
  onExportar: () => void
}) {
  return (
    <Secao titulo="Satisfação de SLA — chamados resolvidos dentro do prazo" onExportar={onExportar}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BlocoSla titulo="Por cliente" linhas={porCliente} />
        <BlocoSla titulo="Por tipo de chamado" linhas={porTipo} />
      </div>
    </Secao>
  )
}

function BlocoSla({ titulo, linhas }: { titulo: string; linhas: LinhaSla[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">{titulo}</h3>
      {linhas.length === 0 && <p className="text-sm text-slate-400">Sem dados na amostra.</p>}
      <div className="space-y-3">
        {linhas.map((l) => (
          <div key={l.rotulo} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm text-slate-700 truncate" title={l.rotulo}>
              {l.rotulo}
            </span>
            <div className="flex-1 h-6 rounded-md bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-md ${
                  l.percentual >= 90
                    ? 'bg-emerald-500'
                    : l.percentual >= 70
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${l.percentual}%` }}
              />
            </div>
            <span className="w-12 text-right text-sm font-bold text-slate-900 tabular-nums shrink-0">
              {l.percentual}%
            </span>
            <span className="w-16 text-right text-[11px] text-slate-400 tabular-nums shrink-0">
              {l.noPrazo}/{l.resolvidos}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecaoOcupacao({
  linhas,
  onExportar,
}: {
  linhas: LinhaOcupacao[]
  onExportar: () => void
}) {
  const totalAtivos = linhas.reduce((s, l) => s + l.ativos, 0)
  const totalContratos = linhas.reduce((s, l) => s + l.total, 0)
  const ocupacaoGeral = totalContratos ? Math.round((totalAtivos / totalContratos) * 100) : 0
  return (
    <Secao
      titulo="Ocupação de equipamentos — locação ativa e churn"
      icone={<Monitor className="w-5 h-5 text-blue-600" />}
      onExportar={onExportar}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <MiniKpi
          icone={<Monitor className="w-5 h-5" />}
          titulo="Taxa de locação ativa"
          valor={`${ocupacaoGeral}%`}
        />
        <MiniKpi
          icone={<Monitor className="w-5 h-5" />}
          titulo="Contratos ativos"
          valor={String(totalAtivos)}
        />
        <MiniKpi
          icone={<Users className="w-5 h-5" />}
          titulo="Clientes com contrato encerrado"
          valor={String(linhas.filter((l) => l.churn === 100).length)}
        />
      </div>
      <TabelaOcupacao linhas={linhas} />
    </Secao>
  )
}

function TabelaOcupacao({ linhas }: { linhas: LinhaOcupacao[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Contratos</TableHead>
            <TableHead className="text-right">Ativos</TableHead>
            <TableHead className="text-right">Encerrados</TableHead>
            <TableHead className="text-right">Ocupação</TableHead>
            <TableHead className="text-right">Churn</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((l) => (
            <TableRow key={l.cliente}>
              <TableCell className="font-medium text-slate-800">{l.cliente}</TableCell>
              <TableCell className="text-right tabular-nums">{l.total}</TableCell>
              <TableCell className="text-right tabular-nums">{l.ativos}</TableCell>
              <TableCell className="text-right tabular-nums">{l.encerrados}</TableCell>
              <TableCell className="text-right">
                <span
                  className={`font-bold tabular-nums ${
                    l.ocupacao >= 70
                      ? 'text-emerald-600'
                      : l.ocupacao >= 40
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {l.ocupacao}%
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={`font-bold tabular-nums ${
                    l.churn === 0
                      ? 'text-emerald-600'
                      : l.churn < 50
                        ? 'text-amber-600'
                        : 'text-red-600'
                  }`}
                >
                  {l.churn}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SecaoFinanceiro({
  linhas,
  periodo,
  onExportar,
}: {
  linhas: LinhaFinanceira[]
  periodo: string
  onExportar: () => void
}) {
  const total = linhas.reduce((s, l) => s + l.totalPeriodo, 0)
  return (
    <Secao
      titulo={`Financeiro de locações — receita recorrente por cliente (${periodo})`}
      icone={<Wallet className="w-5 h-5 text-blue-600" />}
      onExportar={onExportar}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <MiniKpi
          icone={<Wallet className="w-5 h-5" />}
          titulo="Receita no período"
          valor={fmtBRL(total)}
        />
        <MiniKpi
          icone={<Users className="w-5 h-5" />}
          titulo="Clientes faturados"
          valor={String(linhas.length)}
        />
        <MiniKpi
          icone={<FileBarChart className="w-5 h-5" />}
          titulo="Ticket médio"
          valor={linhas.length ? fmtBRL(total / linhas.length) : '—'}
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Receita por cliente</h3>
        <div className="space-y-3">
          {linhas.map((l) => (
            <div key={l.cliente} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-slate-700 truncate" title={l.cliente}>
                {l.cliente}
              </span>
              <div className="flex-1 h-6 rounded-md bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-md bg-gradient-to-r from-indigo-500 to-blue-600"
                  style={{
                    width: `${(l.totalPeriodo / Math.max(...linhas.map((x) => x.totalPeriodo))) * 100}%`,
                  }}
                />
              </div>
              <span className="w-28 text-right text-sm font-bold text-slate-900 tabular-nums shrink-0">
                {l.textoTotal}
              </span>
              <span className="w-10 text-right text-[11px] text-slate-400 tabular-nums shrink-0">
                {l.contratos}ct
              </span>
            </div>
          ))}
          {linhas.length === 0 && (
            <p className="text-sm text-slate-400">Nenhum contrato faturado no período.</p>
          )}
        </div>
      </div>
    </Secao>
  )
}

/* ===================== Cascaras compartilhadas ===================== */

function Secao({
  titulo,
  icone,
  onExportar,
  children,
}: {
  titulo: string
  icone?: React.ReactNode
  onExportar: () => void
  children: React.ReactNode
}) {
  return (
    <section aria-label={titulo} className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          {icone ?? <FileBarChart className="w-5 h-5 text-blue-600" />}
          {titulo}
        </h2>
        <Button size="sm" variant="outline" onClick={onExportar}>
          <Download className="w-4 h-4 mr-1.5" /> Exportar CSV
        </Button>
      </div>
      {children}
    </section>
  )
}

function MiniKpi({
  icone,
  titulo,
  valor,
}: {
  icone: React.ReactNode
  titulo: string
  valor: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600 shrink-0">
        {icone}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{titulo}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight">{valor}</p>
      </div>
    </div>
  )
}
