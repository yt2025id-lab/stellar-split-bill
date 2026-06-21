/// <reference types="vite/client" />

interface Window {
  albedo?: {
    publicKey: () => Promise<{ pubkey: string }>;
  };
}
