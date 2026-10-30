/**
 * Русские слэш-команды для DeepSeek Harness (@deepseek-ai/dsh-commands).
 * Реализация issue #548: поддержка официального API commands.execute(agent, line, attachments, signal).
 */

export const SLASH_ALIASES = [
  { name: 'цель', target: 'goal', desc: 'Автономный режим целей и задач', hint: '<цель>' },
  { name: 'план', target: 'plan', desc: 'Планирование и декомпозиция задач', hint: '<план>' },
  { name: 'память', target: 'memory', desc: 'Управление долговременной памятью', hint: '<действие>' },
  { name: 'контекст', target: 'context', desc: 'Анализ и сжатие контекста' },
  { name: 'сжать', target: 'compact', desc: 'Сжатие контекста истории диалога' },
  { name: 'очистить', target: 'clear', desc: 'Очистка истории диалога' },
  { name: 'команда', target: 'teamwork', desc: 'Командное взаимодействие субагентов' },
  { name: 'справка', target: 'help', desc: 'Справка по доступным командам' },
  { name: 'помощь', target: 'help', desc: 'Справка по доступным командам' },
  { name: 'задача', target: 'task', desc: 'Управление текущей задачей', hint: '<описание>' },
  { name: 'экспорт', target: 'export', desc: 'Экспорт диалога в файл', hint: '<формат>' },
  { name: 'отзыв', target: 'feedback', desc: 'Обратная связь' },
  { name: 'разрешение', target: 'permission', desc: 'Настройки песочницы и подтверждений', hint: '<preset>' },
  { name: 'разрешения', target: 'permission', desc: 'Настройки песочницы и подтверждений', hint: '<preset>' },
  { name: 'сессия', target: 'session', desc: 'Управление текущей сессией' },
  { name: 'модель', target: 'model', desc: 'Выбор модели LLM' }
]

export function registerSlashAliases(ctx, readSettings) {
  const commands = ctx?.commands || ctx?.['commands'] || (typeof ctx?.get === 'function' ? ctx.get('commands') : null)
  if (!commands || typeof commands.register !== 'function') return () => {}

  const disposers = []
  for (const alias of SLASH_ALIASES) {
    try {
      const disp = commands.register({
        name: alias.name,
        description: alias.desc,
        input: alias.hint ? { hint: alias.hint } : undefined,
        handler: async (invocation) => {
          if (typeof readSettings === 'function') {
            const settings = readSettings()
            if (settings && settings.slashAliases === false) {
              return {
                kind: 'error',
                text: 'Русские слэш-команды отключены в настройках dsh-russian-lang.'
              }
            }
          }

          const raw = typeof invocation?.rawInput === 'string'
            ? invocation.rawInput
            : (typeof invocation?.args === 'string' ? invocation.args : '')
          const line = '/' + alias.target + (raw ? (raw.startsWith(' ') ? raw : ' ' + raw) : '')
          const attachments = Array.isArray(invocation?.attachments) ? invocation.attachments : []
          const signal = invocation?.signal || (typeof AbortController !== 'undefined' ? new AbortController().signal : undefined)
          const agent = invocation?.agent || (invocation?.session?.agent) || (invocation?.session) || {}

          // 1. DSH official execution API: execute(agent, line, attachments, signal)
          if (typeof commands.execute === 'function') {
            let execRes
            // Support both official 4-arg DSH API and 2-arg mock execute(target, invocation)
            if (commands.execute.length === 2) {
              execRes = await commands.execute(alias.target, invocation)
            } else {
              try {
                execRes = await commands.execute(agent, line, attachments, signal)
              } catch (e) {
                try {
                  execRes = await commands.execute(alias.target, invocation)
                } catch (_) {
                  throw e
                }
              }
            }
            if (execRes && typeof execRes === 'object') {
              if (execRes.result && typeof execRes.result === 'object') return execRes.result
              return execRes
            }
            return { kind: 'success', text: String(execRes || '') }
          }

          // 2. Direct lookup via commands.view(agent)
          if (typeof commands.view === 'function') {
            try {
              const view = commands.view(agent)
              const targetCmd = view?.get ? view.get(alias.target) : null
              if (targetCmd?.definition?.handler) {
                return await targetCmd.definition.handler({
                  agent,
                  rawInput: raw,
                  attachments,
                  signal
                })
              }
            } catch (_) {}
          }

          // 3. session.executeCommand
          const session = invocation?.session || invocation?.agent?.session
          if (typeof session?.executeCommand === 'function') {
            return await session.executeCommand(alias.target, raw)
          }

          // 4. commands.registered array lookup
          if (commands.registered && typeof commands.registered.find === 'function') {
            const targetDef = commands.registered.find((c) => c.name === alias.target)
            if (targetDef && typeof targetDef.handler === 'function') {
              return await targetDef.handler(invocation)
            }
          }

          // 5. commands.get(name) lookup
          if (typeof commands.get === 'function') {
            const targetDef = commands.get(alias.target)
            if (targetDef && typeof targetDef.handler === 'function') {
              return await targetDef.handler(invocation)
            }
          }

          return {
            kind: 'error',
            text: `Команда /${alias.target} недоступна в текущем окружении.`
          }
        }
      })
      if (typeof disp === 'function') disposers.push(disp)
    } catch (_) { /* bestEffort */ }
  }

  return () => {
    for (const d of disposers) {
      try { d() } catch (_) {}
    }
  }
}
