// Páginas financeiras: Títulos a Pagar e Títulos a Receber.
// Nomenclatura segue o repositório de referência ("Títulos", nunca "contas").
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import TelaTitulos from './TelaTitulos'
import {
  MOCK_TITULOS_PAGAR,
  MOCK_TITULOS_RECEBER,
  MOCK_FLUXO_CAIXA,
  TituloPagar,
  TituloReceber,
} from '@/data/gestaoData'

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function TitulosPagar() {
  const titulos = MOCK_TITULOS_PAGAR.map((t: TituloPagar) => ({
    id: t.id,
    parte: t.fornecedor,
    rotuloParte: t.categoria,
    descricao: t.descricao,
    valor: t.valor,
    vencimento: t.vencimento,
    status: t.status,
    vinculo: t.locacaoVinculada ? `Locação ${t.locacaoVinculada}` : undefined,
  }))

  return (
    <TelaTitulos
      titulo="Títulos a Pagar"
      subtitulo="Obrigações da locadora: aluguel de frota, manutenção, insumos e logística"
      icone={<ArrowDownCircle className="w-7 h-7 text-red-600" />}
      iconeTotal={<ArrowDownCircle className="w-5 h-5 text-slate-500" />}
      titulos={titulos}
      fluxo={MOCK_FLUXO_CAIXA}
      formatoValor={fmtBRL}
    />
  )
}

export function TitulosReceber() {
  const titulos = MOCK_TITULOS_RECEBER.map((t: TituloReceber) => ({
    id: t.id,
    parte: t.cliente,
    rotuloParte: t.categoria,
    descricao: t.descricao,
    valor: t.valor,
    vencimento: t.vencimento,
    status: t.status,
    vinculo: t.locacaoVinculada
      ? `Locação ${t.locacaoVinculada}`
      : t.chamadoVinculado
        ? `Chamado ${t.chamadoVinculado}`
        : undefined,
  }))

  return (
    <TelaTitulos
      titulo="Títulos a Receber"
      subtitulo="Entradas previstas: mensalidades de locação e contratos de suporte"
      icone={<ArrowUpCircle className="w-7 h-7 text-emerald-600" />}
      iconeTotal={<ArrowUpCircle className="w-5 h-5 text-slate-500" />}
      titulos={titulos}
      fluxo={MOCK_FLUXO_CAIXA}
      formatoValor={fmtBRL}
    />
  )
}
