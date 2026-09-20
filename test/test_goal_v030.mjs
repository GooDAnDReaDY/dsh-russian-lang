import test from 'node:test'
import assert from 'node:assert/strict'
import { getAllDictionaries } from '../lib/locales.js'

test('v0.3.1 (#310): dsh-goal v0.3.0 Power Suite keys translated', () => {
  const all = getAllDictionaries()
  const goal = all['dsh-goal']
  assert.ok(goal, 'dsh-goal must exist')

  const expected = {
    compactDock: 'Свернуть в компактную капсулу',
    expandDock: 'Развернуть панель цели',
    saveArtifact: 'Сохранить артефакт выполнения',
    artifactSaved: '✅ Артефакт сохранён (.dsh/goals/)',
    saveArtifactFailed: 'Не удалось сохранить артефакт',
    extendBudgetBtn: '+50k токенов и продолжить',
    budgetExceededBadge: 'Лимит токенов исчерпан',
    budgetLabel: 'Лимит токенов (0 — без ограничений):',
    budgetWarnLabel: 'Порог предупреждения (%):',
    autoCheckpointLabel: 'Создавать Git-чекпоинт при завершении этапа',
    rollbackBtn: 'Откатить к чекпоинту',
    rollbackConfirm: 'Откатить рабочую копию к этому чекпоинту?',
    rollbackSuccess: 'Успешный откат к чекпоинту',
  }

  for (const [k, expectedVal] of Object.entries(expected)) {
    assert.equal(goal[k], expectedVal, `key ${k} mismatch`)
  }
})
