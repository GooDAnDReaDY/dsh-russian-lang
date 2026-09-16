import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CORE_FILE = join(__dirname, "locales", "core.json")
const PLUGINS_DIR = join(__dirname, "locales", "plugins")
const ZH_RU_FILE = join(__dirname, "locales", "zh-ru.json")

export function getCoreDictionaries() {
  if (existsSync(CORE_FILE)) {
    try {
      return JSON.parse(readFileSync(CORE_FILE, "utf8"))
    } catch (_) {}
  }
  return {}
}

export function getPluginDictionaries() {
  const merged = {}
  if (existsSync(PLUGINS_DIR)) {
    for (const file of readdirSync(PLUGINS_DIR).sort()) {
      if (!file.endsWith(".json")) continue
      try {
        const data = JSON.parse(readFileSync(join(PLUGINS_DIR, file), "utf8"))
        for (const [ns, entries] of Object.entries(data)) {
          merged[ns] = Object.assign(merged[ns] || {}, entries)
        }
      } catch (_) {}
    }
  }
  return merged
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
    } catch (_) {}
  }
  return {}
}
