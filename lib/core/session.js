import { fuzzyMatchRu, translitEnToRu } from './format.js'
import { translit, LAYOUT_LAT_TO_CYR, LAYOUT_CYR_TO_LAT, phoneticTranslit } from './layout.js'
// ------------------------------------------------- пресеты промптов агента

export const SYSTEM_PROMPT_PRESETS = {
  technical_expert: {
    id: 'technical_expert',
    label: 'Технический эксперт',
    desc: 'Точная терминология, чистый код и русские комментарии',
    text: 'Отвечай пользователю на русском языке. Используй точную инженерную терминологию, пиши чистый код и русские комментарии.'
  },
  tech_writer: {
    id: 'tech_writer',
    label: 'Технический писатель',
    desc: 'Структурированные тексты, Markdown и выверенная типографика',
    text: 'Отвечай пользователю на русском языке. Оформляй документацию в Markdown, строго соблюдай правила русской типографики («ёлочки», тире, «ё»).'
  },
  concise: {
    id: 'concise',
    label: 'Лаконичный режим',
    desc: 'Краткие ёмкие ответы без вводных слов и воды',
    text: 'Отвечай пользователю на русском языке максимально кратко и ёмко. Без вводных слов и воды, сразу код или решение.'
  },
  code_reviewer: {
    id: 'code_reviewer',
    label: 'Код-ревьюер',
    desc: 'Поиск багов, безопасность и архитектурный аудит',
    text: 'Анализируй код и отвечай на русском языке. Ищи уязвимости, граничные случаи и нарушения контрактов, предлагая исправления.'
  },
  architect: {
    id: 'architect',
    label: 'Системный архитектор',
    desc: 'Контракты API/CLI, модульность и надёжность',
    text: 'Отвечай на русском языке как архитектор. Проектируй модульные системы, чёткие контракты API/CLI и надёжные решения без лишней сложности.'
  },
  tutor: {
    id: 'tutor',
    label: 'Наставник (ментор)',
    desc: 'Понятные объяснения сложных концепций и пошаговый разбор',
    text: 'Отвечай на русском языке как наставник. Объясняй сложные темы простыми словами, наглядными аналогиями и пошаговыми примерами.'
  }
}

// -------------------------------------------------- локализованный экспорт

/**
 * Генерирует локализованный Markdown-отчёт по сессии диалога.
 */
export const exportSessionToMarkdown = (session, options = {}) => {
  if (!session) return ''
  const {
    includeToolCalls = true,
    includeTimestamps = true,
    title: customTitle,
    footer: customFooter
  } = options
  const title = customTitle || session.title || session.name || 'Диалог DSH'
  const date = session.createdAt ? new Date(session.createdAt) : new Date()
  const dateStr = includeTimestamps ? new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'full',
    timeStyle: 'medium'
  }).format(date) : null

  const messages = Array.isArray(session.messages) ? session.messages : []
  let md = `# 💬 ${title}\n\n`
  if (dateStr) md += `> **Дата экспорта:** ${dateStr}\n`
  if (session.model) md += `> **Модель:** \`${session.model}\`\n`
  if (session.workspace) md += `> **Рабочая область:** \`${session.workspace}\`\n`
  md += `> **Всего сообщений:** ${messages.length}\n\n---\n\n`

  for (let idx = 0; idx < messages.length; idx++) {
    const msg = messages[idx]
    const role = msg.role || 'unknown'
    const roleName = role === 'user' ? '👤 Пользователь' :
                     role === 'assistant' ? '🤖 Ассистент' :
                     role === 'system' ? '⚙️ Система' : `🔧 Инструмент (${role})`

    md += `### ${roleName}\n\n`
    if (msg.content) {
      md += `${msg.content}\n\n`
    }
    if (includeToolCalls && Array.isArray(msg.toolCalls) && msg.toolCalls.length) {
      md += `*Вызовы инструментов:*\n`
      for (const tc of msg.toolCalls) {
        md += `- **${tc.name || 'tool'}**: \`${JSON.stringify(tc.arguments || {})}\`\n`
      }
      md += `\n`
    }
    md += `---\n\n`
  }

  const footer = customFooter !== undefined
    ? customFooter
    : `*Сгенерировано с помощью [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) и @goodandready/dsh-russian-lang*\n`
  if (footer) md += footer
  return md
}

// -------------------------------------------------- инспектор переводов и оверрайды (#298, #330)

