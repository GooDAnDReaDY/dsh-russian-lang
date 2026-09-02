import { test } from 'node:test'
import assert from 'node:assert'

// Smart Inflection Engine implementation for test verification
const INFLECT_RULES = {
  // Исключения и особые слова
  custom: {
    'пользователь': { gen: 'пользователя', dat: 'пользователю', acc: 'пользователя', ins: 'пользователем', pre: 'пользователе' },
    'агент': { gen: 'агента', dat: 'агенту', acc: 'агента', ins: 'агентом', pre: 'агенте' },
    'субагент': { gen: 'субагента', dat: 'субагенту', acc: 'субагента', ins: 'субагентом', pre: 'субагенте' },
    'модель': { gen: 'модели', dat: 'модели', acc: 'модель', ins: 'моделью', pre: 'модели' },
    'промпт': { gen: 'промпта', dat: 'промпту', acc: 'промпт', ins: 'промптом', pre: 'промпте' },
    'инструмент': { gen: 'инструмента', dat: 'инструменту', acc: 'инструмент', ins: 'инструментом', pre: 'инструменте' },
    'сессия': { gen: 'сессии', dat: 'сессии', acc: 'сессию', ins: 'сессией', pre: 'сессии' },
    'ветка': { gen: 'ветки', dat: 'ветке', acc: 'ветку', ins: 'веткой', pre: 'ветке' },
    'файл': { gen: 'файла', dat: 'файлу', acc: 'файл', ins: 'файлом', pre: 'файле' },
    'папка': { gen: 'папки', dat: 'папке', acc: 'папку', ins: 'папкой', pre: 'папке' },
  }
}

const inflectWord = (word, cName) => {
  if (!word || typeof word !== 'string') return word
  const lower = word.toLowerCase()
  // 1. Исключения / точный словарь
  if (INFLECT_RULES.custom[lower] && INFLECT_RULES.custom[lower][cName]) {
    const res = INFLECT_RULES.custom[lower][cName]
    return word[0] === word[0].toUpperCase() ? res[0].toUpperCase() + res.slice(1) : res
  }
  // 2. Несклоняемые слова: латиница, цифры, аббревиатуры из заглавных, оканчивающиеся на о/е/и/у/ю
  if (/[a-zA-Z0-9_-]/.test(word)) return word
  if (/^[А-ЯЁ]{2,}$/.test(word)) return word
  if (/[оеиую]$/i.test(word) && !/(ко|ло|но|то|во|ро|до|по|со|мо|го)$/i.test(word)) return word

  const isCap = word[0] === word[0].toUpperCase()
  const w = lower

  // -ия (сессия, категория)
  if (w.endsWith('ия')) {
    const stem = w.slice(0, -2)
    const map = { gen: stem + 'ии', dat: stem + 'ии', acc: stem + 'ию', ins: stem + 'ией', pre: stem + 'ии' }
    const out = map[cName] || w
    return isCap ? out[0].toUpperCase() + out.slice(1) : out
  }
  // -а (кнопка, Анна)
  if (w.endsWith('а')) {
    const stem = w.slice(0, -1)
    const lastCons = stem.slice(-1)
    const genEnd = /[гкхжшчщ]/.test(lastCons) ? 'и' : 'ы'
    const map = { gen: stem + genEnd, dat: stem + 'е', acc: stem + 'у', ins: stem + 'ой', pre: stem + 'е' }
    const out = map[cName] || w
    return isCap ? out[0].toUpperCase() + out.slice(1) : out
  }
  // -я (Ольга, Мария)
  if (w.endsWith('я')) {
    const stem = w.slice(0, -1)
    const map = { gen: stem + 'и', dat: stem + 'е', acc: stem + 'ю', ins: stem + 'ей', pre: stem + 'е' }
    const out = map[cName] || w
    return isCap ? out[0].toUpperCase() + out.slice(1) : out
  }
  // -ь (роль, запись - ж.р.)
  if (w.endsWith('ь')) {
    const stem = w.slice(0, -1)
    const map = { gen: stem + 'и', dat: stem + 'и', acc: stem + 'ь', ins: stem + 'ью', pre: stem + 'и' }
    const out = map[cName] || w
    return isCap ? out[0].toUpperCase() + out.slice(1) : out
  }
  // -й (Андрей, сценарий)
  if (w.endsWith('й')) {
    const stem = w.slice(0, -1)
    const map = { gen: stem + 'я', dat: stem + 'ю', acc: stem + 'я', ins: stem + 'ем', pre: stem + 'е' }
    const out = map[cName] || w
    return isCap ? out[0].toUpperCase() + out.slice(1) : out
  }
  // Мужской род на согласный (Иван, сервер, токен, документ)
  if (/[бвгджзклмнпрстфхцчшщ]$/.test(w)) {
    const map = { gen: w + 'а', dat: w + 'у', acc: w, ins: w + 'ом', pre: w + 'е' }
    const out = map[cName] || w
    return isCap ? out[0].toUpperCase() + out.slice(1) : out
  }
  return word
}

const inflect = (phrase, cName) => {
  if (!phrase || typeof phrase !== 'string') return phrase
  const validCases = new Set(['gen', 'dat', 'acc', 'ins', 'pre'])
  if (!validCases.has(cName)) return phrase
  const words = phrase.split(' ')
  return words.map((w) => inflectWord(w, cName)).join(' ')
}

test('inflect handles Russian masculine nouns and names', () => {
  assert.equal(inflect('Иван', 'gen'), 'Ивана')
  assert.equal(inflect('Иван', 'dat'), 'Ивану')
  assert.equal(inflect('Иван', 'ins'), 'Иваном')
  assert.equal(inflect('Иван', 'pre'), 'Иване')

  assert.equal(inflect('сервер', 'gen'), 'сервера')
  assert.equal(inflect('пользователь', 'gen'), 'пользователя')
  assert.equal(inflect('пользователь', 'ins'), 'пользователем')
  assert.equal(inflect('агент', 'dat'), 'агенту')
})

test('inflect handles Russian feminine and neuter nouns', () => {
  assert.equal(inflect('модель', 'gen'), 'модели')
  assert.equal(inflect('модель', 'ins'), 'моделью')
  assert.equal(inflect('сессия', 'gen'), 'сессии')
  assert.equal(inflect('сессия', 'acc'), 'сессию')
  assert.equal(inflect('ветка', 'dat'), 'ветке')
  assert.equal(inflect('папка', 'gen'), 'папки')
})

test('inflect safely preserves Latin, acronyms, and numbers', () => {
  assert.equal(inflect('DeepSeek-V3', 'gen'), 'DeepSeek-V3')
  assert.equal(inflect('GPT-4', 'dat'), 'GPT-4')
  assert.equal(inflect('API', 'gen'), 'API')
  assert.equal(inflect('123', 'gen'), '123')
})
