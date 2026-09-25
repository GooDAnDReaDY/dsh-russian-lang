import { execFile } from 'node:child_process'

/**
 * Host-side translation services & LibreTranslate integration
 * for @goodandready/dsh-russian-lang.
 */

function execPromise(cmd, args, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: timeoutMs }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr?.trim() || err.message))
      resolve(stdout?.trim() || '')
    })
  })
}

function readJsonBody(request, limit = 500_000) {
  return new Promise((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
      if (body.length > limit) {
        reject(new Error('Payload too large'))
      }
    })
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        reject(err)
      }
    })
    request.on('error', reject)
  })
}

function header(request, name) {
  const value = request?.headers?.[name]
  return Array.isArray(value) ? value[0] : value
}

function isLoopback(value) {
  const address = value?.toLowerCase().replace(/^\[|\]$/g, '')
  return (
    address === 'localhost' ||
    address === 'localhost.' ||
    address === '::1' ||
    address?.startsWith('127.') === true ||
    address?.startsWith('::ffff:127.') === true
  )
}

export const TRANSLATOR_HEADER = 'x-dsh-translator'

export function isTrustedTranslatorRequest(request) {
  if (header(request, TRANSLATOR_HEADER) !== '1') return false
  const site = header(request, 'sec-fetch-site')
  if (site !== undefined && site !== 'same-origin') return false
  const origin = header(request, 'origin')
  const host = header(request, 'host')
  if (origin === undefined || host === undefined) return false
  try {
    const url = new URL(origin)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    // Same-origin check: Origin host must match Host header.
    // Accepts loopback, LAN, and Tailscale addresses alike.
    return url.host === host
  } catch {
    return false
  }
}


export async function getTranslatorStatus(settingsCtx) {
  const currentSettings = settingsCtx?.settings?.get('russian-lang') || {}
  const engine = currentSettings.translateEngine || 'off'
  const localUrl = (currentSettings.localApiUrl || 'http://127.0.0.1:5000').replace(/\/+$/, '')

  let dockerAvailable = false
  let installed = false
  let running = false
  let responsive = false

  try {
    const statusOut = await execPromise('docker', [
      'ps', '-a', '--filter', 'name=^libretranslate$', '--format', '{{.Status}}'
    ], 3000)
    dockerAvailable = true
    if (statusOut) {
      installed = true
      running = statusOut.toLowerCase().startsWith('up')
    }
  } catch (_) {
    dockerAvailable = false
  }

  // Ping HTTP endpoint if running or local
  try {
    const res = await fetch(`${localUrl}/languages`, { signal: AbortSignal.timeout(1500) })
    if (res.ok) responsive = true
  } catch (_) { /* bestEffort */ void _; }

  return {
    engine,
    localUrl,
    dockerAvailable,
    installed,
    running,
    responsive,
    memory: '~500–700 МБ RAM',
    recommended: 'libretranslate (CTranslate2 / int8)'
  }
}

export async function setupLibreTranslateContainer() {
  // Check if container exists
  try {
    const nameOut = await execPromise('docker', [
      'ps', '-a', '--filter', 'name=^libretranslate$', '--format', '{{.Names}}'
    ], 3000)
    if (nameOut && nameOut.trim() === 'libretranslate') {
      // Start stopped container
      await execPromise('docker', ['start', 'libretranslate'], 10000)
      return { ok: true, action: 'started', message: 'Контейнер libretranslate запущен.' }
    }
  } catch (err) {
    throw new Error('Docker недоступен или нет прав на выполнение: ' + err.message)
  }

  // Run new container
  try {
    await execPromise('docker', [
      'run', '-d',
      '--name', 'libretranslate',
      '--restart', 'unless-stopped',
      '-p', '127.0.0.1:5000:5000',
      'libretranslate/libretranslate:v1.5.3',
      '--load-only', 'en,ru,zh'
    ], 30000)
    return { ok: true, action: 'created', message: 'Контейнер libretranslate создан и запускается (~600 МБ RAM).' }
  } catch (err) {
    throw new Error('Ошибка запуска контейнера libretranslate: ' + err.message)
  }
}

async function translateGoogle(text, targetLang = 'ru') {
  const parts = text.split(/(```[\s\S]*?```)/g)
  const resultParts = []
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      resultParts.push(parts[i])
      continue
    }
    const chunk = parts[i]
    if (!chunk.trim()) {
      resultParts.push(chunk)
      continue
    }
    const paragraphs = chunk.split(/\n\n+/)
    const transParas = []
    for (const para of paragraphs) {
      const pTrim = para.trim()
      if (!pTrim) continue
      const sentences = pTrim.match(/[^.!?\n]+[.!?\n]*/g) || [pTrim]
      const transSents = []
      for (const s of sentences) {
        if (!s.trim()) continue
        const gurl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(s)
        try {
          const res = await fetch(gurl, { signal: AbortSignal.timeout(6000) })
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && Array.isArray(data[0])) {
              transSents.push(data[0].map((it) => it[0]).join(''))
              continue
            }
          }
        } catch (_) { /* bestEffort */ void _; }
        transSents.push(s)
      }
      transParas.push(transSents.join(''))
    }
    resultParts.push(transParas.join('\n\n'))
  }
  return resultParts.join('')
}

