import { test } from 'node:test'
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const clientCode = readFileSync(join(HERE, '..', 'lib', 'client.js'), 'utf-8')

test('бандл v0.2.2 содержит словари dshhub-market и dsh-config-manager', () => {
  assert.ok(clientCode.includes('dshhub-market'), 'dshhub-market missing')
  assert.ok(clientCode.includes('Рынок dshhub.co') || clientCode.includes('Магазин плагинов dshhub.co'), 'dshhub-market Russian title missing')

  assert.ok(clientCode.includes('config-manager'), 'config-manager missing')
  assert.ok(clientCode.includes('Резервное копирование и миграция'), 'config-manager Russian label missing')

  assert.ok(clientCode.includes('config-manager-sync'), 'config-manager-sync missing')
  assert.ok(clientCode.includes('Удалённая синхронизация'), 'config-manager-sync Russian label missing')

  assert.ok(clientCode.includes('config-manager-market'), 'config-manager-market missing')
  assert.ok(clientCode.includes('Каталог конфигураций'), 'config-manager-market Russian label missing')

  assert.ok(clientCode.includes('config-manager-recovery'), 'config-manager-recovery missing')
  assert.ok(clientCode.includes('config-manager-history'), 'config-manager-history missing')
})

test('бандл v0.2.2 содержит DOM-переводчик для modsearch', () => {
  assert.ok(clientCode.includes('Поисковая система (ModSearch)'), 'modsearch title translation missing')
  assert.ok(clientCode.includes('Настройка провайдера поисковой системы.'), 'modsearch subtitle translation missing')
})
