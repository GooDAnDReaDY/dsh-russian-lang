/**
 * @fileoverview Единый батч-мультиплексор MutationObserver (#540)
 * Объединяет слушатели DOM-мутаций (spellcheck, zh-dom, typography, toasts)
 * в один корневой MutationObserver на document.body с защитой от перегрузки
 * главного потока при SSE-стриминге LLM.
 */

/**
 * Проверяет, находится ли узел внутри стримингового контейнера вывода LLM.
 * В таких контейнерах DOM непрерывно обновляется чанками, поэтому тяжелые
 * проверки и обходы DOM должны быть исключены.
 *
 * @param {Node|null|undefined} node
 * @returns {boolean}
 */
export function isStreamingNode(node) {
  if (!node) return false
  const el = node.nodeType === 1 ? node : node.parentElement
  if (!el || typeof el.closest !== 'function') return false
  return Boolean(el.closest('[data-stream], [data-streaming], pre, code, .chat-message, .markdown-body'))
}

/**
 * Класс единого мультиплексора MutationObserver с батчингом через requestAnimationFrame / setTimeout
 */
export class DomMutationMultiplexer {
  /**
   * @param {Element|Document|(() => Element|null)|null} [rootTarget=null]
   * @param {Object} [options={}]
   * @param {Function} [options.schedule]
   * @param {Function} [options.cancel]
   * @param {typeof MutationObserver} [options.MutationObserverClass]
   */
  constructor(rootTarget = null, options = {}) {
    this.rootTarget = rootTarget
    this.options = options
    this.subscribers = new Map()
    this.observer = null
    this.queuedRecords = []
    this.queuedNodes = []
    this.rafId = null

    this._schedule = options.schedule || (
      typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (cb) => setTimeout(cb, 16)
    )
    this._cancel = options.cancel || (
      typeof cancelAnimationFrame === 'function'
        ? cancelAnimationFrame
        : clearTimeout
    )
    this._MoClass = options.MutationObserverClass || (
      typeof MutationObserver !== 'undefined' ? MutationObserver : null
    )

    this._onMutation = this._onMutation.bind(this)
    this._flush = this._flush.bind(this)
  }

  /**
   * Регистрация слушателя мутаций
   * @param {string} id
   * @param {(nodes: Node[], records: MutationRecord[]) => void} callback
   * @param {Object} [opts={}]
   * @param {boolean} [opts.skipStreaming=false]
   * @returns {() => void} Функция отписки
   */
  subscribe(id, callback, opts = {}) {
    this.subscribers.set(id, { callback, options: opts })
    this._ensureObserver()
    return () => this.unsubscribe(id)
  }

  /**
   * Отписка слушателя
   * @param {string} id
   */
  unsubscribe(id) {
    this.subscribers.delete(id)
    if (this.subscribers.size === 0) {
      this.disconnect()
    }
  }

  /**
   * Число активных подписчиков
   * @returns {number}
   */
  get subscriberCount() {
    return this.subscribers.size
  }

  /**
   * Активен ли корневой MutationObserver
   * @returns {boolean}
   */
  get isObserving() {
    return this.observer !== null
  }

  _resolveTarget() {
    if (typeof this.rootTarget === 'function') {
      try { return this.rootTarget() } catch { return null }
    }
    if (this.rootTarget) return this.rootTarget
    if (typeof document !== 'undefined' && document.body) return document.body
    return null
  }

  _ensureObserver() {
    if (this.observer || this.subscribers.size === 0) return
    const target = this._resolveTarget()
    if (!target || !this._MoClass) return

    try {
      this.observer = new this._MoClass(this._onMutation)
      this.observer.observe(target, { childList: true, subtree: true })
    } catch {
      this.observer = null
    }
  }

  _onMutation(records) {
    if (this.subscribers.size === 0) return
    for (let i = 0; i < records.length; i++) {
      const rec = records[i]
      this.queuedRecords.push(rec)
      if (rec.addedNodes && rec.addedNodes.length > 0) {
        for (let j = 0; j < rec.addedNodes.length; j++) {
          this.queuedNodes.push(rec.addedNodes[j])
        }
      }
    }
    if (this.rafId === null) {
      this.rafId = this._schedule(this._flush)
    }
  }

  _flush() {
    this.rafId = null
    if (this.queuedRecords.length === 0 && this.queuedNodes.length === 0) return

    const records = this.queuedRecords
    const allNodes = this.queuedNodes
    this.queuedRecords = []
    this.queuedNodes = []

    let filteredNodes = null

    for (const [, sub] of this.subscribers) {
      try {
        if (sub.options.skipStreaming) {
          if (!filteredNodes) {
            filteredNodes = allNodes.filter((node) => !isStreamingNode(node))
          }
          if (filteredNodes.length > 0) {
            sub.callback(filteredNodes, records)
          }
        } else {
          sub.callback(allNodes, records)
        }
      } catch (err) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('dsh-russian-lang: DomMutationMultiplexer handler error:', err)
        }
      }
    }
  }

  /**
   * Принудительный сброс очереди мутаций без ожидания таймера (для тестов или синхронной зачистки)
   */
  flushSync() {
    if (this.rafId !== null) {
      this._cancel(this.rafId)
      this.rafId = null
    }
    this._flush()
  }

  /**
   * Отключение корневого слушателя и очистка очереди
   */
  disconnect() {
    if (this.observer) {
      try { this.observer.disconnect() } catch {}
      this.observer = null
    }
    if (this.rafId !== null) {
      this._cancel(this.rafId)
      this.rafId = null
    }
    this.queuedRecords = []
    this.queuedNodes = []
  }
}

/**
 * Фабричная функция для создания мультиплексора
 * @param {Element|Document|(() => Element|null)|null} [rootTarget=null]
 * @param {Object} [options={}]
 * @returns {DomMutationMultiplexer}
 */
export function createDomMutationMultiplexer(rootTarget = null, options = {}) {
  return new DomMutationMultiplexer(rootTarget, options)
}
