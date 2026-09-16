import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('v0.2.21: package.json version is 0.2.21 and files list is sanitized', () => {
  const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.ok(pkg.version >= '0.2.21', 'version must be >= 0.2.21')
  assert.equal(pkg.name, '@goodandready/dsh-russian-lang')
  assert.ok(!pkg.files.includes('README.zh.md'), 'README.zh.md must be excluded from package.json files')
  assert.ok(!fs.existsSync(new URL('../README.zh.md', import.meta.url)), 'README.zh.md must be deleted')
})

test('v0.2.21: translator gateway, LibreTranslate integration and client privacy', () => {
  const clientSrc = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  
  // No direct network calls to Google Translate or MyMemory in client.js
  assert.ok(!clientSrc.includes('translate.googleapis.com'), 'client.js must not contain direct calls to Google Translate')
  assert.ok(!clientSrc.includes('api.mymemory.translated.net'), 'client.js must not contain direct calls to MyMemory')
  
  // Client routes through backend translation gateway
  assert.ok(clientSrc.includes('/api/dsh-russian-lang/translate'), 'client.js must call backend translation gateway')
  assert.ok(clientSrc.includes('/api/dsh-russian-lang/translator/status'), 'client.js must query translator status')
  assert.ok(clientSrc.includes('/api/dsh-russian-lang/translator/setup'), 'client.js must support 1-click Docker setup')
  
  // Translator settings UI in SettingsCard
  assert.ok(clientSrc.includes('secTranslator'), 'SettingsCard must have translator section')
  assert.ok(clientSrc.includes('engineLocal'), 'SettingsCard must have LibreTranslate option')
  assert.ok(clientSrc.includes('engineGoogle'), 'SettingsCard must have Google Translate option')
  assert.ok(clientSrc.includes('googleWarn'), 'SettingsCard must have Google privacy warning')
})

test('v0.2.21: translator module structure', async () => {
  const translatorModule = await import('../lib/translator.js')
  assert.equal(typeof translatorModule.registerTranslator, 'function')
  assert.equal(typeof translatorModule.getTranslatorStatus, 'function')
  assert.equal(typeof translatorModule.setupLibreTranslateContainer, 'function')
})
