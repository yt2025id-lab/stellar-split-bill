# 💸 Stellar Split Bill

<div align="center">

**Decentralized Bill Splitting Protocol on Soroban**

*Split any expense. Share the burden. Settle on-chain.*

[![Tests](https://img.shields.io/badge/tests-12%20passed-brightgreen)](https://github.com/yt2025id-lab/stellar-split-bill/actions)
[![Soroban](https://img.shields.io/badge/soroban-sdk%20v26-blue)](https://soroban.stellar.org)
[![React](https://img.shields.io/badge/react-19-61DAFB)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)

</div>

---

## 🎯 What is Split Bill?

Split Bill is a **decentralized expense-sharing protocol** built on Stellar Soroban. Create a bill, invite friends, and track payments — all settled via smart contracts with **inter-contract communication**.

> *"Pizza for 4? Everyone pays exactly their share. No awkward math. No chasing people."*

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│         Neo-Brutalist • Mobile-First • Vite          │
└──────────────┬────────────────────┬──────────────────┘
               │                    │
          Freighter              Raw RPC
          Wallet                 (fetch)
               │                    │
┌──────────────▼────────────────────▼──────────────────┐
│                  Stellar Soroban Testnet               │
│                                                        │
│  ┌──────────────────┐    INTER-CONTRACT    ┌─────────┐│
│  │   split-core     │ ◄──────────────────► │  split- ││
│  │                  │    burn()             │  token  ││
│  │  • create_bill   │                      │         ││
│  │  • mark_paid     │                      │ • mint  ││
│  │  • get_all_bills │                      │ • burn  ││
│  └──────────────────┘                      │ • xfer  ││
│                                             └─────────┘│
└─────────────────────────────────────────────────────────┘
```

### Inter-Contract Communication

```rust
// split-core calls split-token to burn obligation tokens
env.invoke_contract::<()>(
    &token_addr,
    &symbol_short!("burn"),
    vec![&env, payer.to_val(), amount.into_val(&env)],
);
```

---

## 🔒 Security Audit

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | Integer overflow in `initialize` | 🔴 CRITICAL | ✅ Fixed — `checked_mul` |
| 2 | Integer division truncation | 🔴 CRITICAL | ✅ Fixed — exact division enforced |
| 3 | No payer authorization | 🔴 CRITICAL | ✅ Fixed — whitelist per bill |
| 4 | Duplicate payment possible | 🔴 CRITICAL | ✅ Fixed — `Vec<bool>` tracker |
| 5 | Amount = 0 accepted | 🟡 MEDIUM | ✅ Fixed — `amount > 0` required |
| 6 | Missing contract events | 🟡 MEDIUM | ✅ Fixed — all state changes emit events |
| 7 | Unbounded bill storage | 🟡 MEDIUM | ✅ Fixed — `MAX_BILLS = 100` |

---

## 🧪 Test Coverage

```
split-token (5 tests)          split-core (7 tests)
├── test_initialize    ✅       ├── test_initialize                 ✅
├── test_transfer      ✅       ├── test_create_bill                ✅
├── test_mint          ✅       ├── test_uneven_split_rejected      ✅
├── test_burn          ✅       ├── test_mark_paid_and_complete     ✅
├── test_zero_rejected ✅       ├── test_inter_contract_burn        ✅
                                ├── test_unauthorized_rejected      ✅
                                └── test_double_payment_rejected    ✅
```

---

## 🚀 Deployed Contracts

| Contract | Address | Network |
|----------|---------|---------|
| `split-token` | [`CCJ5ME…53X5`](https://stellar.expert/explorer/testnet/contract/CCJ5MEBLFYVFOPN4EDO53IFQOCBWHO7SGIFEWXSKCTNHGTBZ6TTY53X5) | Testnet |
| `split-core` | [`CCRVT…OGJ3`](https://stellar.expert/explorer/testnet/contract/CCRVTPOVHJZ7KLANM2AEPIQPLSDWIDK2M66GJQHFEHJVJPHGDCKQOGJ3) | Testnet |

---

## 🎨 Neo-Brutalist Design

```
Bold borders  •  Hard shadows  •  Raw typography
Space Grotesk  •  JetBrains Mono  •  Inter
#FFD700 Yellow  •  #39FF14 Lime  •  #FF6B9D Pink
```

Fully mobile-responsive with `viewport-fit=cover` for iOS safe areas.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Rust • Soroban SDK v26 |
| Frontend | React 19 • TypeScript • Vite 8 |
| Wallet | Freighter Browser Extension |
| RPC | Raw `fetch` JSON-RPC (no SDK bloat) |
| CI/CD | GitHub Actions |
| Hosting | Vercel |
| Styling | Neo-Brutalism CSS |

---

## ⚡ Quick Start

```bash
# Contracts
cargo build --release --target wasm32v1-none
cargo test

# Frontend
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

### Environment Variables

```bash
# .env
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_TOKEN_CONTRACT=CC...
VITE_CORE_CONTRACT=CC...
```

---

## 📂 Project Structure

```
stellar-split-bill/
├── contracts/
│   ├── split-token/src/     # Token contract
│   │   ├── lib.rs           # Contract logic
│   │   └── test.rs          # 5 tests
│   └── split-core/src/      # Core contract (inter-contract)
│       ├── lib.rs           # Bill logic + burn() call
│       └── test.rs          # 7 tests
├── frontend/
│   └── src/
│       ├── App.tsx          # Main dApp
│       ├── index.css        # Neo-brutalist styles
│       └── main.tsx         # Entry point
├── .github/workflows/
│   └── ci.yml               # CI/CD pipeline
└── README.md
```

---

## 🔄 CI/CD Pipeline

```
Push → [Contract Tests] → [Frontend Build]
                           ↓
                    [Deploy Contracts] → [Deploy Frontend]
```

---

## 📜 License

MIT © 2026 — Built for Stellar Journey to Mastery • Orange Belt 🟠
