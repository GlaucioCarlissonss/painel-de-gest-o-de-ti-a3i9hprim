// Navegação agrupada por trabalho — nomenclatura segue a arquitetura de
// informação do repositório de referência STI.IARX (docs/08): grupos respondem
// "o que eu vim fazer aqui", e "Títulos a pagar/receber" em vez de "contas".
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Box,
  Ticket,
  Users,
  BarChart3,
  Gauge,
  MapPin,
  Tv,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import { useAppData } from '@/state/AppDataContext'
import { cn } from '@/lib/utils'

interface NavItemConfig {
  path: string
  label: string
  icon: React.ElementType
}

const navItems: NavItemConfig[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/locacoes', label: 'Locações', icon: Box },
  { path: '/chamados', label: 'Chamados', icon: Ticket },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
  { path: '/gestao', label: 'Visão de Resultado', icon: Gauge },
  { path: '/mapa', label: 'Mapa das Filiais', icon: MapPin },
  { path: '/tv', label: 'Painel TV', icon: Tv },
  { path: '/financeiro/pagar', label: 'Títulos a Pagar', icon: ArrowDownCircle },
  { path: '/financeiro/receber', label: 'Títulos a Receber', icon: ArrowUpCircle },
]

export default function SidebarNav({
  onNavigate,
  compact = false,
}: {
  onNavigate: () => void
  compact?: boolean
}) {
  const { chamados, locacoes } = useAppData()
  const py = compact ? 'py-4' : 'py-5'
  const contadores: Record<string, number> = {
    '/locacoes': locacoes.filter((l) => l.status !== 'Encerrado').length,
    '/chamados': chamados.filter((c) => c.status !== 'Fechado').length,
    '/clientes': chamados.filter((c) => c.abertoViaPortal && c.status !== 'Fechado').length,
  }
  return (
    <nav className={`flex-1 px-3 ${py} space-y-1.5 overflow-y-auto`}>
      <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
        Menu Principal
      </div>
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
              isActive
                ? 'text-white bg-slate-800/80 shadow-sm'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.06]',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />
              )}
              <div className="flex items-center gap-3 min-w-0">
                <item.icon
                  className={cn(
                    'w-5 h-5 shrink-0 transition-colors',
                    isActive ? 'text-blue-400' : 'text-[#94A3B8] group-hover:text-white',
                  )}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {contadores[item.path] !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full shrink-0',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700',
                  )}
                >
                  {contadores[item.path]}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
