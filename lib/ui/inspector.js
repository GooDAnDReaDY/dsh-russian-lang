import { INSPECTOR_STYLES } from './styles.js'

export function getOrCreateInspectorHost(doc = (typeof document !== 'undefined' ? document : null)) {
  if (!doc) return null
  let host = doc.getElementById('dsh-ru-inspector-host')
  if (!host) {
    host = doc.createElement('div')
    host.id = 'dsh-ru-inspector-host'
    if (typeof host.setAttribute === 'function') host.setAttribute('data-dsh-ru-version', '__PKG_VERSION__')
    if (host.style) host.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483647;pointer-events:none;'
    if (typeof host.attachShadow === 'function') {
      try {
        const shadow = host.attachShadow({ mode: 'open' })
        const style = doc.createElement('style')
        style.textContent = INSPECTOR_STYLES
        if (typeof shadow.appendChild === 'function') shadow.appendChild(style)
        if (doc.body?.appendChild) doc.body.appendChild(host)
        return shadow
      } catch (_) {}
    }
    if (doc.body?.appendChild) doc.body.appendChild(host)
  }
  return host.shadowRoot || host
}

export function createInspectorPillElement(opts = {}) {
  const onToggle = typeof opts.onToggle === 'function' ? opts.onToggle : () => {}
  const isActive = Boolean(opts.isActive)
  const doc = opts.doc || (typeof document !== 'undefined' ? document : null)
  if (!doc) return { type: 'inspector-pill', isActive, title: 'Инспектор перевода' }
  const pill = doc.createElement('div')
  pill.id = 'dsh-ru-inspector-pill'
  pill.className = 'rl-inspector-pill' + (isActive ? ' rl-inspector-pill-active' : '')
  pill.innerHTML = '<span>🔍 Инспектор</span><button type="button" class="rl-btn rl-pill-exit" style="padding:2px 8px;font-size:11px;height:22px;">✕ Выйти (Alt+I)</button>'
  const exitBtn = pill.querySelector('.rl-pill-exit')
  const exitHandler = (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (e?.stopPropagation) e.stopPropagation()
    onToggle(false)
  }
  if (exitBtn) {
    if (typeof exitBtn.addEventListener === 'function') exitBtn.addEventListener('click', exitHandler)
    else exitBtn.onclick = exitHandler
  }
  return pill
}
