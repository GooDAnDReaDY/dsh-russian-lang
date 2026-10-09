import crypto from 'node:crypto'
import { registerPluginUpdater } from './plugin-updater.js'
import { registerTranslator } from './translator.js'
import { getCoreDictionaries, getPluginDictionaries, getPluginDictionariesByNames, getAllDictionaries, getZhRuMap, getPluginsLocalizationOverview } from './locales.js'
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
  if (request?.method === 'HEAD') {
    response.end()
  } else {
    response.end(body)
  }
}

export const name = '@goodandready/dsh-russian-lang'

// Легаси-namespace настроек (DSH <= 0.1.6). Namespace форм на 0.1.7+ —
// id записи загрузчика ('dsh-russian-lang' из cordis.patch.yml), схема
// попадает туда через экспортированный Config ниже.
const NS = 'russian-lang'

// `.volatile()` есть только в новом schemastery; на старом его вызов
// бросает TypeError на уровне модуля — поэтому только feature-detect.
const vol = (s) => (typeof s?.volatile === 'function' ? s.volatile() : s)

// Unwrap Volatile boxes before any caller reads a value. A volatile field holds a box
// rather than its value, and the Loader mutates those boxes in place.
export function plainConfig(value) {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(plainConfig)
  if (typeof value.get === 'function') return plainConfig(value.get())
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plainConfig(v)]))
}

export const Config = z.object({
  enabled: vol(z.boolean().required(false)),
  overrides: vol(z.dict(z.string()).required(false)),
  typography: vol(z.object({
    enabled: z.boolean().required(false),
    yo: z.boolean().required(false),
    liveInput: z.boolean().required(false)
  }).required(false)),
  agentPrompt: vol(z.boolean().required(false)),
  agentPromptPreset: vol(z.string().required(false)),
  slashAliases: vol(z.boolean().required(false)),
  layoutConversion: vol(z.boolean().required(false)),
  quickSwitch: vol(z.boolean().required(false)),
  translateEngine: vol(z.string().required(false)),
  localApiUrl: vol(z.string().required(false))
})

// Историческое имя схемы; сама схема — Config выше.
const RussianLangSettingsSchema = Config

// Plain-схема для легаси-ветки register(): старый провайдер ждёт schemastery-схему,
// поэтому сериализуем, рекурсивно снимаем meta.volatile и рехидрируем обратно
// в схему — иначе volatile-поля остались бы рефами и сломали бы старое хранилище.
// Любая ошибка — возвращаем исходную схему, наружу не бросаем.
function plainSchema(schema) {
  try {
    const json = (schema && typeof schema.toJSON === 'function') ? schema.toJSON() : schema
    const clone = JSON.parse(JSON.stringify(json))
    const seen = new Set()
    const strip = (node) => {
      if (!node || typeof node !== 'object' || seen.has(node)) return
      seen.add(node)
      if (node.meta && typeof node.meta === 'object') {
        try { delete node.meta.volatile } catch (_) { /* bestEffort */ void _ }
      }
      for (const key of Object.keys(node)) strip(node[key])
    }
    strip(clone)
    return new z(clone)
  } catch (_) {
    return schema
  }
}

