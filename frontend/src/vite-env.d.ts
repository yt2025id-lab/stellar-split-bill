/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HORIZON_URL: string;
  readonly VITE_RPC_URL: string;
  readonly VITE_TOKEN_CONTRACT: string;
  readonly VITE_CORE_CONTRACT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  albedo?: {
    publicKey: () => Promise<{ pubkey: string }>;
  };
}
