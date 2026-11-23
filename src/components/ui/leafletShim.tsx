// Reexports de runtime do react-leaflet + aliases de tipos.
// Na v5 os props `center`, `attribution`, `icon` e `direction` funcionam em
// runtime (passados como options do Leaflet), mas o TypeScript não os expõe
// nas props dos componentes. Os casts abaixo apenas reabrem esses props para
// o compilador — nenhuma lógica aqui.
import {
  MapContainer as MapContainerComponent,
  TileLayer as TileLayerComponent,
  Marker as MarkerComponent,
  Tooltip as TooltipComponent,
  Popup,
} from 'react-leaflet'
import type { ComponentProps, ReactElement } from 'react'

type MapContainerPropsAbrangente = ComponentProps<typeof MapContainerComponent> & {
  center?: [number, number]
  zoom?: number
  scrollWheelZoom?: boolean
}

type TileLayerPropsAbrangente = ComponentProps<typeof TileLayerComponent> & {
  attribution?: string
  url?: string
}

type MarkerPropsAbrangente = ComponentProps<typeof MarkerComponent> & {
  icon?: unknown
  position: [number, number]
  eventHandlers?: Record<string, (e: unknown) => void>
}

type TooltipPropsAbrangente = ComponentProps<typeof TooltipComponent> & {
  direction?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto'
  offset?: [number, number]
}

export const MapContainer = MapContainerComponent as unknown as (
  props: MapContainerPropsAbrangente,
) => ReactElement
export const TileLayer = TileLayerComponent as unknown as (
  props: TileLayerPropsAbrangente,
) => ReactElement
export const Marker = MarkerComponent as unknown as (props: MarkerPropsAbrangente) => ReactElement
export const Tooltip = TooltipComponent as unknown as (
  props: TooltipPropsAbrangente,
) => ReactElement
export { Popup }
