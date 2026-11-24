// Gestão de Locações (Onda 2): lista completa, cadastro, edição, renovação e
// histórico de locações encerradas por cliente. Sem persistência real.
import { useMemo, useState } from 'react'
import { Plus, Pencil, CalendarRefresh, ArchiveRestore, Database, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppData } from '@/state/AppDataContext'
import { Locacao, fmtBRL, HOJE_MOCK } from '@/data/mockData'
import { alertasLocacao, parseDataBR } from '@/lib/regras'
import { BadgeStatusLocacao } from '@/components/badgesOperacao'
import FormLocacao, { LocacaoEdicao } from './locacoes/FormLocacao'

const MS_DIA = 86_400_000

const hojeMock = HOJE_MOCK
const diasPara = (dataFim: string) =>
  Math.round((parseDataBR(dataFim).getTime() - hojeMock.getTime()) / MS_DIA)

const descVencimento = (l: Locacao) => {
  if (l.status === 'Encerrado') return '—'
  const dias = diasPara(l.dataFim)
  if (dias < 0) return `vencida há ${Math.abs(dias)} dia${Math.abs(dias) === 1 ? '' : 's'}`
  if (dias === 0) return 'vence hoje'
  if (dias === 1) return 'vence amanhã'
  return `vence em ${dias} dias`
}

type AbaLista = 'ativas' | 'historico'