export const findTranslationKey = (text, dicts = {}, overrides = {}, zhRu = {}, domEn = {}, options = {}) => {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  if (!trimmed) return null

  // 1. Оверрайды пользователя (наивысший приоритет)
  if (overrides && typeof overrides === 'object') {
    if (overrides[trimmed] !== undefined) {
      return { key: trimmed, value: overrides[trimmed], source: 'override' }
    }
    for (const [k, v] of Object.entries(overrides)) {
      if (v === text || (typeof v === 'string' && v.trim() === trimmed)) {
        return { key: k, value: v, source: 'override' }
      }
    }
  }

  // 2. Словари неймспейсов
  if (dicts && typeof dicts === 'object') {
    for (const [ns, map] of Object.entries(dicts)) {
      if (!map || typeof map !== 'object') continue
      if (map[trimmed] !== undefined) {
        return { ns, key: trimmed, value: map[trimmed], source: 'dictionary' }
      }
      for (const [k, v] of Object.entries(map)) {
        if (v === text || (typeof v === 'string' && v.trim() === trimmed)) {
          return { ns, key: k, value: v, source: 'dictionary' }
        }
      }
    }
  }

  // 3. Таблица китайских соответствий ZH_RU
  if (zhRu && typeof zhRu === 'object') {
    for (const [zh, ru] of Object.entries(zhRu)) {
      if (ru === text || (typeof ru === 'string' && ru.trim() === trimmed)) {
        return { zh, key: zh, value: ru, source: 'dom_zh' }
      }
    }
    if (zhRu[trimmed] !== undefined) {
      return { zh: trimmed, key: trimmed, value: zhRu[trimmed], source: 'dom_zh_original' }
    }
  }

  // 4. Таблица английских соответствий DOM_EN_TEXT
  if (domEn && typeof domEn === 'object') {
    for (const [en, ru] of Object.entries(domEn)) {
      if (ru === text || (typeof ru === 'string' && ru.trim() === trimmed)) {
        return { en, key: en, value: ru, source: 'dom_en' }
      }
    }
    if (domEn[trimmed] !== undefined) {
      return { en: trimmed, key: trimmed, value: domEn[trimmed], source: 'dom_en_original' }
    }
  }

  // 5. Детекция непереведённых фрагментов (при явном запросе)
  if (options && options.detectUntranslated) {
    const hasRu = /[а-яё]/i.test(trimmed)
    const hasZh = /[㐀-鿿豈-﫿]/.test(trimmed)
    const hasEn = /[a-z]/i.test(trimmed)
    if (!hasRu && hasZh) {
      return { key: trimmed, value: trimmed, source: 'untranslated_zh' }
    }
    if (!hasRu && hasEn) {
      return { key: trimmed, value: trimmed, source: 'untranslated_en' }
    }
  }

  return null
}

export const generateBugReportSnippet = (info = {}) => {
  const { key, ns, original, current, override, pkgVersion = '0.3.1' } = info
  const lines = [
    '### 🌐 Неточность перевода / Пользовательское предложение',
    '- **Пакет:** `@goodandready/dsh-russian-lang@v' + pkgVersion + '`',
    ns ? '- **Пространство имён:** `' + ns + '`' : null,
    key ? '- **Ключ:** `' + key + '`' : null,
    original ? '- **Оригинальный текст:** `' + original + '`' : null,
    current ? '- **Текущий перевод:** `' + current + '`' : null,
    override ? '- **Предлагаемый перевод:** `' + override + '`' : null,
  ].filter(Boolean)
  return lines.join('\n')
}

// ------------------------------------------ двуязычный поиск команд (#300)

export const bilingualCommandMatch = (query, command, options = {}) => {
  if (!query || !command) return { matched: false, score: 0 }
  const q = String(query).trim().toLowerCase()
  if (!q) return { matched: false, score: 0 }

  const cmdObj = typeof command === 'string' ? { title: command } : command
  const candidates = [
    cmdObj.title,
    cmdObj.label,
    cmdObj.name,
    cmdObj.originalTitle,
    cmdObj.enTitle,
    cmdObj.id,
    cmdObj.description,
    cmdObj.category,
    ...(Array.isArray(cmdObj.keywords) ? cmdObj.keywords : [])
  ].filter((c) => typeof c === 'string' && c.trim())

  if (!candidates.length) return { matched: false, score: 0 }

  const queryVariants = [{ text: q, kind: 'direct' }]

  const lat2cyr = translit(q, LAYOUT_LAT_TO_CYR)
  if (lat2cyr !== q) queryVariants.push({ text: lat2cyr, kind: 'layout' })

  const cyr2lat = translit(q, LAYOUT_CYR_TO_LAT)
  if (cyr2lat !== q) queryVariants.push({ text: cyr2lat, kind: 'layout' })

  const phonLat2Cyr = phoneticTranslit(q, 'lat2cyr')
  if (phonLat2Cyr && phonLat2Cyr !== q && phonLat2Cyr !== lat2cyr) {
    queryVariants.push({ text: phonLat2Cyr, kind: 'phonetic' })
  }

  const phonCyr2Lat = phoneticTranslit(q, 'cyr2lat')
  if (phonCyr2Lat && phonCyr2Lat !== q && phonCyr2Lat !== cyr2lat) {
    queryVariants.push({ text: phonCyr2Lat, kind: 'phonetic' })
  }

  let bestScore = 0
  let bestVariant = null
  let bestCandidate = null

  for (const variant of queryVariants) {
    for (const cand of candidates) {
      const score = fuzzyMatchRu(variant.text, cand)
      if (score > bestScore) {
        bestScore = score
        bestVariant = variant
        bestCandidate = cand
      }
    }
  }

  const threshold = options.threshold ?? 50
  return {
    matched: bestScore >= threshold,
    score: bestScore,
    matchedText: bestCandidate,
    variant: bestVariant ? bestVariant.text : q,
    kind: bestVariant ? bestVariant.kind : 'none'
  }
}

export const filterCommands = (query, commands = [], options = {}) => {
  if (!Array.isArray(commands)) return []
  if (!query || !String(query).trim()) return commands
  const results = []
  for (const cmd of commands) {
    const res = bilingualCommandMatch(query, cmd, options)
    if (res.matched) {
      results.push({ item: cmd, ...res })
    }
  }
  return results.sort((a, b) => b.score - a.score).map((r) => r.item)
}
