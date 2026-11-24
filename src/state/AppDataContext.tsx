// Estado global em memória (sem persistência): substitui os mocks estáticos
// como fonte de verdade da sessão. Ações do usuário (abrir chamado, mover
// kanban, atribuir técnico, cadastrar/renovar locação) atualizam todas as telas.
import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode } from 'react'
import {
  Chamado,
  CLIENTES,
  EventoTimeline,
  HOJE_MOCK,
  Locacao,
  MOCK_CHAMADOS,
  MOCK_LOCACOES,
  StatusChamado,
  TECNICOS,
  Tecnico,
  TipoChamado,
  USUARIO_LOGADO,
} from '@/data/mockData'
import {
  EntradaChamado,
  classificarChamado,
  designarAutomatico,
  formatarDataBR,
  parseDataBR,
  proximoNumeroChamado,
} from '@/lib/regras'

let SEQ_ID = 100

export interface NovaLocacao {
  cliente: string
  equipamento: string
  tipoEquipamento: Locacao['tipoEquipamento']
  dataInicio: string // dd/mm/aaaa
  dataFim: string // dd/mm/aaaa
  valorMensal: number
}

interface AppDataContexto {
  agora: Date
  chamados: Chamado[]
  locacoes: Locacao[]
  clientes: typeof CLIENTES
  tecnicos: Tecnico[]
  abrirChamado: (entrada: EntradaChamado) => Chamado
  moverChamado: (id: string, novoStatus: StatusChamado) => void
  atribuirTecnico: (id: string, tecnicoNome: string) => void
  escalonarChamado: (id: string) => void
  cadastrarLocacao: (dados: NovaLocacao) => Locacao
  editarLocacao: (id: string, dados: Partial<NovaLocacao>) => void
  renovarLocacao: (id: string, novaDataFim: string) => void
  encerrarLocacao: (id: string) => void
}

