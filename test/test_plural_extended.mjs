import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { plural, pluralForm, fill } from '../lib/pure.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test('v0.3.1 (#290): plural() с массивом форм [one, few, many]', () => {
  const forms = ['задача', 'задачи', 'задач']
  assert.equal(plural(0, forms), 'задач')
  assert.equal(plural(1, forms), 'задача')
  assert.equal(plural(2, forms), 'задачи')
  assert.equal(plural(4, forms), 'задачи')
  assert.equal(plural(5, forms), 'задач')
  assert.equal(plural(11, forms), 'задач')
  assert.equal(plural(14, forms), 'задач')
  assert.equal(plural(21, forms), 'задача')
  assert.equal(plural(22, forms), 'задачи')
  assert.equal(plural(25, forms), 'задач')
  assert.equal(plural(101, forms), 'задача')
  assert.equal(plural(112, forms), 'задач')
})

test('v0.3.1 (#290): plural() с аргументами-строками и флагом withCount', () => {
  assert.equal(plural(1, 'файл', 'файла', 'файлов'), 'файл')
  assert.equal(plural(3, 'файл', 'файла', 'файлов'), 'файла')
  assert.equal(plural(5, 'файл', 'файла', 'файлов'), 'файлов')

  assert.equal(plural(1, 'файл', 'файла', 'файлов', true), '1 файл')
  assert.equal(plural(4, 'файл', 'файла', 'файлов', true), '4 файла')
  assert.equal(plural(10, 'файл', 'файла', 'файлов', true), '10 файлов')
  assert.equal(plural(1000, ['элемент', 'элемента', 'элементов'], true), '1\u00A0000 элементов')
})

test('v0.3.1 (#290): fill() поддерживает синтаксис {count:plural:one,few,many}', () => {
  const template = 'Осталось {sec} {sec:plural:секунда,секунды,секунд} до завершения'
  assert.equal(fill(template, { sec: 1 }), 'Осталось 1 секунда до завершения')
  assert.equal(fill(template, { sec: 3 }), 'Осталось 3 секунды до завершения')
  assert.equal(fill(template, { sec: 15 }), 'Осталось 15 секунд до завершения')
  assert.equal(fill(template, { sec: 21 }), 'Осталось 21 секунда до завершения')

  const msg = 'Найдено {n} {n:plural:сообщение,сообщения,сообщений}'
  assert.equal(fill(msg, { n: 1 }), 'Найдено 1 сообщение')
  assert.equal(fill(msg, { n: 2 }), 'Найдено 2 сообщения')
  assert.equal(fill(msg, { n: 5 }), 'Найдено 5 сообщений')
})

test('v0.3.1 (#290): client.js экспортирует plural и pluralForm в runtime', () => {
  const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
  const clientSrc = fs.readFileSync(clientPath, 'utf-8')
  assert.ok(clientSrc.includes('runtime.plural = plural'), 'runtime.plural должен быть экспортирован')
  assert.ok(clientSrc.includes('runtime.pluralForm = pluralForm'), 'runtime.pluralForm должен быть экспортирован')
})
