import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { readJsonBody } from '../lib/translator.js'

test('Issue #411: readJsonBody correctly handles multi-byte UTF-8 split across arbitrary chunks', async () => {
  const payload = {
    russian: 'Привет, мир! Тест кириллицы на границе сетевых чанков: съешь же ещё этих мягких французских булок.',
    cjk: '你好世界，深度测试语言包，多字节切分测试。',
    emoji: '🚀🎉✨🔥💯🌟'
  }
  const jsonStr = JSON.stringify(payload)
  const fullBuffer = Buffer.from(jsonStr, 'utf8')

  // Test chunk sizes from 1 byte to 20 bytes (every possible byte split)
  for (let chunkSize = 1; chunkSize <= 20; chunkSize++) {
    const req = new EventEmitter()
    const promise = readJsonBody(req, 100_000)

    let offset = 0
    while (offset < fullBuffer.length) {
      const nextOffset = Math.min(offset + chunkSize, fullBuffer.length)
      req.emit('data', fullBuffer.subarray(offset, nextOffset))
      offset = nextOffset
    }
    req.emit('end')

    const result = await promise
    assert.deepEqual(
      result,
      payload,
      `Payload must match exactly when split into chunks of ${chunkSize} bytes`
    )
  }
})

test('Issue #411: Single multi-byte character split across exactly 2 chunks', async () => {
  // 'п' in UTF-8 is [0xD0, 0xBF]
  const json = JSON.stringify({ text: 'привет' })
  const buf = Buffer.from(json, 'utf8')

  // Find index of 0xD0 (the start of 'п')
  const pIndex = buf.indexOf(Buffer.from('п', 'utf8'))
  assert.ok(pIndex > 0)

  // Chunk 1 cuts right in the middle of 'п'
  const chunk1 = buf.subarray(0, pIndex + 1)
  const chunk2 = buf.subarray(pIndex + 1)

  const req = new EventEmitter()
  const promise = readJsonBody(req)
  req.emit('data', chunk1)
  req.emit('data', chunk2)
  req.emit('end')

  const res = await promise
  assert.equal(res.text, 'привет', "Text must remain 'привет' and not contain replacement characters")
})
