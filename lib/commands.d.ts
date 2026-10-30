export interface SlashAlias {
  name: string
  target: string
  desc: string
  hint?: string
}

export declare const SLASH_ALIASES: SlashAlias[]
export declare function registerSlashAliases(ctx: any, readSettings?: () => any): () => void