export function apply(ctx, config) {
  // Живой провайдер настроек; на 0.1.7+ у него есть configure(),
  // на старых — register()/get(). Пусто до первого inject.
  let settingsProvider = null

  // Единый снимок значений: на 0.1.7+ разворачиваем volatile-рефы второго
  // аргумента (ссылки стабильны — загрузчик обновляет их на месте),
  // на старой ветке читаем документ провайдера. Никогда не бросает.
  const readSettings = () => {
    try {
      const unwrap = (src) => {
        if (!src || typeof src !== 'object') return {}
        const out = {}
        for (const key of Object.keys(src)) {
          const v = src[key]
          out[key] = (v && typeof v.get === 'function') ? v.get() : v
        }
        return out
      }
      if (settingsProvider && typeof settingsProvider.configure === 'function') {
        return unwrap(config)
      }
      if (settingsProvider && typeof settingsProvider.get === 'function') {
        return settingsProvider.get(NS) || {}
      }
      return unwrap(config)
    } catch (_) {
      return {}
    }
  }

  ctx.inject(['settings'], (settingsCtx) => {
    let provider = null
    try {
      provider = settingsCtx?.settings
        ?? (typeof settingsCtx?.get === 'function' ? settingsCtx.get('settings') : null)
        ?? null
    } catch (_) { provider = null }
    settingsProvider = provider
    if (!provider) return
    try {
      if (typeof provider.configure === 'function') {
        // 0.1.7+: схема уже у загрузчика через экспортированный Config;
        // отключаем автогенерацию страницы (карточка у нас кастомная).
        if (typeof settingsCtx?.effect === 'function') {
          settingsCtx.effect(() => provider.configure({ auto: false }, ctx.fiber))
        } else {
          provider.configure({ auto: false }, ctx.fiber)
        }
      } else if (typeof provider.register === 'function') {
        // Легаси: plain-схема без volatile-мета.
        try {
          provider.register(NS, plainSchema(RussianLangSettingsSchema))
        } catch (_) {
          provider.register(NS, RussianLangSettingsSchema)
        }
      }
      // Иначе тихая деградация: readSettings вернёт {} / развернёт рефы.
    } catch (_) { /* never throw outwards */ void _ }
  })

  // #68: русский системный промпт агента (опционально). Регистрируем секцию
  // промпта, которая задёт стиль ответов по-русски, когда включён флаг
  // russian-lang.agentPrompt. Секция — официальная точка расширения ядра.
  // Значения — через readSettings() (volatile-рефы на 0.1.7+, документ
  // провайдера на легаси). Пересинхронизация: loader/volatile-update
  // (свой ctx, 0.1.7) и settings/updated (старые ядра).
  ctx.inject(['systemPrompt'], (promptCtx) => {
    let prompt = promptCtx?.systemPrompt
    try {
      if (!prompt && typeof promptCtx?.get === 'function') prompt = promptCtx.get('systemPrompt')
    } catch (_) { /* bestEffort */ void _ }
    if (!prompt || typeof prompt.section !== 'function') return
    const RU_SECTION = 'dsh-russian-lang-agent-prompt'
    const DEFAULT_RU_TEXT = 'Отвечай пользователю на русском языке. Если пользователь пишет на другом языке, отвечай на его языке.'
    let unregisterSection = null
    let currentText = ''
    const sync = () => {
      try {
        const value = readSettings()
        const want = !!(value && value.agentPrompt)
        const presetKey = value && value.agentPromptPreset
        const preset = SYSTEM_PROMPT_PRESETS[presetKey]
        const text = want ? (preset ? preset.text : DEFAULT_RU_TEXT) : ''
        if (text === currentText) return
        // section() не идемпотентен: повторная регистрация того же имени
        // бросает, поэтому сначала снимаем прежнюю секцию через disposer.
        if (typeof unregisterSection === 'function') {
          try { unregisterSection() } catch (_) { /* bestEffort */ void _ }
        }
        unregisterSection = null
        currentText = text
        // Выключение флага снимает секцию, а не пушит пустой текст.
        if (!text) return
        const dispose = prompt.section({ name: RU_SECTION, order: 1000, text })
        unregisterSection = typeof dispose === 'function' ? dispose : null
      } catch (_) { /* never throw outwards */ void _ }
    }
    try { ctx.on('loader/volatile-update', sync) } catch (_) { /* bestEffort */ void _ }
    try {
      ctx.on('settings/document-updated', (id) => {
        if (!id || id === NS || id === 'dsh-russian-lang') sync()
      })
    } catch (_) { /* bestEffort */ void _ }
    try {
      ctx.on('settings/updated', (ns) => {
        if (!ns || ns === NS || ns === 'dsh-russian-lang') sync()
      })
    } catch (_) { /* bestEffort */ void _ }
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

          const unregTranslator = registerTranslator(wctx, readSettings)

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
                  if (request.method !== 'GET' && request.method !== 'HEAD') {
                    response.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'application/json; charset=utf-8' })
                    response.end(JSON.stringify({ error: 'Method not allowed' }))
                    return
                  }
                  const core = getCoreDictionaries()
                  const zhRu = getZhRuMap()
                  sendJsonWithEtag(request, response, { core, zhRu })
                } catch (err) {
                  console.error('[dsh-russian-lang] Failed to serve core dictionaries:', err)
                  response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
                  response.end(JSON.stringify({ error: 'Internal server error' }))
                }
              },
            }))

            // 2. On-demand plugins dictionary serving (query: ?names=p1,p2...)
            unregsDict.push(ws.register({
              kind: 'prefix',
              path: '/api/dsh-russian-lang/dict/plugins',
              handler: async (request, response) => {
                try {
                  if (request.method !== 'GET' && request.method !== 'HEAD') {
                    response.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'application/json; charset=utf-8' })
                    response.end(JSON.stringify({ error: 'Method not allowed' }))
                    return
                  }
                  const url = new URL(request.url, 'http://localhost')
                  const namesParam = url.searchParams.get('names') || url.searchParams.get('list') || ''
                  const names = namesParam ? namesParam.split(',').map((s) => s.trim()).filter(Boolean) : null
                  const plugins = getPluginDictionariesByNames(names)
                  sendJsonWithEtag(request, response, { plugins })
                } catch (err) {
                  console.error('[dsh-russian-lang] Failed to serve plugin dictionaries:', err)
                  response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
                  response.end(JSON.stringify({ error: 'Internal server error' }))
                }
              },
            }))

            // 3. Backward compatibility all-dictionaries endpoint
            unregsDict.push(ws.register({
              kind: 'exact',
              path: '/api/dsh-russian-lang/dict/all',
              handler: async (request, response) => {
                try {
                  if (request.method !== 'GET' && request.method !== 'HEAD') {
                    response.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'application/json; charset=utf-8' })
                    response.end(JSON.stringify({ error: 'Method not allowed' }))
                    return
                  }
                  const all = getAllDictionaries()
                  const zhRu = getZhRuMap()
                  sendJsonWithEtag(request, response, Object.assign({}, all, { core: getCoreDictionaries(), plugins: getPluginDictionaries(), zhRu }))
                } catch (err) {
                  console.error('[dsh-russian-lang] Failed to serve all dictionaries:', err)
                  response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
                  response.end(JSON.stringify({ error: 'Internal server error' }))
                }
              },
            }))

            // 4. Localization status overview endpoint (#484)
            unregsDict.push(ws.register({
              kind: 'exact',
              path: '/api/dsh-russian-lang/status/plugins',
              handler: async (request, response) => {
                try {
                  if (request.method !== 'GET' && request.method !== 'HEAD') {
                    response.writeHead(405, { allow: 'GET, HEAD', 'content-type': 'application/json; charset=utf-8' })
                    response.end(JSON.stringify({ error: 'Method not allowed' }))
                    return
                  }
                  const overview = getPluginsLocalizationOverview()
                  sendJsonWithEtag(request, response, overview, 60)
                } catch (err) {
                  console.error('[dsh-russian-lang] Failed to serve plugin localization status:', err)
                  response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
                  response.end(JSON.stringify({ error: 'Internal server error' }))
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
