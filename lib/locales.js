import { makePluginLocalizationStatus, HEADLESS_PLUGINS, PACKAGE_ALIASES, resolvePluginNamespace } from "./pure.js"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { resolveDshHome, dshHomePath, canonicalizeWatchPath } from "@deepseek-ai/dsh-home-paths"
export { resolveDshHome, dshHomePath, canonicalizeWatchPath }

const __dirname = dirname(fileURLToPath(import.meta.url))
const CORE_FILE = join(__dirname, "locales", "core.json")
const CORE_BASE_FILE = join(__dirname, "locales", "core-base.json")
const CORE_EXTRA_FILE = join(__dirname, "locales", "core-extra.json")
const PLUGINS_DIR = join(__dirname, "locales", "plugins")

export function loadUserCustomLocales(customHome) {
  const userLocalesDir = customHome ? join(customHome, "locales", "ru") : dshHomePath("locales", "ru")
  if (!existsSync(userLocalesDir)) return Object.create(null)
  const result = Object.create(null)
  try {
    for (const file of readdirSync(userLocalesDir).sort()) {
      if (!file.endsWith(".json")) continue
      try {
        const data = JSON.parse(readFileSync(join(userLocalesDir, file), "utf8"))
        if (!data || typeof data !== "object") continue
        for (const [ns, entries] of Object.entries(data)) {
          // #558: Защита от Prototype Pollution
          if (!ns || ns === "__proto__" || ns === "constructor" || ns === "prototype") continue
          if (typeof ns !== "string" || !/^[a-zA-Z0-9@_./-]+$/.test(ns)) continue
          if (!entries || typeof entries !== "object" || Array.isArray(entries)) continue

          if (!result[ns]) {
            result[ns] = Object.create(null)
          }
          for (const [k, v] of Object.entries(entries)) {
            if (!k || k === "__proto__" || k === "constructor" || k === "prototype") continue
            if (typeof v === "string") {
              result[ns][k] = v
            }
          }
        }
      } catch (_) {}
    }
  } catch (_) {}
  return result
}

const ZH_RU_FILE = join(__dirname, "locales", "zh-ru.json")

let _pluginCache = null
let _pluginIndex = null