async function translateLibre(text, targetLang = 'ru', localUrl = 'http://127.0.0.1:5000') {
  const endpoint = localUrl.replace(/\/+$/, '') + '/translate'
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text'
    }),
    signal: AbortSignal.timeout(15000)
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    throw new Error(`LibreTranslate HTTP ${res.status}: ${errText}`)
  }
  const data = await res.json()
  return data.translatedText || text
}

export function registerTranslator(wctx, settingsCtx) {
  let ws = null
  try { ws = wctx?.webServer } catch (_) { ws = null }
  if (!ws || typeof ws.register !== 'function') return () => {}

  const unregs = []

  // 1. Status endpoint: GET /api/dsh-russian-lang/translator/status
  unregs.push(
    ws.register({
      kind: 'exact',
      path: '/api/dsh-russian-lang/translator/status',
      handler: async (request, response) => {
        try {
          if (request.method !== 'GET') {
            response.writeHead(405, { 'content-type': 'application/json' })
            response.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }
          const status = await getTranslatorStatus(settingsCtx)
          response.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
          })
          response.end(JSON.stringify(status))
        } catch (err) {
          response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
          response.end(JSON.stringify({ error: String(err) }))
        }
      }
    })
  )

  // 2. Setup endpoint: POST /api/dsh-russian-lang/translator/setup
  unregs.push(
    ws.register({
      kind: 'exact',
      path: '/api/dsh-russian-lang/translator/setup',
      handler: async (request, response) => {
        try {
          if (request.method !== 'POST') {
            response.writeHead(405, { 'content-type': 'application/json' })
            response.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }
          if (!isTrustedTranslatorRequest(request)) {
            response.writeHead(403, {
              'content-type': 'application/json; charset=utf-8',
              'cache-control': 'no-store'
            })
            response.end(JSON.stringify({ error: 'Rejected non-local or cross-origin translator setup request.' }))
            return
          }
          const result = await setupLibreTranslateContainer()
          response.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
          })
          response.end(JSON.stringify(result))
        } catch (err) {
          response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
          response.end(JSON.stringify({ error: String(err) }))
        }
      }
    })
  )

  // 3. Translation gateway: POST /api/dsh-russian-lang/translate
  unregs.push(
    ws.register({
      kind: 'exact',
      path: '/api/dsh-russian-lang/translate',
      handler: async (request, response) => {
        try {
          if (request.method !== 'POST') {
            response.writeHead(405, { 'content-type': 'application/json' })
            response.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }
          if (!isTrustedTranslatorRequest(request)) {
            response.writeHead(403, {
              'content-type': 'application/json; charset=utf-8',
              'cache-control': 'no-store'
            })
            response.end(JSON.stringify({ error: 'Rejected non-local or cross-origin translation request.' }))
            return
          }

          const body = await readJsonBody(request)
          const text = body.text
          const target = body.target || 'ru'

          if (!text || typeof text !== 'string') {
            response.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
            response.end(JSON.stringify({ error: 'Параметр "text" обязателен для перевода.' }))
            return
          }

          const settings = settingsCtx?.settings?.get('russian-lang') || {}
          const engine = settings.translateEngine || 'off'
          const localUrl = settings.localApiUrl || 'http://127.0.0.1:5000'

          if (engine === 'off') {
            response.writeHead(403, { 'content-type': 'application/json; charset=utf-8' })
            response.end(JSON.stringify({
              error: 'Машинный перевод отключен в настройках плагина. Включите локальный сервер (LibreTranslate) или Google Translate в настройках dsh-russian-lang.'
            }))
            return
          }

          let translatedText = ''
          if (engine === 'local') {
            try {
              translatedText = await translateLibre(text, target, localUrl)
            } catch (err) {
              response.writeHead(503, { 'content-type': 'application/json; charset=utf-8' })
              response.end(JSON.stringify({
                error: 'Локальный переводчик LibreTranslate недоступен (' + err.message + '). Проверьте состояние контейнера в настройках плагина.'
              }))
              return
            }
          } else if (engine === 'google') {
            translatedText = await translateGoogle(text, target)
          } else {
            response.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
            response.end(JSON.stringify({ error: 'Неизвестный движок перевода: ' + engine }))
            return
          }

          response.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
          })
          response.end(JSON.stringify({ translatedText, engine }))
        } catch (err) {
          response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' })
          response.end(JSON.stringify({ error: String(err) }))
        }
      }
    })
  )

  return () => {
    for (const unreg of unregs) {
      try { unreg() } catch (_) { /* bestEffort */ void _; }
    }
  }
}
