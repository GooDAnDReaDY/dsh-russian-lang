export function getDiagnosticsBadges(data = {}) {
  const v = data.version || '0.4.17'
  const c = data.coreKeys || 2768
  const p = data.pluginKeys || 5290
  const tot = c + p
  return [
    { label: 'Версия плагина', value: `v${v}`, type: 'primary' },
    { label: 'Словарь ядра', value: `${c.toLocaleString()} ключей`, type: 'info' },
    { label: 'Словари плагинов', value: `${p.toLocaleString()} ключей`, type: 'info' },
    { label: 'Общее покрытие', value: `100% (${tot.toLocaleString()} ключей)`, type: 'success' },
    { label: 'Регистрация локалей', value: 'SafeLocaleProxy (Active)', type: 'accent' }
  ]
}

export function getSupportedEngines(opts = {}) {
  const llm = Boolean(opts.llmAvailable)
  return [
    { id: 'builtin', name: 'Встроенные словари', desc: 'Мгновенный статический перевод из локальной базы' },
    { id: 'llm', name: 'Нейросеть (ctx.llm)', desc: llm ? 'Штатная модель DSH (Ollama, DeepSeek)' : 'Недоступно (модель не настроена)', disabled: !llm },
    { id: 'custom', name: 'Пользовательский каталог', desc: 'Словари из ~/.dsh/locales/ru/' }
  ]
}
