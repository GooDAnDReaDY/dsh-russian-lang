export declare function createSafeLocaleProxy<T extends object>(dict: T, fallback?: any): T
export declare function installSafeLocaleRegistration(localeService: any): any
export declare function safeRegisterLocale(localeService: any, ns: string, langOrLocales: any, dict?: any): () => void
