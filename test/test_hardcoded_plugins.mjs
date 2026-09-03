import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const clientCode = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf-8')

test('бандл содержит словари opencode-palette, univer, dsh-skill-explorer', () => {
  assert.ok(clientCode.includes('opencode-palette'), 'opencode-palette missing')
  assert.ok(clientCode.includes('Палитра Opencode'), 'Russian title for opencode-palette missing')

  assert.ok(clientCode.includes('univer'), 'univer missing')
  assert.ok(clientCode.includes('Просмотр Univer'), 'Russian title for univer missing')

  assert.ok(clientCode.includes('dsh-skill-explorer'), 'dsh-skill-explorer missing')
  assert.ok(clientCode.includes('Центр навыков'), 'Russian title for skill-explorer missing')
})

test('бандл содержит DOM-трансляции для hardcoded-плагинов', () => {
  assert.ok(clientCode.includes('DOM_EN_ATTRS'), 'DOM_EN_ATTRS missing')
  assert.ok(clientCode.includes('Предпросмотр стриминга'), 'Streaming preview translation missing')
  assert.ok(clientCode.includes('Предпросмотр визуализации'), 'Visualization streaming preview translation missing')

  assert.ok(clientCode.includes('DOM_EN_TEXT'), 'DOM_EN_TEXT missing')
  assert.ok(clientCode.includes('Рассуждения'), 'Effort translation missing')
  assert.ok(clientCode.includes('Свернуть процесс'), 'Auto-collapse translation missing')
})