const Ctx = createContext<AppDataContexto | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [chamados, setChamados] = useState<Chamado[]>(MOCK_CHAMADOS)
  const [locacoes, setLocacoes] = useState<Locacao[]>(MOCK_LOCACOES)
  const agora = HOJE_MOCK
  const proximoId = useRef(SEQ_ID)

  const novoId = useCallback((prefixo: string) => {
    proximoId.current += 1
    return `${prefixo}-n${proximoId.current}`
  }, [])

  const abrirChamado = useCallback(
    (entrada: EntradaChamado): Chamado => {
      const resultado = classificarChamado(entrada, {
        clientes: CLIENTES,
        locacoes,
        chamadosExistentes: chamados,
        agora,
      })
      const aberturaISO = formatarISO(agora)
      const prazoISO = formatarISO(new Date(agora.getTime() + resultado.slaHoras * 3600_000))
      const numero = proximoNumeroChamado(chamados)

      // Designação automática (projeto → manual, fica sem técnico)
      const designado = designarAutomatico(entrada.tipo, TECNICOS, chamados)
      const eventos: EventoTimeline[] = [
        {
          id: novoId('ev'),
          dataHora: aberturaISO,
          autor: USUARIO_LOGADO.nome,
          descricao: `Chamado aberto pelo gestor (${entrada.tipo})`,
          tipo: 'abertura',
        },
        ...resultado.motivos.map((m, i) => ({
          id: novoId('ev'),
          dataHora: aberturaISO,
          autor: 'Sistema (classificação automática)',
          descricao: m,
          tipo: (i === 0 ? 'atualizacao' : 'atualizacao') as EventoTimeline['tipo'],
        })),
      ]
      if (designado) {
        eventos.push({
          id: novoId('ev'),
          dataHora: aberturaISO,
          autor: 'Sistema (fila inteligente)',
          descricao: `Designado a ${designado.nome} (${designado.nivel}, menor carga).`,
          tipo: 'designacao',
        })
      } else {
        eventos.push({
          id: novoId('ev'),
          dataHora: aberturaISO,
          autor: 'Sistema (fila inteligente)',
          descricao: 'Projeto: designação manual pelo gestor.',
          tipo: 'atualizacao',
        })
      }
      if (resultado.escalonar) {
        eventos.push({
          id: novoId('ev'),
          dataHora: aberturaISO,
          autor: 'Sistema (classificação automática)',
          descricao: `Escalonamento automático aplicado (${resultado.motivos[resultado.motivos.length - 1]})`,
          tipo: 'escalonamento',
        })
      }

      const chamado: Chamado = {
        id: novoId('ch'),
        numero,
        cliente: entrada.clienteNome,
        equipamento: entrada.equipamento,
        tipo: entrada.tipo,
        prioridade: resultado.escalonar ? 'Alta' : resultado.prioridade,
        status: resultado.escalonar ? 'Escalonado' : 'Aberto',
        aberturaISO,
        slaHoras: resultado.slaHoras,
        prazoISO,
        descricao: entrada.descricao,
        tecnico: designado?.nome,
        timeline: eventos,
      }
      setChamados((prev) => [chamado, ...prev])
      return chamado
    },
    [chamados, locacoes, agora, novoId],
  )

  const moverChamado = useCallback(
    (id: string, novoStatus: StatusChamado) => {
      setChamados((prev) =>
        prev.map((c) => {
          if (c.id !== id || c.status === novoStatus) return c
          const tipoEvento: EventoTimeline['tipo'] =
            novoStatus === 'Resolvido'
              ? 'resolucao'
              : novoStatus === 'Fechado'
                ? 'fechamento'
                : novoStatus === 'Escalonado'
                  ? 'escalonamento'
                  : 'atualizacao'
          const descricoes: Record<StatusChamado, string> = {
            Aberto: 'Reaberto',
            'Em Atendimento': 'Movido para Em Atendimento',
            Escalonado: 'Escalonado para o nível 2',
            Resolvido: 'Resolvido pelo técnico',
            Fechado: 'Chamado fechado após validação',
          }
          return {
            ...c,
            status: novoStatus,
            timeline: [
              ...c.timeline,
              {
                id: novoId('ev'),
                dataHora: formatarISO(agora),
                autor: USUARIO_LOGADO.nome,
                descricao: descricoes[novoStatus],
                tipo: tipoEvento,
              },
            ],
          }
        }),
      )
    },
    [agora, novoId],
  )

  const atribuirTecnico = useCallback(
    (id: string, tecnicoNome: string) => {
      setChamados((prev) =>
        prev.map((c) => {
          if (c.id !== id || c.tecnico === tecnicoNome) return c
          return {
            ...c,
            tecnico: tecnicoNome,
            timeline: [
              ...c.timeline,
              {
                id: novoId('ev'),
                dataHora: formatarISO(agora),
                autor: USUARIO_LOGADO.nome,
                descricao: `Designado manualmente a ${tecnicoNome}.`,
                tipo: 'designacao' as const,
              },
            ],
          }
        }),
      )
    },
    [agora, novoId],
  )

  const escalonarChamado = useCallback(
    (id: string) => {
      setChamados((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const nivelAtual = c.tipo === 'Suporte N1' ? 'N1' : 'N2'
          const destino = c.tipo === 'Suporte N1' ? 'Suporte N2' : c.tipo
          return {
            ...c,
            status: 'Escalonado' as const,
            tipo: (destino as TipoChamado) ?? c.tipo,
            timeline: [
              ...c.timeline,
              {
                id: novoId('ev'),
                dataHora: formatarISO(agora),
                autor: USUARIO_LOGADO.nome,
                descricao: `Escalonado do ${nivelAtual} para ${destino}.`,
                tipo: 'escalonamento' as const,
              },
            ],
          }
        }),
      )
    },
    [agora, novoId],
  )

  /** Recalcula o status da locação pela data de fim vs. hoje (mock). */
  const statusPorVencimento = (l: Locacao): Locacao['status'] => {
    if (l.status === 'Encerrado') return 'Encerrado'
    const dias = (parseDataBR(l.dataFim).getTime() - agora.getTime()) / 86_400_000
    return dias <= 7 ? 'Vencendo em 7 dias' : 'Ativo'
  }

  const cadastrarLocacao = useCallback(
    (dados: NovaLocacao): Locacao => {
      const nova: Locacao = {
        id: novoId('loc'),
        ...dados,
        status: 'Ativo',
      }
      const final = { ...nova, status: statusPorVencimento(nova) }
      setLocacoes((prev) => [final, ...prev])
      return final
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [novoId],
  )

  const editarLocacao = useCallback(
    (id: string, dados: Partial<NovaLocacao>) => {
      setLocacoes((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l
          const atualizado = { ...l, ...dados }
          return { ...atualizado, status: statusPorVencimento(atualizado) }
        }),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [novoId],
  )

  const renovarLocacao = useCallback(
    (id: string, novaDataFim: string) => {
      setLocacoes((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l
          const renovada: Locacao = {
            ...l,
            dataInicio: formatarDataBR(agora),
            dataFim: novaDataFim,
            status: 'Ativo',
          }
          return { ...renovada, status: statusPorVencimento(renovada) }
        }),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [novoId],
  )

  const encerrarLocacao = useCallback((id: string) => {
    setLocacoes((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Encerrado' as const } : l)),
    )
  }, [])

  const value = useMemo<AppDataContexto>(
    () => ({
      agora,
      chamados,
      locacoes,
      clientes: CLIENTES,
      tecnicos: TECNICOS,
      abrirChamado,
      moverChamado,
      atribuirTecnico,
      escalonarChamado,
      cadastrarLocacao,
      editarLocacao,
      renovarLocacao,
      encerrarLocacao,
    }),
    [
      agora,
      chamados,
      locacoes,
      abrirChamado,
      moverChamado,
      atribuirTecnico,
      escalonarChamado,
      cadastrarLocacao,
      editarLocacao,
      renovarLocacao,
      encerrarLocacao,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppData(): AppDataContexto {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppData deve ser usado dentro de AppDataProvider')
  return ctx
}

function formatarISO(data: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}T${p(data.getHours())}:${p(data.getMinutes())}:00`
}
