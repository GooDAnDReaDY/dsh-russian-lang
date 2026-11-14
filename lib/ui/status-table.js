export function filterPlugins(plugins = [], query = '', statusFilter = 'all') {
  const q = String(query).toLowerCase().trim()
  return plugins.filter(p => p && (statusFilter === 'all' || p.status === statusFilter) &&
    (!q || (p.packageName || '').toLowerCase().includes(q) || (p.namespace || '').toLowerCase().includes(q) || (p.label || '').toLowerCase().includes(q)))
}

export function getPluginStatusBadge(status) {
  switch (status) {
    case 'full':
      return { label: '100%', bg: 'color-mix(in srgb, var(--dsw-alias-state-success-primary) 15%, transparent)', color: 'var(--dsw-alias-state-success-primary)', text: 'Полный' }
    case 'partial':
      return { label: 'Частично', bg: 'color-mix(in srgb, var(--dsw-alias-state-warn-primary) 15%, transparent)', color: 'var(--dsw-alias-state-warn-primary)', text: 'Частичный' }
    case 'headless':
      return { label: 'Серверный', bg: 'var(--dsw-alias-bg-layer-3)', color: 'var(--dsw-alias-label-secondary)', text: 'Без UI' }
    case 'unverified':
      return { label: 'Оригинал', bg: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 15%, transparent)', color: 'var(--dsw-alias-brand-primary)', text: 'В процессе' }
    default:
      return { label: '0%', bg: 'color-mix(in srgb, var(--dsw-alias-state-error-primary) 15%, transparent)', color: 'var(--dsw-alias-state-error-primary)', text: 'Отсутствует' }
  }
}