function ensurePluginCache() {
  if (_pluginCache && _pluginIndex) return
  _pluginCache = {}
  _pluginIndex = new Map()
  if (existsSync(PLUGINS_DIR)) {
    for (const file of readdirSync(PLUGINS_DIR).sort()) {
      if (!file.endsWith(".json")) continue
      try {
        const data = JSON.parse(readFileSync(join(PLUGINS_DIR, file), "utf8"))
        for (const [ns, entries] of Object.entries(data)) {
          _pluginCache[ns] = Object.assign(_pluginCache[ns] || {}, entries)
          _pluginIndex.set(ns.toLowerCase(), ns)
          const baseName = ns.replace(/^@[^/]+\//, "")
          _pluginIndex.set(baseName.toLowerCase(), ns)
        }
      } catch (_) { /* bestEffort */ void _; }
    }
  }
  for (const [pkg, targetNs] of Object.entries(PACKAGE_ALIASES)) {
    if (_pluginCache[targetNs]) {
      _pluginIndex.set(pkg.toLowerCase(), targetNs)
      _pluginIndex.set(pkg.replace(/^@[^/]+\//, "").toLowerCase(), targetNs)
    }
  }
  // Наложение пользовательских словарей для плагинов (#551, #558)
  const userLocales = loadUserCustomLocales()
  for (const [ns, dict] of Object.entries(userLocales)) {
    if (!ns || ns === "__proto__" || ns === "constructor" || ns === "prototype") continue
    if (!_pluginCache[ns]) {
      _pluginCache[ns] = {}
    }
    for (const [k, v] of Object.entries(dict)) {
      if (!k || k === "__proto__" || k === "constructor" || k === "prototype") continue
      if (typeof v === "string") {
        _pluginCache[ns][k] = v
      }
    }
    _pluginIndex.set(ns.toLowerCase(), ns)
    _pluginIndex.set(ns.replace(/^@[^/]+\//, "").toLowerCase(), ns)
  }
}

export function getCoreBaseDictionaries() {
  let base = {}
  if (existsSync(CORE_BASE_FILE)) {
    try {
      base = JSON.parse(readFileSync(CORE_BASE_FILE, "utf8")) || {}
    } catch (_) {
      base = {}
    }
  }
  const userLocales = loadUserCustomLocales()
  for (const [ns, dict] of Object.entries(userLocales)) {
    if (!ns || ns === "__proto__" || ns === "constructor" || ns === "prototype") continue
    if (base[ns]) {
      for (const [k, v] of Object.entries(dict)) {
        if (!k || k === "__proto__" || k === "constructor" || k === "prototype") continue
        if (typeof v === "string") {
          base[ns][k] = v
        }
      }
    }
  }
  return base
}

export function getCoreExtraDictionaries() {
  let extra = {}
  if (existsSync(CORE_EXTRA_FILE)) {
    try {
      extra = JSON.parse(readFileSync(CORE_EXTRA_FILE, "utf8")) || {}
    } catch (_) {
      extra = {}
    }
  }
  const userLocales = loadUserCustomLocales()
  for (const [ns, dict] of Object.entries(userLocales)) {
    if (!ns || ns === "__proto__" || ns === "constructor" || ns === "prototype") continue
    if (extra[ns]) {
      for (const [k, v] of Object.entries(dict)) {
        if (!k || k === "__proto__" || k === "constructor" || k === "prototype") continue
        if (typeof v === "string") {
          extra[ns][k] = v
        }
      }
    }
  }
  return extra
}

export function getCoreDictionaries() {
  let merged = {}
  if (existsSync(CORE_BASE_FILE) && existsSync(CORE_EXTRA_FILE)) {
    Object.assign(merged, getCoreBaseDictionaries(), getCoreExtraDictionaries())
  } else if (existsSync(CORE_FILE)) {
    try {
      merged = JSON.parse(readFileSync(CORE_FILE, "utf8")) || {}
    } catch (_) {
      merged = {}
    }
    const userLocales = loadUserCustomLocales()
    for (const [ns, dict] of Object.entries(userLocales)) {
      if (!ns || ns === "__proto__" || ns === "constructor" || ns === "prototype") continue
      if (merged[ns]) {
        for (const [k, v] of Object.entries(dict)) {
          if (!k || k === "__proto__" || k === "constructor" || k === "prototype") continue
          if (typeof v === "string") {
            merged[ns][k] = v
          }
        }
      }
    }
  }
  return merged
}

export function getPluginDictionaries() {
  ensurePluginCache()
  return Object.assign(
    {},
    _pluginCache
  )
}

export function getPluginDictionariesByNames(names) {
  ensurePluginCache()
  if (!names || (Array.isArray(names) && names.length === 0)) {
    return Object.assign(
      {},
      _pluginCache
    )
  }
  const nameList = Array.isArray(names) ? names : String(names).split(",")
  const result = {}
  for (const rawName of nameList) {
    const trimmed = String(rawName).trim()
    if (!trimmed) continue
    const targetNs = _pluginIndex.get(trimmed.toLowerCase())
    if (targetNs && _pluginCache[targetNs]) {
      result[targetNs] = _pluginCache[targetNs]
    } else if (_pluginCache[trimmed]) {
      result[trimmed] = _pluginCache[trimmed]
    }
  }
  return result
}

export function getAllDictionaries() {
  const core = getCoreDictionaries()
  const plugins = getPluginDictionaries()
  return Object.assign({}, core, plugins)
}

export function getZhRuMap() {
  if (existsSync(ZH_RU_FILE)) {
    try {
      return JSON.parse(readFileSync(ZH_RU_FILE, "utf8"))
    } catch (_) { /* bestEffort */ void _; }
  }
  return {}
}

const INVENTORY_FILE = join(__dirname, "..", "supported-inventory.json")
const PLUGINS_EN_FILE = join(__dirname, "..", "plugins-en.json")
const PLUGINS_EN_DIR = join(__dirname, "locales", "plugins-en")
const PKG_FILE = join(__dirname, "..", "package.json")

export function resolveProfileDir() {
  const profileName = process.env.DSH_PROFILE || "web"
  return dshHomePath("profiles", profileName)
}

export function getInstalledPluginVersion(profileDir, pkgName, declaredSpec) {
  // 1. Попытка прочесть точный package.json из node_modules/<pkgName>/package.json (#543)
  if (!profileDir || !pkgName) return null
  const parts = pkgName.split("/")
  const nmPkgPath = join(profileDir, "node_modules", ...parts, "package.json")
  if (existsSync(nmPkgPath)) {
    try {
      const pdata = JSON.parse(readFileSync(nmPkgPath, "utf8"))
      if (pdata && pdata.version) {
        return String(pdata.version).trim()
      }
    } catch (_) {}
  }

  // 2. Если в node_modules пакета нет — пакет не установлен на диске (#543).
  // Не выдаём спецификацию или версию inventory за установленную версию.
  return null
}

export function getPluginsLocalizationOverview() {
  ensurePluginCache()
  let inventory = null
  let pluginsEn = null
  let pkg = null

  if (existsSync(INVENTORY_FILE)) {
    try { inventory = JSON.parse(readFileSync(INVENTORY_FILE, "utf8")) } catch (_) { /* bestEffort */ void _; }
  }
  // #537: Если в inventory есть plugins_coverage, исключаем чтение каталога с 50 JSON-файлами
  if (!inventory || !inventory.plugins_coverage) {
    if (existsSync(PLUGINS_EN_FILE)) {
      try { pluginsEn = JSON.parse(readFileSync(PLUGINS_EN_FILE, "utf8")) } catch (_) { /* bestEffort */ void _; }
    } else if (existsSync(PLUGINS_EN_DIR)) {
      pluginsEn = {}
      try {
        for (const file of readdirSync(PLUGINS_EN_DIR).sort()) {
          if (!file.endsWith(".json")) continue
          try {
            const data = JSON.parse(readFileSync(join(PLUGINS_EN_DIR, file), "utf8"))
            Object.assign(pluginsEn, data)
          } catch (_) { /* bestEffort */ void _; }
        }
      } catch (_) { /* bestEffort */ void _; }
    }
  }
  if (existsSync(PKG_FILE)) {
    try { pkg = JSON.parse(readFileSync(PKG_FILE, "utf8")) } catch (_) { /* bestEffort */ void _; }
  }

  const getStatus = makePluginLocalizationStatus(_pluginCache, pluginsEn, inventory)
  const supportedPlugins = (inventory && inventory.supported_plugins) || {}

  const profileDir = resolveProfileDir()
  let installedDeps = {}
  try {
    const webPkgPath = join(profileDir, "package.json")
    if (existsSync(webPkgPath)) {
      const wp = JSON.parse(readFileSync(webPkgPath, "utf8"))
      installedDeps = wp.dependencies || {}
    }
  } catch (_) { /* bestEffort */ void _; }

  const pluginsList = []

  for (const [pkgName, ver] of Object.entries(supportedPlugins)) {
    const declared = installedDeps[pkgName] || null
    const installedVer = getInstalledPluginVersion(profileDir, pkgName, declared)
    const cleanVer = String(ver).replace(/^(\^|~|>=)?(file:[^#]+#?)?/, "").replace(/^.*-(\d+\.\d+\.\d+).tgz$/, "$1")

    if (HEADLESS_PLUGINS.has(pkgName) || (inventory && Array.isArray(inventory.headless_plugins) && inventory.headless_plugins.includes(pkgName))) {
      pluginsList.push({
        packageName: pkgName,
        namespace: null,
        installedVersion: installedVer,
        verifiedVersion: cleanVer,
        status: "headless",
        count: 0,
        total: 0,
        percent: 100,
        label: "Серверный плагин (без UI)",
        missingKeys: []
      })
      continue
    }

    const resolvedNs = resolvePluginNamespace(pkgName, _pluginCache)
    const ns = resolvedNs || _pluginIndex.get(pkgName.replace(/^@[^/]+\//, "").toLowerCase()) || pkgName
    const stat = getStatus(ns, pkgName, installedVer)

    pluginsList.push({
      packageName: pkgName,
      namespace: ns,
      installedVersion: installedVer,
      verifiedVersion: cleanVer,
      status: stat.status,
      count: stat.count,
      total: stat.total,
      percent: stat.percent,
      label: stat.label,
      missingKeys: stat.missingKeys
    })
  }

  pluginsList.sort((a, b) => a.packageName.localeCompare(b.packageName))

  return {
    plugins: pluginsList,
    totalPlugins: pluginsList.length,
    fullCount: pluginsList.filter((p) => p.status === "full").length,
    headlessCount: pluginsList.filter((p) => p.status === "headless").length,
    partialCount: pluginsList.filter((p) => p.status === "partial").length,
    noneCount: pluginsList.filter((p) => p.status === "none").length,
    unverifiedCount: pluginsList.filter((p) => p.status === "unverified").length,
    dshVersion: (inventory && inventory.core && inventory.core.supported_version) || "0.2.1-rc.4",
    dshRussianLangVersion: (pkg && pkg.version) || "__PKG_VERSION__"
  }
}
