import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppDataProvider } from './state/AppDataContext'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import ChamadosCentral from './pages/ChamadosCentral'
import PortalCliente from './pages/PortalCliente'
import Relatorios from './pages/Relatorios'
import LocacoesGestao from './pages/LocacoesGestao'
import GestaoResultados from './pages/GestaoResultados'
import MapaFiliais from './pages/MapaFiliais'
import PainelTv from './pages/PainelTv'
import { TitulosPagar, TitulosReceber } from './pages/TitulosFinanceiro'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      {/* Estado compartilhado da sessão (mocks em memória, sem persistência) */}
      <AppDataProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/locacoes" element={<LocacoesGestao />} />
            <Route path="/chamados" element={<ChamadosCentral />} />
            <Route path="/clientes" element={<PortalCliente />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/gestao" element={<GestaoResultados />} />
            <Route path="/mapa" element={<MapaFiliais />} />
            <Route path="/financeiro/pagar" element={<TitulosPagar />} />
            <Route path="/financeiro/receber" element={<TitulosReceber />} />
          </Route>
          {/* Painel TV fora do layout: modo tela cheia para monitor/TV */}
          <Route path="/tv" element={<PainelTv />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppDataProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
