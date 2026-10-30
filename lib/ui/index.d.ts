export declare const INSPECTOR_STYLES: string
export declare const QUICK_SWITCH_STYLES: string
export declare const STATUS_TABLE_STYLES: string

export declare function getOrCreateInspectorHost(doc?: any): any

export interface QuickSwitchOptions {
  currentLang?: string
  onToggle?: (lang: string) => void
  doc?: any
}
export declare function createQuickSwitchElement(opts?: QuickSwitchOptions): any
export declare function updateQuickSwitchElement(el: any, lang: string): void

export interface PluginSummary {
  packageName?: string
  namespace?: string
  status?: string
  count?: number
  total?: number
  percent?: number
  label?: string
  missingKeys?: any[]
}
export declare function filterPlugins(plugins: PluginSummary[], query?: string, statusFilter?: string): PluginSummary[]
export declare function getPluginStatusBadge(status: string): { label: string; bg: string; color: string; text: string }

export interface DiagnosticsBadge {
  label: string
  value: string
  type: string
}
export declare function getDiagnosticsBadges(data?: any): DiagnosticsBadge[]

export interface EngineOption {
  id: string
  name: string
  desc: string
  disabled?: boolean
}
export declare function getSupportedEngines(opts?: any): EngineOption[]

export declare function buildProposalPayload(meta?: any, originalText?: string, proposedText?: string, comment?: string, version?: string): any
export declare function createInspectorPillElement(opts?: any): any
