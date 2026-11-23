import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { LocacoesPage, ChamadosPage, ClientesPage, RelatoriosPage } from './pages/Placeholders'
import GestaoResultados from './pages/GestaoResultados'
import MapaFiliais from './pages/MapaFiliais'
import PainelTv from './pages/PainelTv'
import { TitulosPagar, TitulosReceber } from './pages/TitulosFinanceiro'

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/locacoes" element={<LocacoesPage />} />
          <Route path="/chamados" element={<ChamadosPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/gestao" element={<GestaoResultados />} />
          <Route path="/mapa" element={<MapaFiliais />} />
          <Route path="/financeiro/pagar" element={<TitulosPagar />} />
          <Route path="/financeiro/receber" element={<TitulosReceber />} />
        </Route>
        {/* Painel TV fora do layout: modo tela cheia para monitor/TV */}
        <Route path="/tv" element={<PainelTv />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
