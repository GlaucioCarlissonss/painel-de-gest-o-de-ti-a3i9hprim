// Mapa das Filiais — Leaflet + OpenStreetMap (sem chave de API).
// Pinos customizados coloridos por status; clique abre o card de detalhe.
import { useMemo, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from '@/components/ui/leafletShim'
import { MapPin, Wrench, Monitor, Ticket, User } from 'lucide-react'
import { MOCK_FILIAIS, Filial } from '@/data/gestaoData'
import { CORES_STATUS_FILIAL as CORES } from '@/components/badges'
import { BadgeStatusFilial } from '@/components/badges'
import { cn } from '@/lib/utils'

function criarIconePino(status: Filial['status']) {
  const cor = CORES[status]
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${cor.fill};border:3px solid white;box-shadow:0 1px 6px rgba(0,0,0,.45), 0 0 0 1px ${cor.stroke};"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

const CENTRO_BRASIL: L.LatLngExpression = [-14.2, -49.5]

export default function MapaFiliais() {
  const [selecionada, setSelecionada] = useState<Filial | null>(null)
  const [filtro, setFiltro] = useState<'todos' | Filial['status']>('todos')

  const contadores = useMemo(
    () => ({
      todos: MOCK_FILIAIS.length,
      ok: MOCK_FILIAIS.filter((f) => f.status === 'ok').length,
      risco: MOCK_FILIAIS.filter((f) => f.status === 'risco').length,
      critico: MOCK_FILIAIS.filter((f) => f.status === 'critico').length,
    }),
    [],
  )

  const filiaisFiltradas =
    filtro === 'todos' ? MOCK_FILIAIS : MOCK_FILIAIS.filter((f) => f.status === filtro)

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Mapa das Filiais
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Filiais e clientes com equipamentos locados, coloridos por situação operacional
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          Dados de demonstração
        </span>
      </div>

      {/* Legenda de cores (verde/âmbar/vermelho) */}
      <div className="flex flex-wrap items-center gap-3">
        {(['ok', 'risco', 'critico'] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="w-3 h-3 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: CORES[s].fill }}
            />
            {CORES[s].label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Mapa (2/3) */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <MapContainer
            center={CENTRO_BRASIL}
            zoom={4}
            scrollWheelZoom={false}
            className="w-full h-[420px] sm:h-[520px] z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filiaisFiltradas.map((fil) => (
              <Marker
                key={fil.id}
                position={[fil.latitude, fil.longitude]}
                icon={criarIconePino(fil.status)}
                eventHandlers={{ click: () => setSelecionada(fil) }}
              >
                <Tooltip direction="top" offset={[0, -10]}>
                  {fil.nome} — {fil.cidade}/{fil.estado}
                </Tooltip>
                <Popup>
                  <strong>{fil.nome}</strong>
                  <br />
                  {fil.cidade}/{fil.estado} · {fil.equipamentosLocados} equipamentos
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Lista lateral com contadores (1/3) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-semibold text-slate-900">Filiais</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {MOCK_FILIAIS.length}
              </span>
            </div>
            {/* Contadores por status */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {(['todos', 'ok', 'risco', 'critico'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFiltro(s)}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-center transition-colors',
                    filtro === s
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                  )}
                >
                  <div
                    className={cn(
                      'text-lg font-bold leading-none',
                      s === 'critico' && contadores[s] > 0 && 'text-red-600',
                      s === 'risco' && contadores[s] > 0 && 'text-amber-600',
                      s !== 'critico' && s !== 'risco' && 'text-slate-900',
                    )}
                  >
                    {contadores[s]}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500 mt-1">
                    {s === 'ok'
                      ? 'OK'
                      : s === 'critico'
                        ? 'Crítico'
                        : s === 'risco'
                          ? 'Risco'
                          : 'Todas'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lista rolável de filiais */}
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px] flex-1">
            {filiaisFiltradas.map((fil) => (
              <button
                key={fil.id}
                type="button"
                onClick={() => setSelecionada(fil)}
                className={cn(
                  'w-full text-left p-4 transition-colors flex items-start gap-3',
                  selecionada?.id === fil.id ? 'bg-blue-50/70' : 'hover:bg-slate-50/80',
                )}
              >
                <span
                  className="mt-1 w-3 h-3 rounded-full border-2 border-white shadow shrink-0"
                  style={{ backgroundColor: CORES[fil.status].fill }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">{fil.nome}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {fil.cidade}/{fil.estado}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Monitor className="w-3 h-3" /> {fil.equipamentosLocados} equip.
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Ticket className="w-3 h-3" /> {fil.chamadosAbertos} chamados
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card de detalhe da filial selecionada */}
      {selecionada && (
        <section
          aria-label="Detalhe da filial"
          className="bg-white rounded-xl border border-slate-200 shadow-md p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{selecionada.nome}</h2>
                <BadgeStatusFilial status={selecionada.status} />
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {selecionada.cidade}/{selecionada.estado} · Cliente: {selecionada.cliente}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelecionada(null)}
              className="self-start text-xs font-medium text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <Monitor className="w-4 h-4 text-blue-600" /> Equipamentos locados
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {selecionada.equipamentosLocados}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <Ticket className="w-4 h-4 text-indigo-600" /> Chamados abertos
              </div>
              <div className="text-2xl font-bold text-slate-900">{selecionada.chamadosAbertos}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <User className="w-4 h-4 text-emerald-600" /> Técnico responsável
              </div>
              <div className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-400" />
                {selecionada.tecnicoResponsavel}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
