import { makePluginLocalizationStatus } from "./pure.js"
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CORE_FILE = join(__dirname, "locales", "core.json")
const PLUGINS_DIR = join(__dirname, "locales", "plugins")
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
}

export function getCoreDictionaries() {
  if (existsSync(CORE_FILE)) {
    try {
      return JSON.parse(readFileSync(CORE_FILE, "utf8"))
    } catch (_) { /* bestEffort */ void _; }
  }
  return {}
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
const PKG_FILE = join(__dirname, "..", "package.json")

export function getPluginsLocalizationOverview() {
  ensurePluginCache()
  let inventory = null
  let pluginsEn = null
  let pkg = null

  if (existsSync(INVENTORY_FILE)) {
    try { inventory = JSON.parse(readFileSync(INVENTORY_FILE, "utf8")) } catch (_) { /* bestEffort */ void _; }
  }
  if (existsSync(PLUGINS_EN_FILE)) {
    try { pluginsEn = JSON.parse(readFileSync(PLUGINS_EN_FILE, "utf8")) } catch (_) { /* bestEffort */ void _; }
  }
  if (existsSync(PKG_FILE)) {
    try { pkg = JSON.parse(readFileSync(PKG_FILE, "utf8")) } catch (_) { /* bestEffort */ void _; }
  }

  const getStatus = makePluginLocalizationStatus(_pluginCache, pluginsEn, inventory)
  const supportedPlugins = (inventory && inventory.supported_plugins) || {}

  let installedDeps = {}
  try {
    const webPkgPath = join(process.env.HOME || "/home/vadim", ".dsh", "profiles", "web", "package.json")
    if (existsSync(webPkgPath)) {
      const wp = JSON.parse(readFileSync(webPkgPath, "utf8"))
      installedDeps = wp.dependencies || {}
    }
  } catch (_) { /* bestEffort */ void _; }

  const pluginsList = []

  for (const [pkgName, ver] of Object.entries(supportedPlugins)) {
    const baseName = pkgName.replace(/^@[^/]+\//, "")
    const ns = _pluginIndex.get(baseName.toLowerCase()) || _pluginIndex.get(pkgName.toLowerCase()) || baseName
    let installedVer = installedDeps[pkgName] || null
    if (installedVer) {
      const m = String(installedVer).match(/(\d+\.\d+\.\d+)/)
      if (m) installedVer = m[1]
    }
    const cleanVer = String(ver).replace(/^(\^|~|>=)?(file:[^#]+#?)?/, "").replace(/^.*-(\d+\.\d+\.\d+).tgz$/, "$1")

    const stat = getStatus(ns, pkgName, installedVer || cleanVer)
    pluginsList.push({
      packageName: pkgName,
      namespace: ns,
      installedVersion: installedVer || cleanVer,
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
    partialCount: pluginsList.filter((p) => p.status === "partial").length,
    noneCount: pluginsList.filter((p) => p.status === "none").length,
    dshVersion: (inventory && inventory.core && inventory.core.supported_version) || "0.2.1-alpha.1",
    dshRussianLangVersion: (pkg && pkg.version) || "__PKG_VERSION__"
  }
}
