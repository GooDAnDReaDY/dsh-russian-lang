export declare const PACKAGE_ALIASES: Record<string, string>
export declare const HEADLESS_PLUGINS: Set<string>
export declare function resolvePluginNamespace(pkgName: string, dicts?: any): string | null
export declare function makeIssueUrl(opts?: any, version?: string): string
export declare function makePluginLocalizationStatus(dicts: any, enCatalog: any, inventory?: any): (ns: string, pkgName: string, installedVersion?: string) => any
export declare function formatDate(val: any, style?: string): string
export declare function formatCompactNumber(val: number): string
export declare function formatTokens(count: number, compact?: boolean): string
export declare function formatNumber(val: number): string
export declare function formatCurrency(val: number, cur?: string): string
export declare function formatRelativeTime(val: number, unit?: string): string
export declare function inflectWord(word: string, cName: string): string
export declare function inflect(phrase: string, cName: string): string
export declare function pluralForm(n: number): string
export declare function plural(count: number, forms: any, withCount?: boolean): string
export declare function fill(template: string, params: any): string
export declare function stemRussian(word: string): string
export declare function typoQuotes(text: string): string
export declare function typoDash(text: string): string
export declare function typoPunct(text: string): string
export declare function typoNbsp(text: string): string
export declare function makeTypoYo(pairs: any): (text: string) => string
export declare function translit(word: string, map: Record<string, string>): string
export declare function makeLayout(freq?: any, localDict?: Set<string>): (input: string) => string
export declare function formatInputLive(text: string): string
export declare function expandSlashAlias(input: string): string
export declare function phoneticTranslit(text: string, direction?: string): string
export declare function detectInputLayout(text: string): 'ru' | 'en' | 'neutral'
export declare const ERROR_MAP: Record<string, string>
export declare function humanizeError(err: any): string
export declare function formatErrorToast(err: any): string
export declare function extractPlaceholders(text: string): string[]
export declare function validatePlaceholders(orig: string, trans: string): { valid: boolean; missing: string[]; extra: string[] }
export declare const SYSTEM_PROMPT_PRESETS: Record<string, { title: string; desc: string }>
export declare function exportSessionToMarkdown(session: any, options?: any): string
export declare function findTranslationKey(text: string, dicts?: any, overrides?: any, zhRu?: any, domEn?: any, options?: any): any
export declare function generateBugReportSnippet(info?: any): string
export declare function bilingualCommandMatch(query: string, command: any, options?: any): boolean
export declare function filterCommands(query: string, commands?: any[], options?: any): any[]

export declare function isStreamingNode(node?: any): boolean
export declare class DomMutationMultiplexer {
  constructor(rootTarget?: any, options?: any)
  subscribe(id: string, callback: (nodes: any[], records: any[]) => void, opts?: { skipStreaming?: boolean }): () => void
  unsubscribe(id: string): void
  readonly subscriberCount: number
  readonly isObserving: boolean
  flushSync(): void
  disconnect(): void
}
export declare function createDomMutationMultiplexer(rootTarget?: any, options?: any): DomMutationMultiplexer
