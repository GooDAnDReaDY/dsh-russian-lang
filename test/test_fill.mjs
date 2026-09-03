// fill(): подстановка параметров, на которой держатся переопределения и
// формы множественного числа. Импорт из lib/pure.js — раньше тест держал
// собственную упрощённую копию БЕЗ спецификаторов формата и потому не
// проверял отгружаемую функцию вовсе (#133).
import { test } from 'node:test'
import assert from 'node:assert'
import { fill } from '../lib/pure.js'

test('fill подставляет известные параметры', () => {
  assert.equal(fill('{n} сессия', { n: 1 }), '1 сессия')
  assert.equal(fill('{count} участника', { count: 3 }), '3 участника')
})

test('fill оставляет неизвестные параметры как есть', () => {
  assert.equal(fill('{n} сессий', {}), '{n} сессий')
  assert.equal(fill('{n} сессий', { other: 5 }), '{n} сессий')
})

test('fill обрабатывает несколько параметров', () => {
  assert.equal(fill('{a} и {b}', { a: 'x', b: 'y' }), 'x и y')
})

test('fill: спецификатор падежа склоняет значение', () => {
  assert.equal(fill('нет {what:gen}', { what: 'файл' }), 'нет файла')
  assert.equal(fill('к {who:dat}', { who: 'агент' }), 'к агенту')
})

test('fill: неизвестный спецификатор не роняет подстановку', () => {
  assert.equal(fill('{v:wat}', { v: 'x' }), 'x')
})

test('fill безопасно обрабатывает отсутствующие или пустые параметры', () => {
  assert.equal(fill('{n} сессий', undefined), '{n} сессий')
  assert.equal(fill('{n} сессий', null), '{n} сессий')
  assert.equal(fill('простой текст', undefined), 'простой текст')
})
