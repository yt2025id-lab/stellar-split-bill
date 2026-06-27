# 🎬 Demo Video Script — Split Bill (Orange Belt)
## Durasi: 1 menit 45 detik | Narator: Ozan_OnChain

---

### SCENE 1 — HOOK (0:00 - 0:12)
**[Screen: Split Bill dApp hero — 3D sphere + orange gradient]**

> "Berapa kali kamu dengar 'Bro, nanti gue transfer ya' — lalu 2 hari kemudian masih belum?
> Split Bill is a decentralized bill-splitting protocol on Stellar Soroban.
> No awkward math. No chasing friends. Just smart contracts that settle everything."

**[Transisi: fade ke arsitektur diagram]**

---

### SCENE 2 — ARCHITECTURE (0:12 - 0:30)
**[Screen: README architecture section — dua kontrak + panah inter-contract]**

> "Two smart contracts power this. Split Token mints obligation tokens for every payer.
> Split Core manages bills — and when you mark yourself as paid,
> it calls Split Token to burn your obligation tokens. Automatically. On-chain.
> This is true inter-contract communication — not just two deployed contracts, but one calling the other atomically."

**[Highlight: kode `env.invoke_contract(&token_addr, &symbol_short!("burn")...)`]**

> "Here in Rust — split-core calls split-token's burn function.
> Both contracts emit events in a single transaction. Verified. Composable."

---

### SCENE 3 — LIVE DEMO (0:30 - 0:55)
**[Screen: Live demo di frontend-ivory-nine-47.vercel.app]**

> "Let me show you the live dApp."

**[Klik "Connect Freighter"]**

> "Connecting with Freighter wallet. The dApp generates a persistent keypair stored in localStorage —
> no seed phrase exposure. Funded automatically via Friendbot."

**[Isi form: Description "Pizza Party", Amount "200", Payers "2", masukkan 2 alamat Stellar]**

> "Creating a bill for 200 stroops split between 2 friends.
> Notice the client-side validation — amount must be evenly divisible, addresses must be valid 56-char Stellar format.
> The contract enforces the same rules on-chain."

**[Klik "Create Bill" → muncul status bar hijau dengan TX hash + link explorer]**

> "Bill created. Here's the transaction hash — one click to verify on Stellar Expert."

---

### SCENE 4 — INTER-CONTRACT MAGIC (0:55 - 1:15)
**[Screen: Buka Stellar Expert — tunjukkan TX `746eb4f7...`]**

> "Now the magic. When I mark myself as paid..."

**[Klik "Mark Paid" pada bill #1]**

> "The transaction emits events from BOTH contracts. Look — split-token fires a 'burn' event, and split-core fires 'bill.paid'.
> This is inter-contract communication, verified on the Stellar ledger.
> 50 stroops burned from my obligation tokens. No one can fake a payment. No one can pay twice."

---

### SCENE 5 — CI/CD + TESTS (1:15 - 1:30)
**[Screen: GitHub Actions — workflow hijau: Smart Contract Tests ✓ + Frontend Build ✓]**

> "Every push triggers CI/CD on GitHub Actions. 12 smart contract tests run automatically —
> covering create, mark_paid, inter-contract burn, double payment rejection, unauthorized access.
> All green. Plus 14 frontend tests for the storytelling landing page. 26 tests total."

---

### SCENE 6 — MOBILE + ERROR HANDLING (1:30 - 1:40)
**[Screen: Chrome DevTools iPhone 14 Pro — dApp dalam mode mobile]**

> "Fully mobile responsive with a 480px breakpoint. Professional Web3 dark theme.
> Loading states: honeycomb loader while fetching, spinner during transactions.
> Error handling: every action wrapped in try/catch with clear user feedback."

---

### SCENE 7 — CLOSING (1:40 - 1:45)
**[Screen: README — badge tests 12 passed, GitHub stars]**

> "Split Bill. Decentralized bill splitting on Stellar Soroban.
> 30 commits. Inter-contract communication. 26 tests. CI/CD green. Ready for mainnet.
> Thank you."

---

## 📋 Shot List (untuk referensi perekaman)

| # | Scene | Duration | Screen |
|---|-------|----------|--------|
| 1 | Hook + value proposition | 12s | Hero section dApp |
| 2 | Architecture + inter-contract code | 18s | README architecture section |
| 3 | Live demo: connect + create bill | 25s | Live dApp |
| 4 | Inter-contract burn + Stellar Expert | 20s | Stellar Expert explorer |
| 5 | CI/CD + tests passing | 15s | GitHub Actions |
| 6 | Mobile responsive + error handling | 10s | Chrome DevTools mobile view |
| 7 | Closing statement | 5s | README |
| **Total** | | **1m45s** | |

---

## 🎯 Tips Perekaman

1. **Rekam di 1080p** — gunakan OBS atau QuickTime Screen Recording
2. **Zoom in** pada kode inter-contract (`env.invoke_contract`) — ini pembeda utama
3. **Pause sejenak** di Stellar Expert saat tunjukkan 2 event dalam 1 TX — beri waktu juri mencerna
4. **Highlight cursor** (OBS plugin atau Mouseposé) — supaya juri bisa ikuti klik-mu
5. **Audio clear** — gunakan mic eksternal, bukan laptop mic
6. **Upload ke YouTube unlisted atau Google Drive** — cantumkan link di submission
