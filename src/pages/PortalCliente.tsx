// Portal do Cliente Externo (Fase 8): dashboard resumido do cliente com
// equipamentos locados, chamados ativos, SLA, bot de abertura guiada
// passo a passo (regras de classificação da Fase 6) e histórico de resoluções.
// Tudo alimentado pelo AppDataContext (mocks em memória).
import { useMemo, useState } from 'react'
import { Laptop, MessageSquareText, PlusCircle, RefreshCw, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppData } from '@/state/AppDataContext'
import { dataResolucao } from '@/lib/relatorios'
import { BadgeStatusLocacao } from '@/components/badgesOperacao'
import BotAberturaChamado from '@/components/portal/BotAberturaChamado'
import ListaChamadosPortal from '@/components/portal/ListaChamadosPortal'
import { CHAMADOS_HISTORICOS } from '@/data/historicoChamados'

export default function PortalCliente() {
  const { clientes, locacoes, chamados, abrirChamado } = useAppData()
  const [clienteSel, setClienteSel] = useState('Clínica VitalCare')
  const [botAberto, setBotAberto] = useState(false)

  const locacoesDoCliente = useMemo(
    () => locacoes.filter((l) => l.cliente === clienteSel),
    [locacoes, clienteSel],
  )
  const chamadosDoCliente = useMemo(
    () =>
      [...chamados, ...CHAMADOS_HISTORICOS]
        .filter((c) => c.cliente === clienteSel)
        .sort((a, b) => new Date(b.aberturaISO).getTime() - new Date(a.aberturaISO).getTime()),
    [chamados, clienteSel],
  )
  const ativos = chamadosDoCliente.filter((c) => c.status !== 'Fechado' && c.status !== 'Resolvido')
  const resolvidos = chamadosDoCliente.filter(
    (c) => c.status === 'Resolvido' || c.status === 'Fechado',
  )
  const noPrazo = resolvidos.filter((c) => dataResolucao(c) <= new Date(c.prazoISO)).length
  const percSla = resolvidos.length > 0 ? Math.round((noPrazo / resolvidos.length) * 100) : 100

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portal do Cliente</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe seus equipamentos, chamados e prazos de SLA — visualização do cliente.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setBotAberto(true)}
        >
          <PlusCircle className="w-4 h-4 mr-1.5" /> Abrir Chamado
        </Button>
      </header>

      {/* Seletor de cliente (simula o login do cliente externo no portal) */}
      <section
        aria-label="Cliente selecionado"
        className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      >
        <UserCheck className="w-5 h-5 text-blue-600 shrink-0" aria-hidden />
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="portal-cliente">Cliente conectado ao portal</Label>
          <Select value={clienteSel} onValueChange={setClienteSel}>
            <SelectTrigger id="portal-cliente" className="w-full sm:w-80">
              <SelectValue placeholder="Escolha o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.nome} value={c.nome}>
                  {c.nome}
                  {c.critico ? ' · cliente crítico' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-[11px] text-slate-400 max-w-xs">
          Demonstração: troque o cliente para ver o portal sob a visão dele (equipamentos, chamados
          e SLA próprios).
        </p>
      </section>

      {/* KPIs resumidos */}
      <section aria-label="Resumo do cliente">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiPortal
            icone={<Laptop className="w-5 h-5" />}
            titulo="Equipamentos locados"
            valor={String(locacoesDoCliente.filter((l) => l.status !== 'Encerrado').length)}
            detalhe={`${locacoesDoCliente.length} contrato(s) no total`}
          />
          <KpiPortal
            icone={<MessageSquareText className="w-5 h-5" />}
            titulo="Chamados ativos"
            valor={String(ativos.length)}
            detalhe={`${resolvidos.length} resolvido(s) no histórico`}
          />
          <KpiPortal
            icone={<UserCheck className="w-5 h-5" />}
            titulo="SLA cumprido"
            valor={`${percSla}%`}
            detalhe={`${noPrazo} de ${resolvidos.length} resolvidos no prazo`}
          />
          <KpiPortal
            icone={<RefreshCw className="w-5 h-5" />}
            titulo="Contratos a renovar"
            valor={String(
              locacoesDoCliente.filter((l) => l.status === 'Vencendo em 7 dias').length,
            )}
            detalhe="vencendo em até 7 dias"
          />
        </div>
      </section>

      {/* Equipamentos locados */}
      <section aria-label="Equipamentos locados">
        <h2 className="text-base font-semibold text-slate-800 mb-3">Equipamentos locados</h2>
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4">Equipamento</th>
                <th className="py-2.5 px-4">Tipo</th>
                <th className="py-2.5 px-4">Período</th>
                <th className="py-2.5 px-4">Valor mensal</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locacoesDoCliente.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-800">{l.equipamento}</td>
                  <td className="py-2.5 px-4 text-slate-600">{l.tipoEquipamento}</td>
                  <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                    {l.dataInicio} → {l.dataFim}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      l.valorMensal,
                    )}
                  </td>
                  <td className="py-2.5 px-4">
                    <BadgeStatusLocacao status={l.status} />
                  </td>
                </tr>
              ))}
              {locacoesDoCliente.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Nenhum equipamento locado por este cliente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chamados ativos + histórico de interações/resoluções */}
      <ListaChamadosPortal cliente={clienteSel} chamados={chamadosDoCliente} />

      {/* Bot de abertura guiada (Fase 8): usa as regras de classificação da Fase 6 */}
      <BotAberturaChamado
        aberto={botAberto}
        onFechar={() => setBotAberto(false)}
        clienteNome={clienteSel}
        locacoesDoCliente={locacoesDoCliente}
        onEnviar={(entrada) => abrirChamado(entrada, true)}
      />
    </div>
  )
}

function KpiPortal({
  icone,
  titulo,
  valor,
  detalhe,
}: {
  icone: React.ReactNode
  titulo: string
  valor: string
  detalhe: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 shrink-0">
          {icone}
        </span>
        <h3 className="text-sm font-medium text-slate-600">{titulo}</h3>
      </div>
      <p className="text-3xl font-bold text-slate-900 leading-tight">{valor}</p>
      <p className="text-xs text-slate-500">{detalhe}</p>
    </div>
  )
}
