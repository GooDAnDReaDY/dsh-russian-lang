// ------------------------------------------------------------- ошибки

export const ERROR_MAP = {
  ENOENT: { title: 'Файл не найден', message: 'Указанный файл или директория не существуют', hint: 'Проверьте правильность указанного пути к файлу.' },
  EACCES: { title: 'Отказано в доступе', message: 'Недостаточно прав для чтения или записи', hint: 'Проверьте права доступа к файлу или директории (chmod/chown).' },
  EPERM: { title: 'Операция запрещена', message: 'Недостаточно системных привилегий', hint: 'Запустите процесс с соответствующими правами.' },
  ECONNREFUSED: { title: 'Соединение отклонено', message: 'Целевой сервер или сервис не отвечает', hint: 'Убедитесь, что локальный или удаленный сервис запущен и слушает порт.' },
  ECONNRESET: { title: 'Сброс соединения', message: 'Соединение было принудительно разорвано удаленной стороной', hint: 'Проверьте стабильность сети и работу целевого сервера.' },
  ETIMEDOUT: { title: 'Таймаут соединения', message: 'Превышено время ожидания ответа', hint: 'Проверьте стабильность сети или увеличьте лимит ожидания.' },
  ENOTFOUND: { title: 'Хост не найден', message: 'Не удалось разрешить сетевой адрес', hint: 'Проверьте правильность URL или настройки DNS.' },
  EADDRINUSE: { title: 'Порт уже занят', message: 'Сетевой порт используется другим процессом', hint: 'Остановите конфликтующий процесс или выберите другой порт.' },
  ENOSPC: { title: 'Недостаточно места на диске', message: 'На устройстве закончилось свободное пространство', hint: 'Освободите место на диске и повторите операцию.' },
  400: { title: 'Некорректный запрос (Bad Request)', message: 'Параметры запроса не соответствуют ожидаемому формату', hint: 'Проверьте синтаксис команды или переданные аргументы.' },
  401: { title: 'Требуется авторизация', message: 'API-ключ или токен отсутствуют или недействительны', hint: 'Проверьте настройки учетных данных и актуальность токена.' },
  403: { title: 'Доступ запрещен', message: 'Недостаточно прав для выполнения операции', hint: 'Проверьте область действия токена или права роли.' },
  404: { title: 'Ресурс не найден', message: 'Запрошенный адрес или объект не существует', hint: 'Проверьте правильность пути или идентификатора ресурса.' },
  429: { title: 'Превышен лимит запросов', message: 'Слишком много запросов (Rate Limit)', hint: 'Подождите несколько минут перед повторным запросом.' },
  500: { title: 'Внутренняя ошибка сервера', message: 'На стороне сервера произошел сбой', hint: 'Попробуйте повторить запрос позже или проверьте серверные логи.' },
  502: { title: 'Ошибочный шлюз (Bad Gateway)', message: 'Промежуточный прокси не получил корректный ответ', hint: 'Проверьте работу нижележащей службы или upstream-сервера.' },
  503: { title: 'Служба временно недоступна', message: 'Сервер перегружен или находится на обслуживании', hint: 'Попробуйте повторить операцию через некоторое время.' },
  504: { title: 'Шлюз не отвечает (Gateway Timeout)', message: 'Превышено время ожидания ответа от upstream-сервера', hint: 'Попробуйте повторить запрос позже.' },
  FETCH_FAILED: { title: 'Сетевой запрос не удался', message: 'Не удалось связаться с сервером (Failed to fetch)', hint: 'Проверьте сетевое подключение и доступность адреса.' },
  CORS_ERROR: { title: 'Ошибка CORS', message: 'Запрос заблокирован политикой безопасности браузера', hint: 'Проверьте заголовки разрешённых источников на сервере.' },
  WS_CLOSED: { title: 'Разрыв WebSocket', message: 'Связь с сервером по WebSocket прервана', hint: 'Проверьте работу сервера и сетевой статус.' },
  QUOTA_EXCEEDED: { title: 'Исчерпана квота API', message: 'Превышен лимит запросов или баланс провайдера', hint: 'Проверьте баланс API-ключа в кабинете провайдера.' },
  CONTEXT_OVERFLOW: { title: 'Превышен контекст', message: 'Объём диалога превышает размер контекстного окна', hint: 'Очистите или сожмите историю сообщений сессии.' },
  MODEL_NOT_FOUND: { title: 'Модель не найдена', message: 'Указанная модель отсутствует или недоступна', hint: 'Проверьте идентификатор модели в настройках.' }
}

