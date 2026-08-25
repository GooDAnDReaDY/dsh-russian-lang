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

client = '''// dsh-russian-lang — браузерная половина. ФАЙЛ СГЕНЕРИРОВАН, правьте ru/*.json
// и ru-plugins/*.json и запускайте build.py.
//
// Плагин докладывает русский словарь в чужие namespace'ы: реестр локалей это
// разрешает — register(ns, locale, dict) конфликтует только если пара
// (namespace, язык) уже занята, а "ru" не занимает никто.
//
// Ядро без русского: список языков (LOCALES) зашит в @deepseek-ai/dsh-client-locale,
// из него родная строка Language строит меню и setLocale() берёт валидацию.
// Список живёт в snapshot локаль-runtime — плагин расширяет snapshot пунктом
// "Русский", и родной селектор показывает его третьей позицией. Файлы ядра не
// правятся; если ядро когда-нибудь узнает "ru" само, расширение не происходит.
window.__ModuleLoader__.load({
  id: '@goodandready/dsh-russian-lang',
  factory: (require) => {
    var module = { exports: {} }

    /** namespace -> { ключ: перевод } */
    const RU = %s

    const SETTINGS_NS_NAME = 'russian-lang'

    function apply(ctx) {
      const runtime = ctx.locale
      const scope = ctx.settingsScope.bind({ namespace: SETTINGS_NS_NAME })

      // 1. Словари: каждый namespace — свой эффект, словарь снимается вместе с
      // плагином. Если namespace уже несёт ru (плагин локализовался сам) —
      // не конфликтуем.
      for (const ns of Object.keys(RU)) {
        ctx.effect(() => {
          try { return ctx.locale.register(ns, 'ru', RU[ns]) }
          catch (err) { return () => {} }
        }, 'dsh-russian-lang: ' + ns)
      }

      // 1b. Пользовательские переопределения + плюрализация.
      // Overrides: пользовательский слой поверх словарей (russian-lang.overrides).
      // Plural: ядро выбирает .one/.other по n===1, русскому нужны few/many.
      const pluralRules = new Intl.PluralRules('ru-RU')
      const origTranslate = runtime.translate.bind(runtime)
      const getOverrides = () => {
        try {
          const value = scope.getSnapshot().value
          return value && value.overrides ? value.overrides : {}
        } catch (err) { return {} }
      }
      const fill = (template, params) => template.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match)
      runtime.translate = function (ns, key, params) {
        // 1. Пользовательский override — самый верхний слой.
        const overrides = getOverrides()
        if (overrides[key] !== undefined) {
          return params ? fill(overrides[key], params) : overrides[key]
        }
        // 2. Плюрализация для русского.
        const m = /^(.*)[.](one|other)$/.exec(key)
        if (m && runtime.getLocale().active === 'ru' && params) {
          const n = params.n ?? params.count
          if (typeof n === 'number') {
            const form = pluralRules.select(n)
            if (form === 'few' || form === 'many') {
              const pluralKey = m[1] + '.' + form
              const template = this.lookup(ns, pluralKey) ?? this.lookup('common', pluralKey)
              if (template !== undefined) {
                return fill(template, params)
              }
            }
          }
        }
        return origTranslate(ns, key, params)
      }

      // 2. <html lang>: в таблице DOCUMENT_LANGUAGE ядра нет "ru", без нас там
      // окажется undefined после переключения.
      const syncLang = () => {
        try {
          if (typeof document !== 'undefined' && document.documentElement
              && runtime.getLocale().active === 'ru') {
            document.documentElement.lang = 'ru-RU'
          }
        } catch (err) { /* ignore */ }
      }

      const native = runtime.getLocale().locales.some((l) => l.id === 'ru')

      if (!native) {
        // Ядро не знает ru: добавляем его в snapshot runtime. Родная строка
        // Language берёт меню из snapshot.locales, setLocale() по нему же
        // валидирует выбор — «Русский» появляется в родном списке.
        const s0 = runtime.getLocale()
        runtime.snapshot = Object.freeze({
          active: s0.active,
          locales: s0.locales.concat([{ id: 'ru', label: 'Русский' }]),
          revision: s0.revision + 1
        })
        ctx.emit('locale/change', runtime.snapshot)
        syncLang()

        // Хост-схема namespace "locale" знает только zh/en, запись preference
        // "ru" он отклонит. Перехватываем её: выбор сохраняется нашим флагом
        // russian-lang.enabled, остальные языки пишутся штатно.
        //
        // Кроме того, adopt() в ядре при каждом обновлении настроек возвращает
        // активный язык к сохранённому preference (или языку браузера): он
        // читает scope через getSnapshot. Пока активен русский, докладываем в
        // снимок preference "ru", иначе любой settings-запись вернёт en.
        const realHost = runtime.host
        if (realHost) {
          const origGetSnapshot = realHost.getSnapshot.bind(realHost)
          const patchedGetSnapshot = () => {
            const s = origGetSnapshot()
            try {
              if (runtime.getLocale().active === 'ru') {
                return Object.assign({}, s, {
                  value: Object.assign({}, s && s.value ? s.value : {}, { preference: 'ru' })
                })
              }
            } catch (err) { /* ignore */ }
            return s
          }
          realHost.getSnapshot = patchedGetSnapshot
          runtime.host = {
            getSnapshot: patchedGetSnapshot,
            subscribe: (fn) => realHost.subscribe(fn),
            set: (field, value) => {
              if (field === 'preference' && value === 'ru') return Promise.resolve()
              return realHost.set(field, value)
            },
            unset: (field) => realHost.unset ? realHost.unset(field) : Promise.resolve()
          }
        }
      }

      // 3. Флаг russianLang.enabled всегда повторяет активный язык: выбор
      // английского или китайского в родном меню выключает русский и наоборот.
      const syncFlag = () => {
        try {
          const wantRu = runtime.getLocale().active === 'ru'
          const value = scope.getSnapshot().value || {}
          if (!!value.enabled !== wantRu) scope.set('enabled', wantRu)
        } catch (err) { /* снимок ещё не готов */ }
      }
      ctx.effect(() => {
        try { return runtime.subscribe(syncFlag) }
        catch (err) { return undefined }
      }, 'dsh-russian-lang: sync-flag')

      // 4. Старт: сохранённый флаг включает русский.
      const activate = () => {
        try {
          if (runtime.getLocale().active === 'ru') return
          if (native) runtime.setLocale('ru')
          else runtime.publish('ru', true)
        } catch (err) { console.warn('dsh-russian-lang: activate failed', err) }
      }
      let booted = false
      const tryBoot = () => {
        if (booted) return
        try {
          const value = scope.getSnapshot().value
          if (value && value.enabled === true) { booted = true; activate() }
        } catch (err) { /* ignore */ }
      }
      ctx.effect(() => scope.subscribe(tryBoot), 'dsh-russian-lang: boot')
      tryBoot()

      // Подписчик регистрируется синхронно, до первого publish() в tryBoot
      // ниже - иначе ctx.effect откладывает выполнение, и boot-publish
      // происходит до того, как syncLang слушатель зарегистрирован.
      const unsubscribeLang = runtime.subscribe(syncLang)
      ctx.effect(() => unsubscribeLang, 'dsh-russian-lang: html-lang')
      syncLang()
    }

    module.exports = { apply, inject: ['locale', 'connection', 'remote', 'settingsScope'] }
    return module.exports
  },
})
''' % payload

open(os.path.join(HERE, 'lib', 'client.js'), 'w', encoding='utf-8').write(client)
print('namespace-ов: %d, ключей: %d -> lib/client.js'
      % (len(merged), sum(len(v) for v in merged.values())))
