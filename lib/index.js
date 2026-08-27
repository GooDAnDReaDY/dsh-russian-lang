// dsh-russian-lang — серверная половина.
//
// Словари и переключатель живут в браузере (lib/client.js). Хосту переводить
// нечего, но у выбора языка есть сохраняемая настройка: регистрируем её схему
// в собственном namespace, чтобы запись переживала браузеры и машины через
// штатный механизм настроек DSH.
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

export const name = '@goodandready/dsh-russian-lang'

const RussianLangSettingsSchema = z.object({
  enabled: z.boolean().required(false),
  overrides: z.dict(z.string()).required(false),
  typography: z.object({
    enabled: z.boolean().required(false),
    yo: z.boolean().required(false)
  }).required(false),
  agentPrompt: z.boolean().required(false)
})

export function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(settingsNamespace('russian-lang'), RussianLangSettingsSchema)
  })

  // #68: русский системный промпт агента (опционально). Регистрируем секцию
  // промпта, которая просит отвечать по-русски, когда включён флаг
  // russian-lang.agentPrompt. Секция — официальная точка расширения ядра.
  ctx.inject(['settings', 'systemPrompt'], (settingsCtx, prompt) => {
    const NS = settingsNamespace('russian-lang')
    const RU_SECTION = 'dsh-russian-lang-agent-prompt'
    const RU_TEXT = 'Отвечай пользователю на русском языке. Если пользователь пишет на другом языке, отвечай на его языке.'
    let current = false
    const sync = () => {
      const value = settingsCtx.settings.get(NS)
      const want = !!(value && value.agentPrompt)
      if (want === current) return
      current = want
      prompt.section({ name: RU_SECTION, order: 1000, text: want ? RU_TEXT : '' })
    }
    ctx.on('settings/updated', (ns) => { if (ns === NS) sync() })
    sync()
  })
}