const fromMap = (key, rawMsg) => ({
  code: String(key), title: ERROR_MAP[key].title, message: ERROR_MAP[key].message, hint: ERROR_MAP[key].hint, raw: rawMsg
})

export const humanizeError = (err) => {
  if (!err) return null
  const rawMsg = typeof err === 'string' ? err : (err.message || String(err))
  const code = err.code || (rawMsg.match(/\b(E[A-Z]{2,20})\b/) || [])[1]
  const status = err.status || err.statusCode || (err.response && err.response.status) || (rawMsg.match(/\b([45]\d{2})\b/) || [])[1]
  const lookupKey = code || status
  if (lookupKey && ERROR_MAP[lookupKey]) return fromMap(lookupKey, rawMsg)
  if (/rate limit|too many requests/i.test(rawMsg)) return fromMap(429, rawMsg)
  if (/unauthorized|invalid token|invalid api key/i.test(rawMsg)) return fromMap(401, rawMsg)
  if (/failed to fetch|network\s*error|load\s*failed|net::err_/i.test(rawMsg)) return fromMap('FETCH_FAILED', rawMsg)
  if (/cors|cross-origin/i.test(rawMsg)) return fromMap('CORS_ERROR', rawMsg)
  if (/websocket.*(?:closed|failed)/i.test(rawMsg)) return fromMap('WS_CLOSED', rawMsg)
  if (/insufficient_quota|quota\s*exceeded/i.test(rawMsg)) return fromMap('QUOTA_EXCEEDED', rawMsg)
  if (/context.*(?:exceeded|overflow|length)/i.test(rawMsg)) return fromMap('CONTEXT_OVERFLOW', rawMsg)
  if (/model.*not.*found|model.*does not exist/i.test(rawMsg)) return fromMap('MODEL_NOT_FOUND', rawMsg)
  return { code: 'UNKNOWN', title: 'Ошибка операции', message: rawMsg, hint: 'Проверьте параметры операции и логи.', raw: rawMsg }
}

export const formatErrorToast = (err) => {
  const h = humanizeError(err)
  if (!h) return null
  return {
    type: 'error',
    title: h.title,
    description: h.message + (h.hint ? ' ' + h.hint : '')
  }
}

// -------------------------------------------------------- отчёт об ошибке

/** Версию передаёт вызывающий: в бандл её подставляет build.py из package.json,
 *  чтобы строка не устаревала руками (в 0.1.31 здесь стояло «0.1.29»). */
export const extractPlaceholders = (text) => {
  if (!text || typeof text !== 'string') return []
  const found = []
  const braceMatches = text.match(/\{[a-zA-Z0-9_.-]+\}/g)
  if (braceMatches) found.push(...braceMatches)
  const printfMatches = text.match(/%(?:\d+\$)?[sdif]/g)
  if (printfMatches) found.push(...printfMatches)
  return [...new Set(found)]
}

export const validatePlaceholders = (orig, trans) => {
  const origPlaceholders = extractPlaceholders(orig)
  if (!origPlaceholders.length) {
    return { valid: true, missing: [], extra: [], error: null }
  }
  const transPlaceholders = new Set(extractPlaceholders(trans))
  const missing = origPlaceholders.filter((ph) => !transPlaceholders.has(ph))
  const origSet = new Set(origPlaceholders)
  const extra = [...transPlaceholders].filter((ph) => !origSet.has(ph))
  return {
    valid: missing.length === 0,
    missing,
    extra,
    error: missing.length > 0 ? `Отсутствуют обязательные плейсхолдеры: ${missing.join(', ')}` : null
  }
}

