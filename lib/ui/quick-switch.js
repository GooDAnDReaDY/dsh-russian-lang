export function createQuickSwitchElement(opts = {}) {
  const cur = opts.currentLang || 'ru'
  const onToggle = typeof opts.onToggle === 'function' ? opts.onToggle : () => {}
  const doc = opts.doc || (typeof document !== 'undefined' ? document : null)
  if (!doc) return { type: 'quick-switch', lang: cur, label: cur === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN' }
  const el = doc.createElement('button')
  el.id = 'dsh-ru-quick-switch'
  el.className = 'rl-quick-switch' + (cur === 'ru' ? ' rl-quick-switch-active' : '')
  if (typeof el.setAttribute === 'function') {
    el.setAttribute('type', 'button')
    el.setAttribute('title', 'Быстрое переключение языка интерфейса (RU/EN)')
  }
  el.textContent = cur === 'ru' ? '🇷🇺 RU' : '🇬🇧 EN'
  const click = (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (e?.stopPropagation) e.stopPropagation()
    const next = (el.textContent || '').includes('RU') ? 'en' : 'ru'
    updateQuickSwitchElement(el, next)
    onToggle(next)
  }
  if (typeof el.addEventListener === 'function') el.addEventListener('click', click)
  else el.onclick = click
  return el
}

export function updateQuickSwitchElement(el, lang) {
  if (!el) return
  const isRu = lang === 'ru'
  el.textContent = isRu ? '🇷🇺 RU' : '🇬🇧 EN'
  if (el.classList?.toggle) el.classList.toggle('rl-quick-switch-active', isRu)
  else if (el.classList) isRu ? el.classList.add('rl-quick-switch-active') : el.classList.remove('rl-quick-switch-active')
}
