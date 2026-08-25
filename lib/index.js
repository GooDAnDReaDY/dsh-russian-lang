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
  }).required(false)
})

export function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(settingsNamespace('russian-lang'), RussianLangSettingsSchema)
  })
}
