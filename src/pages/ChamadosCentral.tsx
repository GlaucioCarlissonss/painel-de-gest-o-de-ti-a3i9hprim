// Central de Chamados (Onda 2 — Fase 5 a 7): kanban, abertura com
// classificação automática, detalhe com timeline, fila inteligente,
// carga por atendente e Minha Fila por técnico.
import { useState } from 'react'
import { Plus, KanbanSquare, RefreshCw, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppData } from '@/state/AppDataContext'
import { StatusChamado } from '@/data/mockData'
import KanbanChamados from './chamados/KanbanChamados'
import DetalheChamado from './chamados/DetalheChamado'
import FormNovoChamado from './chamados/FormNovoChamado'
import FilaInteligente from './chamados/FilaInteligente'
import { cn } from '@/lib/utils'

type Aba = 'kanban' | 'fila'

export default function ChamadosCentral() {
  const { chamados, clientes, locacoes, moverChamado, atribuirTecnico, abrirChamado } = useAppData()
  const [aba, setAba] = useState<Aba>('kanban')
  const [detalheId, setDetalheId] = useState<string | null>(null)
  const [formAberto, setFormAberto] = useState(false)

  const detalhe = chamados.find((c) => c.id === detalheId) ?? null

  const abrirDetalhe = (id: string) => {
    setDetalheId(id)
    setAba('kanban')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Central de Chamados</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kanban do fluxo, SLA por matriz, fila inteligente e designação — {chamados.length}{' '}
            chamados na sessão.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
            <Database className="w-3.5 h-3.5" /> Dados de demonstração
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAba(aba === 'kanban' ? 'fila' : 'kanban')}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            {aba === 'kanban' ? 'Ver fila inteligente' : 'Ver kanban'}
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setFormAberto(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Novo chamado
          </Button>
        </div>
      </header>

      {detalhe ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <DetalheChamado
            chamado={detalhe}
            onMover={moverChamado}
            onAtribuir={atribuirTecnico}
            onFechar={() => setDetalheId(null)}
          />
        </section>
      ) : aba === 'kanban' ? (
        <section aria-label="Kanban de chamados">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
            <KanbanSquare className="w-4 h-4 text-blue-600" />
            Fluxo de atendimento
            <span className="text-xs font-normal text-slate-400">
              (use Avançar/← para mover entre as colunas)
            </span>
          </div>
          <KanbanChamados
            chamados={chamados}
            onMover={moverChamado}
            onAbrirDetalhe={setDetalheId}
          />
        </section>
      ) : (
        <FilaInteligente
          chamados={chamados}
          onAbrirDetalhe={abrirDetalhe}
          onAtribuir={atribuirTecnico}
        />
      )}

      <Dialog open={formAberto} onOpenChange={setFormAberto}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo chamado</DialogTitle>
            <DialogDescription>
              A prioridade e o SLA são definidos automaticamente pelas regras da Fase 6.
            </DialogDescription>
          </DialogHeader>
          <FormNovoChamado
            clientes={clientes}
            locacoes={locacoes}
            chamados={chamados}
            onEnviar={(entrada) => {
              abrirChamado(entrada)
              setFormAberto(false)
            }}
            onCancelar={() => setFormAberto(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
