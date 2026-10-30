// ---------------------------------------------------------- типографика

export const typoQuotes = (text) => text
  .replace(/"([^"\n]{1,200})"/g, '«$1»')
  .replace(/[“„]([^“”\n]{1,200})[”"]/g, '«$1»')
  .replace(/[『「]([^』」\n]{1,200})[』」]/g, '«$1»')

export const typoDash = (text) => text
  .replace(/(^|[\s(\[«])--(?=\s|$)/g, '$1—')
  .replace(/(?<=[\p{L}\p{N}»\)]) - (?=[\p{L}\p{N}«\(])/gu, ' — ')

export const typoPunct = (text) => text.replace(/\s+([,.:;!?])(?=\s|$)/g, '$1')

export const TYPO_SHORT = new Set(['в', 'с', 'к', 'о', 'у', 'а', 'и', 'но', 'не', 'ни', 'на', 'по', 'до', 'из', 'за', 'от', 'об'])

export const typoNbsp = (text) => text
  .replace(/(^|[\s(\[«])([а-яё]{1,2})(\s+)/g, (match, lead, word) => (
    TYPO_SHORT.has(word) ? lead + word + ' ' : match
  ))
  .replace(/(\d) ([а-яё]{1,24})(?![а-яё])/giu, '$1 $2')
  .replace(/(\d) ([%°₽$€£]|кб|КБ|МБ|ГБ)(?=\s|$)/giu, '$1 $2')

// \b здесь не годится: он определён через \w = [A-Za-z0-9_], кириллица в \w не
// входит, поэтому границы слова перед «в» в «все» просто нет и ни одна якорная
// пара не срабатывала — вся ё-замена была мёртвым кодом (#132). Границу задаём
// явным lookaround по кириллице.
export const YO_EDGE_L = '(?<![а-яёА-ЯЁ])'
export const YO_EDGE_R = '(?![а-яёА-ЯЁ])'

/** Восстанавливает регистр совпадения: «ЕЩЕ» -> «ЕЩЁ», «Еще» -> «Ещё». */
export const yoCase = (src, repl) => {
  if (src === src.toUpperCase() && src !== src.toLowerCase()) return repl.toUpperCase()
  if (src[0] === src[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1)
  return repl
}

/** pairs — [[«еще», «ещё»], ...] из build.py (ручные + корпусные, за вычетом
 *  омографов). Регистр разбирает yoCase, поэтому пара нужна одна на слово. */
export const makeTypoYo = (pairs) => {
  const list = typeof pairs === 'string'
    ? pairs.split('|').filter(Boolean).map((s) => s.split(':'))
    : (pairs || [])
  const compiled = list.map((p) => [new RegExp(YO_EDGE_L + p[0] + YO_EDGE_R, 'gi'), p[1]])
  return (text) => {
    for (const [re, repl] of compiled) text = text.replace(re, (match) => yoCase(match, repl))
    return text
  }
}

