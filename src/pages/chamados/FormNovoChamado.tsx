// Formulário de abertura de chamado com classificação automática de
// prioridade/SLA e designação automática via fila inteligente (Fases 6 e 7).
import { useMemo, useState } from 'react'
import { Wand2, Paperclip } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Cliente, TipoChamado, Locacao, Chamado, HOJE_MOCK } from '@/data/mockData'
import {
  EntradaChamado,
  MATRIZ_SLA,
  PRAZOS_PROJETO_HORAS,
  classificarChamado,
  isTipoProjeto,
} from '@/lib/regras'

const TIPOS: TipoChamado[] = [
  'Suporte N1',
  'Suporte N2',
  'Implementação',
  'Projeto de Infra',
  'Dados',
  'Automação',
]

export interface FormChamado {
  cliente: string
  tipo: TipoChamado
  equipamento: string
  descricao: string
  prazoHoras?: number
}

interface Props {
  clientes: Cliente[]
  locacoes: Locacao[]
  chamados: Chamado[]
  onEnviar: (entrada: EntradaChamado) => void
  onCancelar: () => void
}

export default function FormNovoChamado({
  clientes,
  locacoes,
  chamados,
  onEnviar,
  onCancelar,
}: Props) {
  const [form, setForm] = useState<FormChamado>({
    cliente: '',
    tipo: 'Suporte N1',
    equipamento: '',
    descricao: '',
  })
  const [anexoNome, setAnexoNome] = useState<string | null>(null)
  const tipoProjeto = isTipoProjeto(form.tipo)

  const equipamentosDoCliente = useMemo(
    () =>
      locacoes
        .filter((l) => l.cliente === form.cliente && l.status !== 'Encerrado')
        .map((l) => l.equipamento),
    [form.cliente, locacoes],
  )

  // Pré-visualização ao vivo da classificação automática (Fase 6)
  const previsao = useMemo(
    () =>
      form.cliente
        ? classificarChamado(
            {
              clienteNome: form.cliente,
              tipo: form.tipo,
              descricao: form.descricao,
              equipamento: form.equipamento || undefined,
              prazoHoras: tipoProjeto ? form.prazoHoras : undefined,
            },
            {
              clientes,
              locacoes,
              chamadosExistentes: chamados,
              agora: HOJE_MOCK,
            },
          )
        : null,
    [form, clientes, locacoes, chamados],
  )

  const envioOk = form.cliente && form.descricao && (!tipoProjeto || form.prazoHoras)

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!envioOk) return
    onEnviar({
      clienteNome: form.cliente,
      tipo: form.tipo,
      descricao: form.descricao,
      equipamento: form.equipamento || undefined,
      prazoHoras: tipoProjeto ? form.prazoHoras : undefined,
    })
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="chamado-cliente">Cliente *</Label>
          <Select
            value={form.cliente}
            onValueChange={(v) => setForm((f) => ({ ...f, cliente: v, equipamento: '' }))}
          >
            <SelectTrigger id="chamado-cliente">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.nome} value={c.nome}>
                  {c.nome}
                  {c.critico ? ' · crítico' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Tipo de chamado *</Label>
          <Select
            value={form.tipo}
            onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as TipoChamado }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="chamado-equipamento">Equipamento</Label>
          {equipamentosDoCliente.length > 0 ? (
            <Select
              value={form.equipamento}
              onValueChange={(v) => setForm((f) => ({ ...f, equipamento: v }))}
            >
              <SelectTrigger id="chamado-equipamento">
                <SelectValue placeholder="Selecione o equipamento" />
              </SelectTrigger>
              <SelectContent>
                {equipamentosDoCliente.map((eq) => (
                  <SelectItem key={eq} value={eq}>
                    {eq}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="chamado-equipamento"
              value={form.equipamento}
              onChange={(e) => setForm((f) => ({ ...f, equipamento: e.target.value }))}
              placeholder="Ex.: Impressora Laserjet M404"
            />
          )}
        </div>

        {/* Prazo manual — obrigatório para Implementações/Projetos (Fase 6) */}
        {tipoProjeto && (
          <div className="space-y-1.5">
            <Label>Prazo manual (horas) *</Label>
            <Select
              value={form.prazoHoras ? String(form.prazoHoras) : ''}
              onValueChange={(v) => setForm((f) => ({ ...f, prazoHoras: Number(v) }))}
            >
              <SelectTrigger>
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

      <div className="space-y-1.5">
        <Label htmlFor="chamado-descricao">Descrição do problema *</Label>
        <Textarea
          id="chamado-descricao"
          rows={3}
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          placeholder="Descreva o ocorrido, o impacto e o que já foi tentado…"
        />
      </div>

      {/* Anexo apenas visual/mock */}
      <div className="space-y-1.5">
        <Label>Anexo (demonstração)</Label>
        <label
          className={cnWrapper(
            'flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors',
          )}
        >
          <Paperclip className="w-4 h-4" />
          <span>{anexoNome ?? 'Anexar print ou documento (não é enviado)'}</span>
          <input
            type="file"
            className="sr-only"
            onChange={(e) => setAnexoNome(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      {/* Pré-visualização da classificação automática */}
      {previsao && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3.5 space-y-1.5">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-800 uppercase tracking-wide">
            <Wand2 className="w-3.5 h-3.5" /> Classificação automática
          </p>
          <p className="text-sm text-slate-700">
            Prioridade <strong>{previsao.prioridade}</strong>
            {!tipoProjeto && (
              <>
                {' '}
                · SLA{' '}
                <strong>
                  {MATRIZ_SLA[form.tipo as 'Suporte N1' | 'Suporte N2'][previsao.prioridade]}h
                </strong>
              </>
            )}
            {tipoProjeto && <> · prazo manual</>}
            {previsao.escalonar && (
              <>
                {' '}
                · <strong className="text-amber-700">escalona automático</strong>
              </>
            )}
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-xs text-slate-600">
            {previsao.motivos.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          {!tipoProjeto && (
            <p className="text-xs text-slate-500">
              Designação automática: N{form.tipo === 'Suporte N2' ? '2' : '1'} → técnico do nível
              com menor carga; projetos ficam para designação manual do gestor.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!envioOk} className="bg-blue-600 hover:bg-blue-700">
          Abrir chamado
        </Button>
      </div>
    </form>
  )
}

// wrapper de classes para manter o JSX limpo
function cnWrapper(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
