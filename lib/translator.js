import { execFile } from 'node:child_process'
import { StringDecoder } from 'node:string_decoder'

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

export function readJsonBody(request, limit = 500_000) {
  return new Promise((resolve, reject) => {
    // 1. Ранняя проверка Content-Length
    const contentLength = request?.headers?.['content-length']
    if (contentLength && parseInt(contentLength, 10) > limit) {
      const err = new Error('Payload too large')
      err.statusCode = 413
      return reject(err)
    }

    const decoder = new StringDecoder('utf8')
    let body = ''
    let bytesReceived = 0
    let settled = false

    const onData = (chunk) => {
      if (settled) return
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
      bytesReceived += buf.length
      if (bytesReceived > limit) {
        settled = true
        if (typeof request.removeListener === 'function') request.removeListener('data', onData)
        if (typeof request.destroy === 'function') request.destroy()
        const err = new Error('Payload too large')
        err.statusCode = 413
        return reject(err)
      }
      body += decoder.write(buf)
    }

    request.on('data', onData)

    request.on('end', () => {
      if (settled) return
      settled = true
      body += decoder.end()
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch (err) {
        err.statusCode = 400
        reject(err)
      }
    })

    request.on('error', (err) => {
      if (settled) return
      settled = true
      reject(err)
    })
  })
}

function header(request, name) {
  const value = request?.headers?.[name]
  return Array.isArray(value) ? value[0] : value
}

export function isIPv4Loopback(v4) {
  if (typeof v4 !== 'string') return false
  const parts = v4.split('.')
  return (
    parts.length === 4 &&
    parts[0] === '127' &&
    parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255)
  )
}

export function isLoopbackAddress(address) {
  if (address === undefined || typeof address !== 'string') return false
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, '')
  if (normalized === 'localhost' || normalized === 'localhost.' || normalized === '::1') return true
  if (normalized.startsWith('::ffff:')) {
    const rest = normalized.slice('::ffff:'.length)
    return isIPv4Loopback(rest)
  }
  return isIPv4Loopback(normalized)
}

export function isLoopbackHostname(hostname) {
  if (typeof hostname !== 'string') return false
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (normalized === 'localhost' || normalized === 'localhost.' || normalized === '::1') return true
  return isIPv4Loopback(normalized)
}

export function isLoopback(value) {
  return isLoopbackAddress(value)
}

export function isAllowedLocalOrLanHost(hostname) {
  if (!hostname || typeof hostname !== 'string') return false
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '').trim()
  if (isLoopbackHostname(h)) return true
  if (h === '0.0.0.0') return true
  if (h.endsWith('.local') || h.endsWith('.localhost')) return true

  // IPv4 private ranges (RFC 1918 & RFC 3927)
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (m) {
    const a = Number(m[1])
    const b = Number(m[2])
    const c = Number(m[3])
    const d = Number(m[4])
    if (a >= 0 && a <= 255 && b >= 0 && b <= 255 && c >= 0 && c <= 255 && d >= 0 && d <= 255) {
      if (a === 127) return true
      if (a === 10) return true
      if (a === 172 && b >= 16 && b <= 31) return true
      if (a === 192 && b === 168) return true
      if (a === 169 && b === 254) return true
      // Tailscale / CGNAT (RFC 6598: 100.64.0.0/10)
      if (a === 100 && b >= 64 && b <= 127) return true
    }
  }

  // Trusted host overrides (from env or DSH configuration)
  if (process.env.DSH_TRUSTED_HOSTS) {
    const list = process.env.DSH_TRUSTED_HOSTS.split(',').map((s) => s.trim().toLowerCase())
    if (list.includes(h)) return true
  }
  return false
}

