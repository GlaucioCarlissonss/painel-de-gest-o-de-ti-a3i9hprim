import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Box,
  Ticket,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  Monitor,
} from 'lucide-react'
import { USUARIO_LOGADO, MOCK_LOCACOES, MOCK_CHAMADOS } from '@/data/mockData'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface NavItemConfig {
  path: string
  label: string
  icon: React.ElementType
  badgeCount?: number
}

const navItems: NavItemConfig[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/locacoes', label: 'Locações', icon: Box, badgeCount: MOCK_LOCACOES.length },
  { path: '/chamados', label: 'Chamados', icon: Ticket, badgeCount: MOCK_CHAMADOS.length },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3 },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()

  const isCurrentActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleNavClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] text-[#0F172A] font-sans antialiased">
      {/* Sidebar Desktop (Fixed width 260px, dark navy #0F172A) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[260px] lg:fixed lg:inset-y-0 bg-[#0F172A] text-slate-100 border-r border-slate-800 z-30 select-none">
        {/* Brand block */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800/80">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-md shadow-blue-900/30 text-white shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-semibold tracking-tight text-white leading-tight truncate">
              {USUARIO_LOGADO.empresa}
            </span>
            <span className="text-xs text-slate-400 font-normal leading-tight truncate">
              {USUARIO_LOGADO.subtitulo}
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const active = isCurrentActive(item.path)
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'text-white bg-slate-800/80 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {/* Active indicator bar on the left */}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />
                )}
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 transition-colors shrink-0 ${
                      active ? 'text-blue-400' : 'text-[#94A3B8] group-hover:text-white'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badgeCount !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom User Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs shrink-0">
                {USUARIO_LOGADO.iniciais}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {USUARIO_LOGADO.nome}
                </span>
                <span className="text-[11px] text-slate-400 truncate">{USUARIO_LOGADO.cargo}</span>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="Sair da sessão"
                  className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  onClick={() => alert('Sessão de demonstração ativa.')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Sair (Demo)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header (screen < 1024px) */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-16 bg-[#0F172A] text-white border-b border-slate-800 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shrink-0">
              <Monitor className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-white">
              {USUARIO_LOGADO.empresa}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-medium bg-blue-900/60 text-blue-200 border border-blue-700/50 rounded-full">
            Demonstração
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center text-xs font-semibold">
            {USUARIO_LOGADO.iniciais}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 bg-[#0F172A] text-slate-100 z-50 flex flex-col transform transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-tight">
                {USUARIO_LOGADO.empresa}
              </div>
              <div className="text-[11px] text-slate-400">{USUARIO_LOGADO.subtitulo}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Menu Principal
          </div>
          {navItems.map((item) => {
            const active = isCurrentActive(item.path)
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'text-white bg-slate-800 shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />
                )}
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-[#94A3B8]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                      active ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center text-xs font-semibold">
                {USUARIO_LOGADO.iniciais}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{USUARIO_LOGADO.nome}</div>
                <div className="text-[10px] text-slate-400">{USUARIO_LOGADO.cargo}</div>
              </div>
            </div>
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-white"
              onClick={() => alert('Sessão de demonstração ativa.')}
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px]">
        {/* Top Bar for Desktop and Tablet (with Search, Bell and Demo pill) */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 mt-16 lg:mt-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar equipamentos, chamados, clientes…"
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Notificações"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Sem novas notificações</p>
              </TooltipContent>
            </Tooltip>

            {/* Demo indicator pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Dados de demonstração</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Global Footer note */}
        <footer className="px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-200 bg-white/50 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ITLoc Gestão v1.0 · Sistema de Locação de Equipamentos de TI & Service Desk</span>
          <span className="text-slate-400">Ambiente de Demonstração (Mocks em memória)</span>
        </footer>
      </div>
    </div>
  )
}
