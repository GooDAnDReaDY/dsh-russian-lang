export function filterPlugins(plugins = [], query = '', statusFilter = 'all') {
  const q = String(query).toLowerCase().trim()
  return plugins.filter(p => p && (statusFilter === 'all' || p.status === statusFilter) &&
    (!q || (p.packageName || '').toLowerCase().includes(q) || (p.namespace || '').toLowerCase().includes(q) || (p.label || '').toLowerCase().includes(q)))
}

export function getPluginStatusBadge(status) {
  switch (status) {
    case 'full':
      return { label: '100%', bg: 'color-mix(in srgb, var(--dsw-alias-state-success-primary, #4ade80) 15%, transparent)', color: '#4ade80', text: 'Полный' }
    case 'partial':
      return { label: 'Частично', bg: 'color-mix(in srgb, var(--dsw-alias-state-warn-primary, #facc15) 15%, transparent)', color: '#facc15', text: 'Частичный' }
    case 'headless':
      return { label: 'Серверный', bg: 'var(--dsw-alias-bg-layer-3, #94a3b826)', color: 'var(--dsw-alias-label-secondary, #94a3b8)', text: 'Без UI' }
    case 'unverified':
      return { label: 'Оригинал', bg: 'color-mix(in srgb, var(--dsw-alias-brand-primary, #818cf8) 15%, transparent)', color: '#818cf8', text: 'В процессе' }
    default:
      return { label: '0%', bg: 'color-mix(in srgb, var(--dsw-alias-state-error-primary, #f87171) 15%, transparent)', color: '#f87171', text: 'Отсутствует' }
  }
}
