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
      return JSON.parse(readFileSync(ZG_RU_FILE, "utf8"))
    } catch (_) { /* bestEffort */ void _; }
  }
  return {}
}
