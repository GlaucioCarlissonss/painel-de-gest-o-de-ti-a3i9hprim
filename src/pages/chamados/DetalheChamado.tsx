// Painel de detalhe do chamado: timeline de atualizações (autor, data/hora,
// descrição), ações de fluxo e designação manual de técnico (gestor).
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Chamado, COLUNAS_KANBAN, StatusChamado, TECNICOS } from '@/data/mockData'
import { ROTULO_SLA, slaStatusDe, textoRestanteSLA } from '@/lib/regras'
import {
  BadgePrioridade,
  BadgeStatusChamado,
  AvatarTecnico,
  iniciaisDe,
} from '@/components/badgesOperacao'

const rotuloEvento: Record<string, string> = {
  abertura: 'Abertura',
  atualizacao: 'Atualização',
  escalonamento: 'Escalonamento',
  designacao: 'Designação',
  resolucao: 'Resolução',
  fechamento: 'Fechamento',
}

const corEvento: Record<string, string> = {
  abertura: 'bg-blue-500',
  atualizacao: 'bg-slate-300',
  escalonamento: 'bg-amber-500',
  designacao: 'bg-indigo-500',
  resolucao: 'bg-emerald-500',
  fechamento: 'bg-slate-400',
}

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

interface Props {
  chamado: Chamado
  onMover: (id: string, novoStatus: StatusChamado) => void
  onAtribuir: (id: string, tecnico: string) => void
  onFechar: () => void
}

export default function DetalheChamado({ chamado, onMover, onAtribuir, onFechar }: Props) {
  const [tecnicoSel, setTecnicoSel] = useState<string>(chamado.tecnico ?? '')
  const idx = COLUNAS_KANBAN.indexOf(chamado.status)
  const sla = slaStatusDe(chamado)

  const mover = (destino: StatusChamado) => {
    onMover(chamado.id, destino)
    if (destino === 'Fechado') onFechar()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna principal: dados + timeline */}
      <div className="lg:col-span-2 space-y-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {chamado.numero}
            </span>
            <BadgeStatusChamado status={chamado.status} />
            <BadgePrioridade prioridade={chamado.prioridade} />
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">
              {chamado.tipo}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-2">{chamado.cliente}</h3>
          {chamado.equipamento && (
            <p className="text-sm text-slate-500">Equipamento: {chamado.equipamento}</p>
          )}
          {chamado.descricao && <p className="text-sm text-slate-700 mt-2">{chamado.descricao}</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoBox titulo="Abertura" valor={dataHora(chamado.aberturaISO)} />
          <InfoBox
            titulo="Prazo SLA"
            valor={`${chamado.slaHoras}h · ${dataHora(chamado.prazoISO)}`}
          />
          <InfoBox titulo="Situação SLA" valor={ROTULO_SLA[sla]} destaque={sla} />
          <InfoBox titulo="Restante" valor={textoRestanteSLA(chamado)} destaque={sla} />
        </div>

        {/* Timeline de atualizações */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">
            Timeline de atualizações
          </h4>
          <ol className="relative border-l-2 border-slate-200 ml-2 space-y-4">
            {[...chamado.timeline]
              .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
              .map((ev) => (
                <li key={ev.id} className="ml-6">
                  <span
                    className={`absolute -left-[7px] w-3.5 h-3.5 rounded-full border-2 border-white ${corEvento[ev.tipo] ?? 'bg-slate-300'}`}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {rotuloEvento[ev.tipo] ?? ev.tipo}
                    </span>
                    <span className="text-[11px] text-slate-400">{dataHora(ev.dataHora)}</span>
                    <span className="text-[11px] text-slate-500">· {ev.autor}</span>
                  </div>
                  <p className="text-sm text-slate-700 mt-0.5">{ev.descricao}</p>
                </li>
              ))}
          </ol>
        </div>
      </div>

      {/* Coluna lateral: técnico e ações de fluxo */}
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Atendimento</h4>
          <div className="flex items-center gap-2.5">
            <AvatarTecnico
              nome={chamado.tecnico ?? 'Sem técnico'}
              iniciais={chamado.tecnico ? iniciaisDe(chamado.tecnico) : '—'}
              atribuido={Boolean(chamado.tecnico)}
            />
            <div className="text-sm">
              <p className="font-semibold text-slate-800">
                {chamado.tecnico ?? 'Sem técnico designado'}
              </p>
              <p className="text-xs text-slate-500">
                {chamado.tecnico
                  ? TECNICOS.find((t) => t.nome === chamado.tecnico)?.nivel
                  : 'Aguardando fila inteligente ou designação manual'}
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sel-tecnico">Designar técnico (gestor)</Label>
            <Select
              value={tecnicoSel}
              onValueChange={(v) => {
                setTecnicoSel(v)
                onAtribuir(chamado.id, v)
              }}
            >
              <SelectTrigger id="sel-tecnico">
                <SelectValue placeholder="Escolher técnico" />
              </SelectTrigger>
              <SelectContent>
                {TECNICOS.map((t) => (
                  <SelectItem key={t.id} value={t.nome}>
                    {t.nome} · {t.nivel} ({t.especialidades.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Projetos de Infra, Dados e Automação exigem designação manual.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Mover no fluxo
          </h4>
          {COLUNAS_KANBAN.map((destino) => (
            <Button
              key={destino}
              variant={destino === chamado.status ? 'secondary' : 'outline'}
              size="sm"
              className="w-full justify-between"
              disabled={destino === chamado.status}
              onClick={() => mover(destino)}
            >
              <span>{destino}</span>
              <span className="text-xs font-normal text-slate-400">
                {destino === chamado.status
                  ? 'atual'
                  : `→ ${COLUNAS_KANBAN[COLUNAS_KANBAN.indexOf(destino)]}`}
              </span>
            </Button>
          ))}
        </div>

        <Button variant="ghost" className="w-full text-slate-500" onClick={onFechar}>
          <Trash2 className="w-4 h-4 mr-1.5" /> Voltar ao kanban
        </Button>
      </div>
    </div>
  )
}

function InfoBox({
  titulo,
  valor,
  destaque,
}: {
  titulo: string
  valor: string
  destaque?: 'dentro' | 'proximo' | 'vencido'
}) {
  const cor =
    destaque === 'vencido'
      ? 'text-red-600'
      : destaque === 'proximo'
        ? 'text-orange-600'
        : destaque === 'dentro'
          ? 'text-emerald-600'
          : 'text-slate-800'
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className={`text-sm font-bold mt-0.5 ${cor}`}>{valor}</p>
    </div>
  )
}
