/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  // Add other env variables as needed
  // readonly VITE_SOME_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}