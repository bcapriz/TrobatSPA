import type { Reporte } from '../../../domain/models'

const COLORS = {
  high: '#ef4444',
  medium: '#22c55e',
  discarded: '#6b7280',
  pending: '#6c63ff',
}

function getColor(reporte: Reporte): string {
  if (reporte.priority === 'high') return COLORS.high
  if (reporte.priority === 'medium') return COLORS.medium
  if (reporte.priority === 'discarded') return COLORS.discarded
  return COLORS.pending
}

export function MarkerPin({ reporte }: { reporte: Reporte }) {
  const color = getColor(reporte)

  return (
    <div style={{ position: 'relative', width: 20, height: 20, cursor: 'pointer' }}>
      <div
        className="marker-pulse-ring"
        style={{
          position: 'absolute',
          inset: -5,
          borderRadius: '50%',
          background: color,
        }}
      />
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: color,
          border: '2.5px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  )
}
