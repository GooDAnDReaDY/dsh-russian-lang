import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPluginDictionariesByNames } from '../lib/locales.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('v0.3.1 (#287, #311): dsh-github-ops словарь содержит все 26 требуемых ключей', () => {
  const dictPath = path.join(__dirname, '..', 'ru-plugins', '77-github-ops.json')
  const content = JSON.parse(fs.readFileSync(dictPath, 'utf-8'))
  const dict = content['dsh-github-ops']

  assert.ok(dict, 'пространство dsh-github-ops должно присутствовать')

  const expectedKeys = [
    'title', 'sub', 'cardHint', 'tokenEnv', 'tokenEnvHint',
    'tokenSource', 'tokenSourceHint',
    'defaultRepository', 'defaultRepositoryHint', 'baseUrl', 'baseUrlHint',
    'timeoutMs', 'timeoutMsHint', 'maxRetries', 'maxRetriesHint',
    'reviewRules', 'reviewRulesHint',
    'statusLoading', 'statusUnavailable', 'statusReadOnly',
    'save', 'saving', 'saved', 'savedPartial',
    'noChanges', 'invalidNumber'
  ]

  for (const k of expectedKeys) {
    assert.ok(dict[k], `ключ ${k} должен быть переведён`)
    assert.match(dict[k], /[\u0400-\u04FF]/, `значение ${k} должно содержать кириллицу`)
  }
  assert.equal(dict.title, 'Операции с GitHub')
  assert.equal(dict.tokenSource, 'Источник доступа')
  assert.equal(dict.maxRetries, 'Повторы при ошибке чтения')
  assert.equal(dict.reviewRules, 'Переопределение правил ревью (JSON)')
  assert.equal(dict.save, 'Сохранить')
  assert.equal(dict.saved, 'Сохранено')
})

test('v0.3.1 (#287): getPluginDictionariesByNames возвращает dsh-github-ops', () => {
  const plugins = getPluginDictionariesByNames(['dsh-github-ops'])
  assert.ok(plugins['dsh-github-ops'])
  assert.equal(plugins['dsh-github-ops'].title, 'Операции с GitHub')
})