export default function LocacoesGestao() {
  const { locacoes, clientes, cadastrarLocacao, editarLocacao, renovarLocacao, encerrarLocacao } =
    useAppData()
  const [aba, setAba] = useState<AbaLista>('ativas')
  const [busca, setBusca] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<LocacaoEdicao | null>(null)
  const [renovando, setRenovando] = useState<Locacao | null>(null)
  const [novaDataFim, setNovaDataFim] = useState('')
  const [historicoCliente, setHistoricoCliente] = useState<string | null>(null)

  const alertas = alertasLocacao(locacoes)

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return locacoes
      .filter((l) => (aba === 'ativas' ? l.status !== 'Encerrado' : l.status === 'Encerrado'))
      .filter(
        (l) =>
          !termo ||
          l.cliente.toLowerCase().includes(termo) ||
          l.equipamento.toLowerCase().includes(termo),
      )
      .sort((a, b) => parseDataBR(b.dataFim).getTime() - parseDataBR(a.dataFim).getTime())
  }, [locacoes, aba, busca])

  const clientesHistorico = useMemo(
    () => [...new Set(locacoes.filter((l) => l.status === 'Encerrado').map((l) => l.cliente))],
    [locacoes],
  )

  const historico = useMemo(
    () =>
      historicoCliente
        ? locacoes.filter((l) => l.status === 'Encerrado' && l.cliente === historicoCliente)
        : [],
    [locacoes, historicoCliente],
  )

  const abrirNova = () => {
    setEditando(null)
    setFormAberto(true)
  }

  const abrirEdicao = (l: Locacao) => {
    setEditando({ ...l })
    setFormAberto(true)
  }

  const salvar = (dados: Parameters<typeof cadastrarLocacao>[0]) => {
    if (editando) editarLocacao(editando.id, dados)
    else cadastrarLocacao(dados)
  }

  const confirmarRenovacao = () => {
    if (renovando && /^\d{2}\/\d{2}\/\d{4}$/.test(novaDataFim)) {
      renovarLocacao(renovando.id, novaDataFim)
      setRenovando(null)
      setNovaDataFim('')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Locações</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Contratos ativos, renovações e histórico por cliente — {locacoes.length} registros na
            sessão.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
            <Database className="w-3.5 h-3.5" /> Dados de demonstração
          </span>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={abrirNova}>
            <Plus className="w-4 h-4 mr-1.5" /> Nova locação
          </Button>
        </div>
      </header>

      {/* Alertas de vencimento (7 dias) */}
      {alertas.total > 0 && (
        <div
          className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          <CalendarRefresh className="w-5 h-5 shrink-0" />
          <p>
            <strong>
              {alertas.total} locaç{alertas.total === 1 ? 'ão' : 'ões'} vencendo em até 7 dias
            </strong>{' '}
            {alertas.diasRestantes < 0
              ? `— a mais crítica está vencida há ${Math.abs(alertas.diasRestantes)} dia(s).`
              : alertas.diasRestantes === 0
                ? ' — a mais crítica vence hoje.'
                : ` — a mais crítica vence em ${alertas.diasRestantes} dia(s).`}
          </p>
        </div>
      )}

      {/* Abas + busca */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
          {(
            [
              ['ativas', `Ativas (${locacoes.filter((l) => l.status !== 'Encerrado').length})`],
              ['historico', `Histórico (${clientesHistorico.length} clientes)`],
            ] as const
          ).map(([chave, rotulo]) => (
            <button
              key={chave}
              type="button"
              onClick={() => setAba(chave)}
              className={
                aba === chave
                  ? 'px-3.5 py-1.5 text-sm font-semibold rounded-md bg-blue-600 text-white transition-colors'
                  : 'px-3.5 py-1.5 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50 transition-colors'
              }
            >
              {rotulo}
            </button>
          ))}
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente ou equipamento…"
            className="pl-8"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead>Cliente</TableHead>
              <TableHead>Equipamento</TableHead>
              <TableHead>Período</TableHead>
              <TableHead className="text-right">Valor mensal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-slate-400 py-10">
                  {aba === 'ativas'
                    ? 'Nenhuma locação ativa encontrada.'
                    : 'Nenhuma locação encerrada para este filtro.'}
                </TableCell>
              </TableRow>
            )}
            {lista.map((l) => {
              const vence = diasPara(l.dataFim)
              const critico = l.status !== 'Encerrado' && vence <= 7
              return (
                <TableRow
                  key={l.id}
                  className={critico ? 'bg-amber-50/60 hover:bg-amber-50' : undefined}
                >
                  <TableCell className="font-semibold text-slate-800">{l.cliente}</TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-800">{l.equipamento}</p>
                    <p className="text-xs text-slate-400">{l.tipoEquipamento}</p>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {l.dataInicio} → {l.dataFim}
                    {l.status !== 'Encerrado' && (
                      <p
                        className={
                          vence < 0
                            ? 'text-xs font-semibold text-red-600'
                            : critico
                              ? 'text-xs font-semibold text-amber-700'
                              : 'text-xs text-slate-400'
                        }
                      >
                        {descVencimento(l)}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-800">
                    {fmtBRL(l.valorMensal)}
                  </TableCell>
                  <TableCell>
                    <BadgeStatusLocacao status={l.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {l.status !== 'Encerrado' ? (
                      <div className="inline-flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirEdicao(l)}
                          title="Editar locação"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRenovando(l)
                            setNovaDataFim('')
                          }}
                          title="Renovar locação"
                          className="text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                          <CalendarRefresh className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => encerrarLocacao(l.id)}
                          title="Encerrar locação (vai para o histórico)"
                          className="text-slate-500"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">encerrada</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Histórico por cliente */}
      {aba === 'historico' && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Histórico por cliente
          </h3>
          <Select value={historicoCliente ?? ''} onValueChange={setHistoricoCliente}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientesHistorico.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {historicoCliente && (
            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {historico.length === 0 && (
                <li className="text-sm text-slate-400 text-center py-6">
                  Sem locações encerradas para {historicoCliente}.
                </li>
              )}
              {historico.map((l) => (
                <li key={l.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
                  <span className="text-sm font-semibold text-slate-800 flex-1 min-w-[160px]">
                    {l.equipamento}
                  </span>
                  <span className="text-xs text-slate-500">
                    {l.dataInicio} → {l.dataFim}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {fmtBRL(l.valorMensal)}/mês
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Formulário de cadastro/edição */}
      <FormLocacao
        aberto={formAberto}
        locacao={editando}
        clientes={clientes.map((c) => c.nome)}
        onSalvar={salvar}
        onFechar={() => {
          setFormAberto(false)
          setEditando(null)
        }}
      />

      {/* Diálogo de renovação */}
      <Dialog
        open={Boolean(renovando)}
        onOpenChange={(v) => {
          if (!v) setRenovando(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Renovar locação</DialogTitle>
            <DialogDescription>
              {renovando
                ? `${renovando.cliente} · ${renovando.equipamento}. A renovação reinicia o período a partir de hoje.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="renov-fim">Nova data de fim (dd/mm/aaaa) *</Label>
            <Input
              id="renov-fim"
              value={novaDataFim}
              onChange={(e) => setNovaDataFim(e.target.value)}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenovando(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!/^\d{2}\/\d{2}\/\d{4}$/.test(novaDataFim)}
              onClick={confirmarRenovacao}
            >
              Confirmar renovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
