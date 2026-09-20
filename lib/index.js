import crypto from 'node:crypto'
import { registerPluginUpdater } from './plugin-updater.js'
import { registerTranslator } from './translator.js'
import { getCoreDictionaries, getPluginDictionaries, getPluginDictionariesByNames, getZhRuMap } from './locales.js'
// dsh-russian-lang — серверная половина.
//
// Словари и переключатель живут в браузере (lib/client.js). Хосту переводить
// нечего, но у выбора языка есть сохраняемая настройка: регистрируем её схему
// в собственном namespace, чтобы запись переживала браузеры и машины череж
// штатный механизм настроек DSH.
import z from '@deepseek-ai/schemastery'
import { SYSTEM_PROMPT_PRESETS } from './pure.js'


const sendJsonWithEtag = (request, response, obj, maxAge = 300) => {
  const body = Buffer.from(JSON.stringify(obj), 'utf-8')
  const etag = '"' + crypto.createHash('md5').update(body).digest('hex') + '"'
  const ifNoneMatch = request?.headers?.['if-none-match']
  if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === '*' || ifNoneMatch === `W/${etag}`)) {
    response.writeHead(304, {
      'etag': etag,
      'cache-control': `public, max-age=${maxAge}, must-revalidate`,
    })
    response.end()
    return
  }
  response.writeHead(200, {
    'content-type': 'application/json; charset=utf-8',
    'etag': etag,
    'cache-control': `public, max-age=${maxAge}, must-revalidate`,
    'content-length': body.length,
  })
  response.end(body)
}

export const name = '@goodandready/dsh-russian-lang'

const RussianLangSettingsSchema = z.object({
  enabled: z.boolean().required(false),
  overrides: z.dict(z.string()).required(false),
  typography: z.object({
    enabled: z.boolean().required(false),
    yo: z.boolean().required(false),
    liveInput: z.boolean().required(false)
  }).required(false),
  agentPrompt: z.boolean().required(false),
  agentPromptPreset: z.string().required(false),
  slashAliases: z.boolean().required(false),
  quickSwitch: z.boolean().required(false),
  translateEngine: z.string().required(false),
  localApiUrl: z.string().required(false)
})

export function apply(ctx) {
  let globalSettingsCtx = null
  ctx.inject(['settings'], (settingsCtx) => {
    globalSettingsCtx = settingsCtx
    settingsCtx.settings.register('russian-lang', RussianLangSettingsSchema)
  })

  // #68: русский системный промпт агента (опционально). Регистрируем секцию
  // промпта, которая задёт стиль ответов по-русски, когда включён флаг
  // russian-lang.agentPrompt. Секция — официальная точка расширения ядра.
  ctx.inject(['settings', 'systemPrompt'], (settingsCtx, prompt) => {
    const NS = 'russian-lang'
    const RU_SECTION = 'dsh-russian-lang-agent-prompt'
    const DEFAULT_RU_TEXT = 'Отвечай пользователю на русском языке. Если пользователь пишет на другом языке, отвечай на его языке.'
    let currentText = ''
    const sync = () => {
      const value = settingsCtx.settings.get(NS)
      const want = !!(value && value.agentPrompt)
      const presetKey = value && value.agentPromptPreset
      const preset = SYSTEM_PROMPT_PRESETS[presetKey]
      const text = want ? (preset ? preset.text : DEFAULT_RU_TEXT) : ''
      if (text === currentText) return
      currentText = text
      prompt.section({ name: RU_SECTION, order: 1000, text })
    }
    ctx.on('settings/updated', (ns) => { if (ns === NS) sync() })
    sync()
  })

  // Web endpoints: One-click plugin updater, modular lazy-plugin dictionary serving, & translator gateway
  if (typeof ctx.inject === 'function') {
    ctx.inject(['webServer'], (wctx) => {
      try {
        const mount = () => {
          const unregUpdater = registerPluginUpdater(wctx, {
            endpoint: '/api/dsh-russian-lang/update',
            packageName: '@goodandready/dsh-russian-lang',
            manifestUrl: new URL('../package.json', import.meta.url),
          })

          const unregTranslator = registerTranslator(wctx, globalSettingsCtx)

          let ws = null
          try { ws = wctx?.webServer } catch (_) { ws = null }

          const unregsDict = []
          if (ws && typeof ws.register === 'function') {
            // 1. Core dictionary only (fast-boot, ~135 KB)
            unregsDict.push(ws.register({
              kind: 'exact',
              path: '/api/dsh-russian-lang/dict/core',
              handler: async (request, response) => {
                try {
                  const core = getCoreDictionaries()
                  const zhRu = getZhRuMap()
                  sendJsonWithEtag(request, response, { core, zhRu })
                } catch (err) {
                  response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
                  response.end(JSON.stringify({ error: String(err) }))
                }
              },
            }))

            // 2. On-demand plugins dictionary serving (query: ?names=p1,p2...)
            unregsDict.push(ws.register({
              kind: 'prefix',
              path: '/api/dsh-russian-lang/dict/plugins',
              handler: async (request, response) => {
                try {
                  const url = new URL(request.url, 'http://localhost')
                  const namesParam = url.searchParams.get('names') || url.searchParams.get('list') || ''
                  const names = namesParam ? namesParam.split(',').map((s) => s.trim()).filter(Boolean) : null
                  const plugins = getPluginDictionariesByNames(names)
                  sendJsonWithEtag(request, response, { plugins })
                } catch (err) {
                  response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
                  response.end(JSON.stringify({ error: String(err) }))
                }
              },
            }))

            // 3. Backward compatibility all-dictionaries endpoint
            unregsDict.push(ws.register({
              kind: 'exact',
              path: '/api/dsh-russian-lang/dict/all',
              handler: async (request, response) => {
                try {
                  const core = getCoreDictionaries()
                  const plugins = getPluginDictionaries()
                  const zhRu = getZhRuMap()
                  sendJsonWithEtag(request, response, Object.assign({}, core, plugins, { core, plugins, zhRu }))
                } catch (err) {
                  response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
                  response.end(JSON.stringify({ error: String(err) }))
                }
              },
            }))
          }

          return () => {
            if (typeof unregUpdater === 'function') unregUpdater()
            if (typeof unregTranslator === 'function') unregTranslator()
            for (const u of unregsDict) {
              if (typeof u === 'function') u()
            }
          }
        }
        if (typeof wctx.effect === 'function') wctx.effect(mount, 'russian-lang: web routes')
        else mount()
      } catch (err) {
        if (typeof wctx.logger?.warn === 'function') {
          wctx.logger.warn('Failed to mount web routes:', err)
        }
      }
    })
  }
}
