// Bot de abertura guiada de chamado no portal do cliente (Fase 8):
// fluxo passo a passo — "Qual equipamento?" → "Qual o problema?" →
// "Classificação automática aplicada" — reaproveitando as regras da Fase 6
// (src/lib/regras.ts). Sem persistência real: cria o chamado na sessão.
import { useMemo, useState } from 'react'
import { Bot, CheckCircle2, ChevronLeft, Send, Wand2 } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Locacao, TipoChamado, HOJE_MOCK, fmtBRL } from '@/data/mockData'
import {
  EntradaChamado,
  PRAZOS_PROJETO_HORAS,
  classificarChamado,
  isTipoProjeto,
} from '@/lib/regras'
import { useAppData } from '@/state/AppDataContext'

const TIPOS_PORTAL: { valor: TipoChamado; rotulo: string }[] = [
  { valor: 'Suporte N1', rotulo: 'Problema do dia a dia (suporte)' },
  { valor: 'Suporte N2', rotulo: 'Problema mais grave / rede / servidor' },
  { valor: 'Implementação', rotulo: 'Novo equipamento / instalação' },
  { valor: 'Projeto de Infra', rotulo: 'Projeto de infraestrutura' },
  { valor: 'Dados', rotulo: 'Relatórios e dados' },
  { valor: 'Automação', rotulo: 'Automação de processos' },
]

const PASSOS = ['Equipamento', 'Problema', 'Confirmação'] as const

interface Props {
  aberto: boolean
  onFechar: () => void
  clienteNome: string
  locacoesDoCliente: Locacao[]
  onEnviar: (entrada: EntradaChamado) => void
}

export default function BotAberturaChamado({
  aberto,
  onFechar,
  clienteNome,
  locacoesDoCliente,
  onEnviar,
}: Props) {
  const { chamados, clientes } = useAppData()
  const [passo, setPasso] = useState(0)
  const [equipamento, setEquipamento] = useState('')
  const [tipo, setTipo] = useState<TipoChamado>('Suporte N1')
  const [descricao, setDescricao] = useState('')
  const [prazoHoras, setPrazoHoras] = useState<number | undefined>(undefined)
  const [resultado, setResultado] = useState<ReturnType<typeof classificarChamado> | null>(null)
  const tipoProjeto = isTipoProjeto(tipo)

  const equipamentosAtivos = useMemo(
    () => locacoesDoCliente.filter((l) => l.status !== 'Encerrado'),
    [locacoesDoCliente],
  )

  const reiniciar = () => {
    setPasso(0)
    setEquipamento('')
    setTipo('Suporte N1')
    setDescricao('')
    setPrazoHoras(undefined)
    setResultado(null)
  }

  const fechar = () => {
    reiniciar()
    onFechar()
  }

  const avancarParaConfirmacao = () => {
    const entrada: EntradaChamado = {
      clienteNome,
      tipo,
      descricao,
      equipamento: equipamento || undefined,
      prazoHoras: tipoProjeto ? prazoHoras : undefined,
    }
    const res = classificarChamado(entrada, {
      clientes,
      locacoes: locacoesDoCliente,
      chamadosExistentes: chamados,
      agora: HOJE_MOCK,
    })
    setResultado(res)
    setPasso(2)
  }

  const enviar = () => {
    onEnviar({
      clienteNome,
      tipo,
      descricao,
      equipamento: equipamento || undefined,
      prazoHoras: tipoProjeto ? prazoHoras : undefined,
    })
    fechar()
  }

  const podeAvancar =
    (passo === 0 && equipamento) ||
    (passo === 1 && descricao.trim().length >= 5 && (!tipoProjeto || prazoHoras))

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && fechar()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Assistente de abertura de chamado
          </DialogTitle>
          <DialogDescription>
            Vou te fazer algumas perguntas e aplicar a classificação automática.
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de passo */}
        <ol className="flex items-center gap-2 mb-2" aria-label="Progresso do assistente">
          {PASSOS.map((p, i) => (
            <li
              key={p}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                i === passo
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : i < passo
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              {i + 1}. {p}
              {i < passo && <CheckCircle2 className="w-3 h-3 inline ml-1" aria-hidden />}
            </li>
          ))}
        </ol>

        {/* Passo 1: equipamento */}
        {passo === 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">
              Qual equipamento está com problema?
            </p>
            {equipamentosAtivos.length > 0 ? (
              <>
                <Label htmlFor="bot-equipamento" className="sr-only">
                  Equipamento
                </Label>
                <Select value={equipamento} onValueChange={setEquipamento}>
                  <SelectTrigger id="bot-equipamento">
                    <SelectValue placeholder="Escolha o equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentosAtivos.map((l) => (
                      <SelectItem key={l.id} value={l.equipamento}>
                        {l.equipamento} · {fmtBRL(l.valorMensal)}/mês
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Label htmlFor="bot-equipamento-livre">Equipamento</Label>
                <Input
                  id="bot-equipamento-livre"
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  placeholder="Descreva o equipamento (ex.: Notebook Dell)"
                />
              </>
            )}
          </div>
        )}

        {/* Passo 2: problema */}
        {passo === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">Qual o problema?</p>
            <div className="space-y-1.5">
              <Label htmlFor="bot-tipo">Tipo de solicitação</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as TipoChamado)}>
                <SelectTrigger id="bot-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PORTAL.map((t) => (
                    <SelectItem key={t.valor} value={t.valor}>
                      {t.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bot-descricao">Descreva o que está acontecendo *</Label>
              <Input
                id="bot-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex.: a impressora não liga e as etiquetas saem cortadas"
              />
            </div>
            {tipoProjeto && (
              <div className="space-y-1.5">
                <Label htmlFor="bot-prazo">Prazo desejado</Label>
                <Select
                  value={prazoHoras ? String(prazoHoras) : ''}
                  onValueChange={(v) => setPrazoHoras(Number(v))}
                >
                  <SelectTrigger id="bot-prazo">
                    <SelectValue placeholder="Definir prazo" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAZOS_PROJETO_HORAS.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h}h ({Math.round(h / 24)} dia{h >= 48 ? 's' : ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Passo 3: classificação automática aplicada */}
        {passo === 2 && resultado && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-blue-600" />
              Classificação automática aplicada
            </p>
            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 space-y-1.5">
              <p className="text-sm text-slate-700">
                Prioridade <strong>{resultado.prioridade}</strong> · SLA{' '}
                <strong>{resultado.slaHoras}h</strong>
                {resultado.escalonar && (
                  <span className="text-amber-700 font-semibold"> · escalona automático</span>
                )}
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-xs text-slate-600">
                {resultado.motivos.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-slate-500">
              Ao confirmar, o chamado entra na Central de Chamados e na fila inteligente da equipe.
            </p>
          </div>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => (passo === 0 ? fechar() : setPasso(passo - 1))}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {passo === 0 ? 'Cancelar' : 'Voltar'}
          </Button>
          <div className="flex items-center gap-2">
            {passo === 0 && (
              <Button
                type="button"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!equipamento}
                onClick={() => setPasso(1)}
              >
                <Send className="w-4 h-4 mr-1.5" /> Avançar
              </Button>
            )}
            {passo === 1 && (
              <Button
                type="button"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!podeAvancar}
                onClick={avancarParaConfirmacao}
              >
                <Wand2 className="w-4 h-4 mr-1.5" /> Aplicar classificação
              </Button>
            )}
            {passo === 2 && (
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={enviar}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirmar abertura
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
