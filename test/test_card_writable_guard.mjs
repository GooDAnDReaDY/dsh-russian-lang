import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientPath = path.join(__dirname, '..', 'lib', 'client.js')
const clientCode = fs.readFileSync(clientPath, 'utf-8')

test('Issue #417: client.js checks snap.writable === false to disable controls and awaits scope.set', () => {
  assert.ok(
    clientCode.includes("const disabled = status !== 'ready' || snap.writable === false"),
    'disabled must check snap.writable === false'
  )
  assert.ok(
    clientCode.includes('if (inspSnap.status !== \'ready\' || inspSnap.writable === false)'),
    'Inspector must check inspSnap.writable === false to disable save/reset'
  )
  assert.ok(
    clientCode.includes('if (res === false) throw new Error(\'Save rejected\')'),
    'Inspector must guard against false return value from scope.set'
  )
})

test('Issue #417: Simulation of SettingsCard and Inspector writable/save guard', async () => {
  // 1. Snapshot with writable: false disables controls
  const snapReadOnly = { status: 'ready', writable: false, value: {} }
  const disabled = snapReadOnly.status !== 'ready' || snapReadOnly.writable === false
  assert.equal(disabled, true, 'Controls must be disabled when writable is false')

  // 2. Snapshot with loading disables controls
  const snapLoading = { status: 'loading', writable: true, value: {} }
  const disabledLoading = snapLoading.status !== 'ready' || snapLoading.writable === false
  assert.equal(disabledLoading, true, 'Controls must be disabled when status is loading')

  // 3. Ready and writable enables controls
  const snapReady = { status: 'ready', writable: true, value: {} }
  const disabledReady = snapReady.status !== 'ready' || snapReady.writable === false
  assert.equal(disabledReady, false, 'Controls must be enabled when ready and writable')

  // 4. Save rejected/returns false in Inspector sets error state
  let saveBtnState = { text: 'Сохранить', disabled: false }
  const scopeFailing = {
    set: async () => false
  }

  const handleSave = async () => {
    saveBtnState.disabled = true
    saveBtnState.text = 'Сохранение…'
    try {
      const res = await scopeFailing.set('overrides', { foo: 'bar' })
      if (res === false) throw new Error('Save rejected')
      saveBtnState.text = '✓ Применено'
    } catch (err) {
      saveBtnState.disabled = false
      saveBtnState.text = 'Ошибка сохранения'
    }
  }

  await handleSave()
  assert.equal(saveBtnState.text, 'Ошибка сохранения', 'Button must show error and not false success on rejection')
  assert.equal(saveBtnState.disabled, false)
})
