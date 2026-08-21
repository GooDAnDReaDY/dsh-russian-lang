#!/usr/bin/env python3
"""Собрать lib/client.js из словарей ru/*.json и ru-plugins/*.json.

Словари — источник истины, бандл генерируется. Перевод правится в JSON, после
обновления dsh достаточно перегенерировать бандл.
"""
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# ru/         — словари ядра DSH
# ru-plugins/ — словари сторонних плагинов; механизм тот же, разделение нужно
#               только чтобы видеть, что чьё. Чужой namespace зарегистрировать
#               безопасно: если плагин не установлен, словарь просто не
#               запрашивается.
merged = {}
sources = (sorted(glob.glob(os.path.join(HERE, 'ru', '*.json')))
           + sorted(glob.glob(os.path.join(HERE, 'ru-plugins', '*.json'))))
for path in sources:
    part = json.load(open(path, encoding='utf-8'))
    for ns, entries in part.items():
        merged.setdefault(ns, {}).update(entries)

payload = json.dumps(merged, ensure_ascii=False, indent=1, sort_keys=True)

CSS = (
    '.drl-row{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}'
    '.drl-text{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px;display:flex}'
    '.drl-title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}'
    '.drl-sub{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}'
    '.drl-switch{background:var(--dsw-alias-bg-module-platform);height:36px;font:inherit;color:var(--dsw-alias-label-primary);cursor:pointer;border:none;border-radius:18px;align-items:center;gap:10px;padding:0 14px;font-size:14px;line-height:22px;display:inline-flex}'
    '.drl-switch:hover{background:var(--dsw-alias-interactive-bg-hover)}'
    '.drl-knob{width:14px;height:14px;border-radius:50%;background:var(--dsw-alias-label-tertiary);flex:none}'
    '.drl-on .drl-knob{background:var(--dsw-alias-state-success-primary)}'
)

client = '''// dsh-russian-lang — браузерная половина. ФАЙЛ СГЕНЕРИРОВАН, правьте ru/*.json
// и ru-plugins/*.json и запускайте build.py.
//
// Плагин докладывает русский словарь в чужие namespace'ы: реестр локалей это
// разрешает — register(ns, locale, dict) конфликтует только если пара
// (namespace, язык) уже занята, а "ru" не занимает никто.
//
// Ядро без русского: список языков для селектора и setLocale() зашит в
// @deepseek-ai/dsh-client-locale (zh/en). Поэтому переключатель плагина
// активирует русский публичным методом runtime (publish), а не через ядро —
// ничьи файлы не патчатся. Если ядро узнает "ru" само (список расширят),
// плагин пойдёт штатным setLocale().
window.__ModuleLoader__.load({
  id: '@goodandready/dsh-russian-lang',
  factory: (require) => {
    var module = { exports: {} }
    const React = require('react')

    /** namespace -> { ключ: перевод } */
    const RU = %s

    const SETTINGS_NS_NAME = 'russianLang'

    const CSS = %s

    function apply(ctx) {
      // 1. Словари: каждый namespace — свой эффект, словарь снимается вместе с
      // плагином. Если namespace уже несёт ru (плагин локализовался сам) —
      // не конфликтуем.
      for (const ns of Object.keys(RU)) {
        ctx.effect(() => {
          try { return ctx.locale.register(ns, 'ru', RU[ns]) }
          catch (err) { return () => {} }
        }, 'dsh-russian-lang: ' + ns)
      }

      const coreHasRu = () => {
        try { return ctx.locale.getLocale().locales.some((l) => l.id === 'ru') }
        catch (err) { return false }
      }

      // Штатный путь, если ядро знает ru; иначе публичный publish.
      const activate = (id) => {
        try {
          if (coreHasRu()) ctx.locale.setLocale(id)
          else ctx.locale.publish(id, true)
        } catch (err) { console.warn('dsh-russian-lang: switch failed', err) }
      }

      // 2. Настойка-переключатель: читаем сохранённое enabled через штатный
      // settings scope и включаем русский на старте.
      const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS_NAME })
      let booted = false
      const tryBoot = () => {
        if (booted) return
        try {
          const value = scope.getSnapshot().value
          if (value && value.enabled === true) { booted = true; activate('ru') }
        } catch (err) { /* снимок ещё не готов — догоним по subscribe */ }
      }
      ctx.effect(() => scope.subscribe(tryBoot), 'dsh-russian-lang: boot')
      tryBoot()

      // 3. <html lang>: в таблице DOCUMENT_LANGUAGE ядра нет "ru" и без нас там
      // окажется undefined. Поправляем после каждого переключения (наш слушатель
      // зарегистрирован позже ядерного и перекрывает его запись).
      const syncLang = () => {
        try {
          if (typeof document !== 'undefined' && document.documentElement
              && ctx.locale.getLocale().active === 'ru') {
            document.documentElement.lang = 'ru'
          }
        } catch (err) { /* ignore */ }
      }
      ctx.effect(() => ctx.locale.subscribe(syncLang), 'dsh-russian-lang: html-lang')
      syncLang()

      // 4. Строка «Русский язык» в Настройки -> Общие (тот же слот, где живёт
      // ядерная строка Language). Состояние держим сами: ядро не знает про ru,
      // его store нам не подходит.
      if (typeof document !== 'undefined' && !document.querySelector('style[data-plugin-css="dsh-russian-lang"]')) {
        const tag = document.createElement('style')
        tag.setAttribute('data-plugin', 'dsh-russian-lang')
        tag.dataset.pluginCss = 'dsh-russian-lang'
        tag.textContent = CSS
        document.head.appendChild(tag)
      }

      function RussianRow() {
        const isActive = () => {
          try { return ctx.locale.getLocale().active === 'ru' }
          catch (err) { return false }
        }
        const [on, setOn] = React.useState(isActive)
        React.useEffect(() => {
          const update = () => setOn(isActive())
          try { return ctx.locale.subscribe(update) }
          catch (err) { return undefined }
        }, [])

        const toggle = () => {
          if (on) {
            booted = false
            try { scope.set('enabled', false) } catch (err) { /* ignore */ }
            activate('en')
          } else {
            try { scope.set('enabled', true) } catch (err) { /* ignore */ }
            activate('ru')
          }
        }

        return React.createElement('div', { className: 'drl-row' },
          React.createElement('div', { className: 'drl-text' },
            React.createElement('div', { className: 'drl-title' }, 'Русский язык'),
            React.createElement('div', { className: 'drl-sub' },
              on ? 'Перевод интерфейса включён' : 'Перевод интерфейса выключен')),
          React.createElement('button', {
            type: 'button',
            className: 'drl-switch' + (on ? ' drl-on' : ''),
            'aria-pressed': on,
            onClick: toggle
          },
            React.createElement('span', { className: 'drl-knob' }),
            React.createElement('span', null, on ? 'Вкл' : 'Выкл')))
      }

      ctx.slots.inject('settings.general.item', () => ctx.slots.register({
        name: 'settings.general.item',
        id: 'dsh-russian-lang',
        order: 1,
        inject: () => ({})
      }, RussianRow))
    }

    module.exports = { apply, inject: ['slots', 'locale', 'connection', 'remote', 'settingsScope'] }
    return module.exports
  },
})
''' % (payload, json.dumps(CSS, ensure_ascii=False))

open(os.path.join(HERE, 'lib', 'client.js'), 'w', encoding='utf-8').write(client)
print('namespace-ов: %d, ключей: %d -> lib/client.js'
      % (len(merged), sum(len(v) for v in merged.values())))
