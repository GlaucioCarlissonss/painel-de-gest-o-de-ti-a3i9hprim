// Micro-gráficos leves (sparklines e barras) sem dependência de biblioteca.
// Usados na Visão de Resultado e no Painel TV.

export function Sparkline({
  data,
  stroke = '#2563EB',
  fill = 'rgba(37, 99, 235, 0.10)',
  width = 120,
  height = 36,
  className = '',
}: {
  data: number[]
  stroke?: string
  fill?: string
  width?: number
  height?: number
  className?: string
}) {
  if (data.length === 0) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = width / (data.length - 1 || 1)
  const points = data.map((v, i) => {
    const x = i * step
    const y = height - 3 - ((v - min) / range) * (height - 6)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = `M ${points.join(' L ')}`
  const area = `${line} L ${width},${height} L 0,${height} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      role="img"
    >
      <path d={area} fill={fill} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MiniBarChart({
  data,
  barColor = '#2563EB',
  width = 120,
  height = 36,
  className = '',
}: {
  data: number[]
  barColor?: string
  width?: number
  height?: number
  className?: string
}) {
  if (data.length === 0) return null
  const max = Math.max(...data) || 1
  const gap = 4
  const barWidth = Math.max(3, (width - gap * (data.length - 1)) / data.length)

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      role="img"
    >
      {data.map((v, i) => {
        const h = Math.max(3, (v / max) * height)
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={height - h}
            width={barWidth}
            height={h}
            rx={2}
            fill={barColor}
          />
        )
      })}
    </svg>
  )
}
