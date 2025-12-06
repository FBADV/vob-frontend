/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_JUSBR_CLIENT_ID: string
    readonly VITE_JUSBR_REDIRECT_URI: string
    readonly VITE_JUSBR_SSO_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
