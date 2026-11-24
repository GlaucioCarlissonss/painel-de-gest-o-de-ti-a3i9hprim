// Formulário/diálogo de locação: cadastro, edição e renovação.
import { useEffect, useState } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TipoEquipamento } from '@/data/mockData'
import { NovaLocacao } from '@/state/AppDataContext'
import { parseDataBR, formatarDataBR } from '@/lib/regras'

const TIPOS_EQUIPAMENTO: TipoEquipamento[] = [
  'Impressora Laser',
  'Impressora Térmica',
  'Notebook',
  'Computador Desktop',
  'Tablet / Mobile',
]

export interface LocacaoEdicao extends NovaLocacao {
  id: string
  status: 'Ativo' | 'Vencendo em 7 dias' | 'Encerrado'
}

interface Props {
  aberto: boolean
  /** null = cadastro; objeto = edição */
  locacao: LocacaoEdicao | null
  clientes: string[]
  onSalvar: (dados: NovaLocacao) => void
  onFechar: () => void
}

const vazio = (cliente = ''): NovaLocacao => ({
  cliente,
  equipamento: '',
  tipoEquipamento: 'Notebook',
  dataInicio: formatarDataBR(new Date()),
  dataFim: '',
  valorMensal: 0,
})

export default function FormLocacao({ aberto, locacao, clientes, onSalvar, onFechar }: Props) {
  const isEdicao = Boolean(locacao)
  const [form, setForm] = useState<NovaLocacao>(vazio())
  const [valorTexto, setValorTexto] = useState('')

  useEffect(() => {
    if (!aberto) return
    if (locacao) {
      const { id: _id, status: _s, ...resto } = locacao
      setForm({ ...resto })
      setValorTexto(String(resto.valorMensal))
    } else {
      setForm(vazio())
      setValorTexto('')
    }
  }, [aberto, locacao])

  const set = <K extends keyof NovaLocacao>(campo: K, valor: NovaLocacao[K]) =>
    setForm((f) => ({ ...f, [campo]: valor }))

  const valido =
    form.cliente.trim() &&
    form.equipamento.trim() &&
    /^\d{2}\/\d{2}\/\d{4}$/.test(form.dataInicio) &&
    /^\d{2}\/\d{2}\/\d{4}$/.test(form.dataFim) &&
    parseDataBR(form.dataFim).getTime() > parseDataBR(form.dataInicio).getTime() &&
    Number(valorTexto) > 0

  const salvar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valido) return
    onSalvar({ ...form, cliente: form.cliente.trim(), valorMensal: Number(valorTexto) })
    onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdicao ? 'Editar locação' : 'Nova locação'}</DialogTitle>
          <DialogDescription>
            {isEdicao
              ? 'Ajuste equipamento, período ou valor da locação selecionada.'
              : 'Cadastre a locação de equipamentos para um cliente.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              {isEdicao ? (
                <Input value={form.cliente} disabled />
              ) : (
                <Select value={form.cliente} onValueChange={(v) => set('cliente', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Tipo de equipamento *</Label>
              <Select
                value={form.tipoEquipamento}
                onValueChange={(v) => set('tipoEquipamento', v as TipoEquipamento)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_EQUIPAMENTO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="loc-equipamento">Equipamento *</Label>
              <Input
                id="loc-equipamento"
                value={form.equipamento}
                onChange={(e) => set('equipamento', e.target.value)}
                placeholder="Ex.: 10× Notebooks Acer"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-inicio">Início (dd/mm/aaaa) *</Label>
              <Input
                id="loc-inicio"
                value={form.dataInicio}
                onChange={(e) => set('dataInicio', e.target.value)}
                placeholder="dd/mm/aaaa"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-fim">Fim (dd/mm/aaaa) *</Label>
              <Input
                id="loc-fim"
                value={form.dataFim}
                onChange={(e) => set('dataFim', e.target.value)}
                placeholder="dd/mm/aaaa"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="loc-valor">Valor mensal (R$) *</Label>
              <Input
                id="loc-valor"
                type="number"
                min={0}
                step="0.01"
                value={valorTexto}
                onChange={(e) => setValorTexto(e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onFechar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valido} className="bg-blue-600 hover:bg-blue-700">
              {isEdicao ? 'Salvar alterações' : 'Cadastrar locação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
