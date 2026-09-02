import { test } from 'node:test'
import assert from 'node:assert'

const ERROR_MAP = {
  ENOENT: { title: 'Файл не найден', message: 'Указанный файл или директория не существуют', hint: 'Проверьте правильность указанного пути к файлу.' },
  EACCES: { title: 'Отказано в доступе', message: 'Недостаточно прав для чтения или записи', hint: 'Проверьте права доступа к файлу или директории (chmod/chown).' },
  EPERM: { title: 'Операция запрещена', message: 'Недостаточно системных привилегий', hint: 'Запустите процесс с соответствующими правами.' },
  ECONNREFUSED: { title: 'Соединение отклонено', message: 'Целевой сервер или сервис не отвечает', hint: 'Убедитесь, что локальный или удаленный сервис запущен и слушает порт.' },
  ETIMEDOUT: { title: 'Таймаут соединения', message: 'Превышено время ожидания ответа', hint: 'Проверьте стабильность сети или увеличьте лимит ожидания.' },
  ENOTFOUND: { title: 'Хост не найден', message: 'Не удалось разрешить сетевой адрес', hint: 'Проверьте правильность URL или настройки DNS.' },
  EADDRINUSE: { title: 'Порт уже занят', message: 'Сетевой порт используется другим процессом', hint: 'Остановите конфликтующий процесс или выберите другой порт.' },
  401: { title: 'Требуется авторизация', message: 'API-ключ или токен отсутствуют или недействительны', hint: 'Проверьте настройки учетных данных и актуальность токена.' },
  403: { title: 'Доступ запрещен', message: 'Недостаточно прав для выполнения операции', hint: 'Проверьте область действия токена или права роли.' },
  404: { title: 'Ресурс не найден', message: 'Запрошенный адрес или объект не существует', hint: 'Проверьте правильность пути или идентификатора ресурса.' },
  429: { title: 'Превышен лимит запросов', message: 'Слишком много запросов (Rate Limit)', hint: 'Подождите несколько минут перед повторным запросом.' },
  500: { title: 'Внутренняя ошибка сервера', message: 'На стороне сервера произошел сбой', hint: 'Попробуйте повторить запрос позже или проверьте серверные логи.' },
  502: { title: 'Ошибочный шлюз (Bad Gateway)', message: 'Промежуточный прокси не получил корректный ответ', hint: 'Проверьте работу нижележащей службы или upstream-сервера.' },
  503: { title: 'Служба временно недоступна', message: 'Сервер перегружен или находится на обслуживании', hint: 'Попробуйте повторить операцию через некоторое время.' }
}

const humanizeError = (err) => {
  if (!err) return null
  const rawMsg = typeof err === 'string' ? err : (err.message || String(err))
  const code = err.code || (rawMsg.match(/\b(E[A-Z]{2,20})\b/) || [])[1]
  const status = err.status || err.statusCode || (rawMsg.match(/\b([45]\d{2})\b/) || [])[1]

  const lookupKey = code || status
  if (lookupKey && ERROR_MAP[lookupKey]) {
    const info = ERROR_MAP[lookupKey]
    return {
      code: String(lookupKey),
      title: info.title,
      message: info.message,
      hint: info.hint,
      raw: rawMsg
    }
  }

  // Common substring matches
  if (/rate limit|too many requests/i.test(rawMsg)) {
    return { code: '429', title: ERROR_MAP[429].title, message: ERROR_MAP[429].message, hint: ERROR_MAP[429].hint, raw: rawMsg }
  }
  if (/unauthorized|invalid token|invalid api key/i.test(rawMsg)) {
    return { code: '401', title: ERROR_MAP[401].title, message: ERROR_MAP[401].message, hint: ERROR_MAP[401].hint, raw: rawMsg }
  }

  return {
    code: 'UNKNOWN',
    title: 'Ошибка операции',
    message: rawMsg,
    hint: 'Проверьте параметры операции и логи.',
    raw: rawMsg
  }
}

test('humanizeError translates Node.js POSIX errors', () => {
  const e1 = humanizeError({ code: 'ENOENT', message: 'ENOENT: no such file or directory, open /app/config.json' })
  assert.equal(e1.code, 'ENOENT')
  assert.equal(e1.title, 'Файл не найден')
  assert.ok(e1.hint.includes('пути к файлу'))

  const e2 = humanizeError('Error: connect ECONNREFUSED 127.0.0.1:8080')
  assert.equal(e2.code, 'ECONNREFUSED')
  assert.equal(e2.title, 'Соединение отклонено')
})

test('humanizeError translates HTTP and API errors', () => {
  const e1 = humanizeError({ status: 429, message: 'Request rate limit exceeded' })
  assert.equal(e1.code, '429')
  assert.equal(e1.title, 'Превышен лимит запросов')

  const e2 = humanizeError('401 Unauthorized: Invalid API key')
  assert.equal(e2.code, '401')
  assert.equal(e2.title, 'Требуется авторизация')
})

test('humanizeError provides graceful fallback for unknown errors', () => {
  const e = humanizeError('Something unusual happened')
  assert.equal(e.code, 'UNKNOWN')
  assert.equal(e.title, 'Ошибка операции')
  assert.equal(e.raw, 'Something unusual happened')
})
