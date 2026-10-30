/**
 * SafeLocaleProxy: рантайм-защита от сбоев при регистрации и обращении к ключам словарей.
 * Реализация issue #550.
 */

export function createSafeLocaleProxy(dict, fallback = {}) {
  const handler = {
    get(target, prop, receiver) {
      if (typeof prop === 'symbol' || prop === 'toJSON' || prop === 'valueOf' || prop === 'toString' || prop === 'constructor') {
        return Reflect.get(target, prop, receiver)
      }
      if (prop in target && target[prop] !== undefined) {
        const val = target[prop]
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          return new Proxy(val, handler)
        }
        return val
      }
      if (fallback && prop in fallback && fallback[prop] !== undefined) {
        const fval = fallback[prop]
        if (fval !== null && typeof fval === 'object' && !Array.isArray(fval)) {
          return new Proxy(fval, handler)
        }
        return fval
      }
      const emptyObj = {}
      emptyObj[Symbol.toPrimitive] = () => ''
      emptyObj.toString = () => ''
      return new Proxy(emptyObj, handler)
    }
  }
  return new Proxy(dict || {}, handler)
}

/**
 * Оборачивает метод `register` у сервиса локалей DSH, перехватывая ошибки
 * «already has locale ...» и безопасно объединяя словари вместо сбоя DSH (#550).
 */
export function installSafeLocaleRegistration(localeService) {
  if (!localeService || localeService.__safeLocaleInstalled) return localeService
  const origRegister = localeService.register
  if (typeof origRegister !== 'function') return localeService

  localeService.register = function safeRegister(ns, langOrLocales, dict) {
    try {
      return origRegister.call(localeService, ns, langOrLocales, dict)
    } catch (err) {
      const msg = String(err?.message || err)
      if (msg.includes('already has locale')) {
        const pairs = typeof langOrLocales === 'string'
          ? [[langOrLocales, dict]]
          : Object.entries(langOrLocales || {})
        const dicts = localeService.dicts
        if (dicts instanceof Map) {
          let nsMap = dicts.get(ns)
          if (!nsMap) {
            nsMap = new Map()
            dicts.set(ns, nsMap)
          }
          for (const [loc, d] of pairs) {
            if (nsMap.has(loc)) {
              const target = nsMap.get(loc)
              if (target && typeof target === 'object' && d && typeof d === 'object') {
                Object.assign(target, d)
              }
            } else {
              nsMap.set(loc, d)
            }
          }
          if (typeof localeService.publish === 'function' && localeService.snapshot) {
            try { localeService.publish(localeService.snapshot.active, false) } catch (_) {}
          }
          return () => {}
        }
      }
      throw err
    }
  }
  localeService.__safeLocaleInstalled = true
  return localeService
}

/**
 * Безопасный вызов регистрации локали: перехватывает ошибки и гарантирует объединение (#550).
 */
export function safeRegisterLocale(localeService, ns, langOrLocales, dict) {
  if (!localeService || typeof localeService.register !== 'function') return () => {}
  installSafeLocaleRegistration(localeService)
  try {
    return localeService.register(ns, langOrLocales, dict)
  } catch (err) {
    /* bestEffort */
    return () => {}
  }
}