export function isTrustedLocalRequest(request) {
  const host = header(request, 'host')
  if (typeof host !== 'string' || host === '') return false
  let hostUrl
  try {
    hostUrl = new URL('http://' + host)
  } catch {
    return false
  }

  // 1. Host hostname MUST be allowed loopback or LAN host (DNS Rebinding protection: #536)
  if (!isAllowedLocalOrLanHost(hostUrl.hostname)) {
    return false
  }



  // 3. Защита от межсайтовых запросов (Same-Origin / Cross-Site)
  const site = header(request, 'sec-fetch-site')
  const origin = header(request, 'origin')

  if (site === 'cross-site') {
    return false
  }

  if (origin === undefined || origin === 'null') {
    return true
  }

  try {
    const url = new URL(origin)
    if (
      url.protocol === 'file:' ||
      url.protocol === 'vscode-file:' ||
      url.protocol === 'dsh:' ||
      url.protocol === 'app:'
    ) {
      return true
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false

    // Origin hostname также обязан быть в доверенном local/LAN списке
    if (!isAllowedLocalOrLanHost(url.hostname)) {
      return false
    }

    if (url.host === hostUrl.host) return true

    if (isLoopbackHostname(url.hostname) && isLoopbackHostname(hostUrl.hostname)) {
      const urlPort = url.port || (url.protocol === 'https:' ? '443' : '80')
      const hostPort = hostUrl.port || '80'
      if (urlPort === hostPort) return true
    }
    return false
  } catch {
    return false
  }
}

export async function translateLLM(llm, text, targetLang = 'ru', options = {}) {
  if (!llm) {
    throw new Error('LLM сервис (ctx.llm) недоступен')
  }

  const sysPrompt = options.prompt || (
    targetLang === 'ru'
      ? 'Ты профессиональный переводчик интерфейсов и технической документации. ' +
        'Переведи предоставленный текст на естественный русский язык. ' +
        'Сохраняй форматирование Markdown, переменные вида {name}, HTML-теги и блоки кода без изменений. ' +
        'Отвечай ТОЛЬКО переведённым текстом, без комментариев и кавычек.'
      : `You are a professional technical translator. Translate the provided text into ${targetLang}. ` +
        'Preserve Markdown formatting, placeholders like {name}, HTML tags, and code blocks unchanged. ' +
        'Reply ONLY with the translated text, without commentary or enclosing quotes.'
  )

  const messages = [
    { role: 'system', content: sysPrompt },
    { role: 'user', content: text }
  ]

  const signal = options.signal || AbortSignal.timeout(30000)

  // 1. Direct llm.generate if available
  if (typeof llm.generate === 'function') {
    try {
      const res = await llm.generate({
        messages,
        temperature: 0.2,
        signal
      })
      const out = typeof res === 'string' ? res : (res?.text || res?.content || '')
      if (out && out.trim()) return out.trim()
    } catch (_) {
      try {
        const prompt = `${sysPrompt}\n\n${text}`
        const res = await llm.generate(prompt)
        const out = typeof res === 'string' ? res : (res?.text || res?.content || '')
        if (out && out.trim()) return out.trim()
      } catch (err) {
        if (typeof llm.chat !== 'function' && typeof llm.stream !== 'function') throw err
      }
    }
  }

  // 2. Direct llm.chat if available
  if (typeof llm.chat === 'function') {
    const response = await llm.chat({
      messages,
      temperature: 0.1,
      max_tokens: 1500,
      signal
    })
    const content = response?.content || response?.message?.content || response?.choices?.[0]?.message?.content || ''
    if (content && String(content).trim()) return String(content).trim()
  }

  // 3. Direct llm.stream if available
  if (typeof llm.stream === 'function') {
    const iterable = llm.stream({
      messages,
      temperature: 0.2,
      signal
    })
    let out = ''
    for await (const chunk of iterable) {
      if (chunk && chunk.type === 'text-delta' && typeof chunk.text === 'string') {
        out += chunk.text
      } else if (chunk && chunk.type === 'block-end' && chunk.block?.text) {
        out += chunk.block.text
      } else if (typeof chunk === 'string') {
        out += chunk
      } else if (chunk?.content) {
        out += chunk.content
      }
    }
    if (out.trim()) return out.trim()
  }

  // 4. llm.prepareCall if available
  if (typeof llm.prepareCall === 'function') {
    const prep = await llm.prepareCall({
      temperature: 0.2,
      signal
    })
    if (prep && typeof prep.stream === 'function') {
      const stream = prep.stream({ messages })
      let out = ''
      for await (const chunk of stream) {
        if (chunk && chunk.type === 'text-delta' && typeof chunk.text === 'string') {
          out += chunk.text
        } else if (chunk && chunk.type === 'block-end' && chunk.block?.text) {
          out += chunk.block.text
        } else if (typeof chunk === 'string') {
          out += chunk
        }
      }
      if (out.trim()) return out.trim()
    }
  }

  throw new Error('LLM сервис не предоставил поддерживаемого метода вызова (generate/chat/stream/prepareCall)')
}

export const TRANSLATOR_HEADER = 'x-dsh-translator'

export function isTrustedTranslatorRequest(request) {
  if (header(request, TRANSLATOR_HEADER) !== '1') return false
  return isTrustedLocalRequest(request)
}
function _legacyIsTrustedTranslatorRequest(request) {

  const host = header(request, 'host')
  if (typeof host !== 'string' || host === '') return false
  let hostUrl
  try {
    hostUrl = new URL('http://' + host)
  } catch {
    return false
  }

  const site = header(request, 'sec-fetch-site')
  const origin = header(request, 'origin')

  if (site === 'cross-site') {
    if (origin === undefined) return false
  }

  if (origin === undefined || origin === 'null') return true

  try {
    const url = new URL(origin)
    if (
      url.protocol === 'file:' ||
      url.protocol === 'vscode-file:' ||
      url.protocol === 'dsh:' ||
      url.protocol === 'app:'
    ) {
      return true
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    if (url.host === hostUrl.host) return true

    if (isLoopbackHostname(url.hostname) && isLoopbackHostname(hostUrl.hostname)) {
      const urlPort = url.port || (url.protocol === 'https:' ? '443' : '80')
      const hostPort = hostUrl.port || '80'
      if (urlPort === hostPort) return true
    }
    return false
  } catch {
    return false
  }
}


/**
 * Нормализует источник настроек к plain-объекту: принимает либо готовый
 * объект, либо функцию-ридер (как readSettings из lib/index.js), либо —
 * для обратной совместимости — легаси settings-контекст с settings.get().
 */
function resolveTranslatorSettings(source) {
  try {
    if (typeof source === 'function') return source() || {}
    if (source && typeof source === 'object') {
      if (source.settings && typeof source.settings.get === 'function') {
        return source.settings.get('russian-lang') || {}
      }
      if (typeof source.translateEngine === 'string' || typeof source.localApiUrl === 'string'
        || typeof source.agentPrompt !== 'undefined' || typeof source.enabled !== 'undefined') {
        return source
      }
    }
  } catch (_) { /* bestEffort */ void _ }
  return {}
}


export async function getTranslatorStatus(settingsSource, getLlm) {
  const currentSettings = resolveTranslatorSettings(settingsSource)
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

  const llm = typeof getLlm === 'function' ? getLlm() : null
  return {
    engine,
    localUrl,
    llmAvailable: !!llm,
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
  let totalRequests = 0
  const MAX_REQUESTS = 40
  const MAX_CHUNK_LEN = 1200

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
      const batches = []
      let currentBatch = ''
      for (const s of sentences) {
        if (!s.trim()) continue
        if (currentBatch && (currentBatch.length + s.length > MAX_CHUNK_LEN)) {
          batches.push(currentBatch)
          currentBatch = s
        } else {
          currentBatch += s
        }
      }
      if (currentBatch) batches.push(currentBatch)

      const transSents = []
      for (const batch of batches) {
        if (!batch.trim()) continue
        if (totalRequests >= MAX_REQUESTS) {
          transSents.push(batch)
          continue
        }
        totalRequests++
        const gurl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + encodeURIComponent(targetLang) + '&dt=t&q=' + encodeURIComponent(batch)
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
        transSents.push(batch)
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

const logError = (ctx, msg, err) => {
  const l = typeof ctx?.logger === 'function' ? ctx.logger('dsh-russian-lang') : ctx?.logger
  if (typeof l?.error === 'function') {
    l.error(msg, err)
  }
}


export function registerTranslator(wctx, settingsSource, getLlm) {
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
          if (!isTrustedLocalRequest(request)) {
            response.writeHead(403, { 'content-type': 'application/json; charset=utf-8' })
            response.end(JSON.stringify({ error: 'Rejected cross-origin or untrusted host request.' }))
            return
          }
          const status = await getTranslatorStatus(settingsSource, getLlm)
          response.writeHead(200, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store'
          })
          response.end(JSON.stringify(status))
        } catch (err) {
          logError(wctx, 'Translator status failed:', err)
          const status = err && err.statusCode ? err.statusCode : 500
          response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
          response.end(JSON.stringify({ error: 'Translator setup failed' }))
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
          if (!isTrustedTranslatorRequest(request) || !isLoopback(request?.socket?.remoteAddress)) {
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
          logError(wctx, 'Translator container setup failed:', err)
          const status = err && err.statusCode ? err.statusCode : 500
          response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
          response.end(JSON.stringify({ error: 'Translator setup failed' }))
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

          const settings = resolveTranslatorSettings(settingsSource)
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
          const currentLlm = (typeof getLlm === 'function' ? getLlm() : null) || wctx?.llm
          if (engine === 'llm' || (engine === 'auto' && currentLlm)) {
            if (!currentLlm) {
              response.writeHead(503, { 'content-type': 'application/json; charset=utf-8' })
              response.end(JSON.stringify({
                error: 'Сервис ctx.llm в данный момент недоступен. Проверьте настройку провайдера моделей в DSH.'
              }))
              return
            }
            try {
              translatedText = await translateLLM(currentLlm, text, target)
            } catch (err) {
              response.writeHead(503, { 'content-type': 'application/json; charset=utf-8' })
              response.end(JSON.stringify({
                error: 'Перевод через ctx.llm завершился ошибкой: ' + err.message
              }))
              return
            }
          } else if (engine === 'local') {
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
          logError(wctx, 'Translation request failed:', err)
          const status = err && err.statusCode ? err.statusCode : 500
          response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
          response.end(JSON.stringify({ error: 'Translator setup failed' }))
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
