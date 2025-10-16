/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ENDPOINT: string
  readonly VITE_TARGET_FPS: string
  readonly VITE_SMOOTHING_WINDOW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

