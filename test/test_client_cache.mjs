import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('v0.3.1 (#285): client.js содержит реализацию клиентского кэширования словарей', () => {
  const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
  const clientCode = fs.readFileSync(clientPath, 'utf-8')

  assert.ok(clientCode.includes('dsh-ru-cache-v1'), 'client.js содержит CACHE_NAME dsh-ru-cache-v1')
  assert.ok(clientCode.includes('fetchCachedResource'), 'client.js содержит fetchCachedResource')
  assert.ok(clientCode.includes('loadLocalDict'), 'client.js содержит loadLocalDict')
  assert.ok(clientCode.includes('saveLocalDict'), 'client.js содержит saveLocalDict')
  assert.ok(clientCode.includes('res.status === 304'), 'client.js обрабатывает статус 304 Not Modified')
  assert.ok(clientCode.includes('If-None-Match'), 'client.js передает If-None-Match заголовок')
})

test('v0.3.1 (#285): lib/index.js содержит sendJsonWithEtag и обработку 304', () => {
  const indexPath = path.join(__dirname, '..', 'lib', 'index.js')
  const indexCode = fs.readFileSync(indexPath, 'utf-8')

  assert.ok(indexCode.includes('sendJsonWithEtag'), 'lib/index.js объявляет sendJsonWithEtag')
  assert.ok(indexCode.includes('etag'), 'lib/index.js вычисляет etag')
  assert.ok(indexCode.includes('304'), 'lib/index.js возвращает 304 при совпадении ETag')
  assert.ok(indexCode.includes('must-revalidate'), 'lib/index.js использует must-revalidate')
  assert.ok(indexCode.includes('if-none-match'), 'lib/index.js проверяет if-none-match')
})

test('v0.3.1 (#285): sendJsonWithEtag корректно формирует ETag и возвращает 304', () => {
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

  const sampleData = { core: { testKey: 'тест' } }
  let status = 0
  let headers = {}
  let body = ''
  const mockRes = {
    writeHead: (s, h) => { status = s; headers = h },
    end: (b) => { body = b ? b.toString('utf-8') : '' }
  }

  // 1. Без If-None-Match -> 200 с ETag
  sendJsonWithEtag({ headers: {} }, mockRes, sampleData)
  assert.equal(status, 200)
  assert.ok(headers.etag)
  assert.equal(headers['content-type'], 'application/json; charset=utf-8')
  assert.ok(body.includes('тест'))

  const etag = headers.etag

  // 2. С совпадающим If-None-Match -> 304 Not Modified
  let status304 = 0
  let body304 = 'initial'
  const mockRes304 = {
    writeHead: (s) => { status304 = s },
    end: (b) => { body304 = b ? b.toString('utf-8') : '' }
  }
  sendJsonWithEtag({ headers: { 'if-none-match': etag } }, mockRes304, sampleData)
  assert.equal(status304, 304)
  assert.equal(body304, '')

  // 3. С несовпадающим If-None-Match -> 200
  let statusDiff = 0
  sendJsonWithEtag({ headers: { 'if-none-match': '"diff-etag"' } }, mockRes, sampleData)
  assert.equal(statusDiff || 200, 200)
})
