# Split Bill — Stellar Orange Belt

<div align="center">

**Decentralized Bill Splitting Protocol on Soroban**

Two smart contracts communicating via inter-contract calls on Stellar Testnet.

[![Tests](https://img.shields.io/badge/tests-11%20passed-brightgreen)](https://github.com/yt2025id-lab/stellar-split-bill/actions)
[![Soroban](https://img.shields.io/badge/soroban-sdk%20v22-blue)](https://soroban.stellar.org)
[![React](https://img.shields.io/badge/react-19-61DAFB)](https://react.dev)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)

</div>

---

## What is Split Bill?

Split Bill lets you create a shared expense (a "bill"), invite participants by their Stellar addresses, and collect XLM contributions directly on-chain. When the bill is fully funded, the vault contract automatically sends the total amount to the bill creator via a cross-contract call to the factory.

> *"Pizza for 4? Everyone pays exactly their share. No awkward math. No chasing people."*

---

## Architecture

```

                        Frontend (React 19 + Vite)
                     Multi-Wallet (Freighter, Albedo, xBull, Rabet)
                               │
                               │ JSON-RPC (fetch)
                               │
          ┌────────────────────▼────────────────────┐
          │           Stellar Soroban Testnet         │
          │                                            │
          │  ┌──────────────────┐   INTER-CONTRACT    │
          │  │  SplitBillFactory │ ◄────────────────── │
          │  │                   │   settle_bill()     │
          │  │ • register_bill   │                     │
          │  │ • settle_bill     │                     │
          │  │ • get_bills       │                     │
          │  └──────────────────┘                     │
          │         │                                  │
          │         │ deploys                          │
          │         ▼                                  │
          │  ┌──────────────────┐                      │
          │  │    BillVault     │   (1 per bill)        │
          │  │                  │                      │
          │  │ • contribute     │                      │
          │  │ • refund         │                      │
          │  │ • get_details    │                      │
          │  │ • get_status     │                      │
          │  │ • get_contributions                     │
          │  └──────────────────┘                      │
          └────────────────────────────────────────────┘
```

### Inter-Contract Communication

When a bill is fully funded (all participants have contributed their full share), the vault calls the factory via `env.invoke_contract`:

```rust
// BillVault calls SplitBillFactory.settle_bill() when fully funded
env.invoke_contract::<Val>(
    &self.factory,
    &Symbol::new(&env, "settle_bill"),
    vec![&env, self.id.into_val(&env), self.creator.to_val()],
);
```

The factory then marks the bill as settled, and the vault sends the total XLM to the creator. Both contracts emit events in a single transaction.

---

## Smart Contracts

### SplitBillFactory (`contracts/factory/`)

The central registry that manages all bills:

| Function | Description |
|----------|-------------|
| `register_bill(creator, participants, shares, title)` | Register new bill with full participant data |
| `settle_bill(vault_addr)` | Mark bill settled (called by vault via cross-contract) |
| `get_bills()` | List all registered bills |
| `get_bills_for_user(address)` | Filter bills by creator or participant |
| `get_bill_by_index(index)` | Get single bill by index (for deep links) |

### BillVault (`contracts/vault/`)

One vault contract deployed per bill:

| Function | Description |
|----------|-------------|
| `__constructor()` | No-arg constructor for `env.register()` |
| `init(factory, id, creator, participants, shares, total, native_token)` | Initialize vault with native XLM token address |
| `contribute(participant)` | Contribute share amount |
| `refund(participant)` | Refund if deadline passed |
| `withdraw(creator)` | Creator claims total XLM after settlement |
| `get_details()` | Get bill details (participants, shares, total, withdrawn) |
| `get_status()` | Get current status |
| `get_contributions()` | Get individual contributions |

---

## Test Coverage

```
SplitBillFactory (5 tests)          BillVault (6 tests)
├── test_create_and_list_bills  ✅  ├── test_contribute_and_settle  ✅
├── test_settle_bill            ✅  ├── test_partial_contribution   ✅
├── test_get_bills_for_user     ✅  ├── test_double_contribute     ✅
├── test_get_bill_by_index      ✅  ├── test_non_participant       ✅
└── test_out_of_range           ✅  ├── test_init_twice_fails      ✅
                                    └── test_withdraw_after_settle ✅
```

Run tests:
```bash
cargo test
```

---

## Deployed Contracts

| Contract | Address / Hash | Network |
|----------|---------------|---------|
| SplitBillFactory | [`CDJKY6Q5ZZDOTENXZTA7YBJGDSKGMIDCJG4ZSTBSNUX3F5EBWJ57C2KO`](https://stellar.expert/explorer/testnet/contract/CDJKY6Q5ZZDOTENXZTA7YBJGDSKGMIDCJG4ZSTBSNUX3F5EBWJ57C2KO) | Testnet |
| BillVault WASM | `c7634a97b809c02d5fddb61da2745890891d63e89b9d16b8f527e8c91686c5af` | Testnet |

---

## Verified Transaction Hashes

| Action | TX Hash | Explorer |
|--------|---------|----------|
| Factory deploy | `b97e498466a9b54aa19625a95fdb67aae6127264f5991db4e3eb230983903f18` | [View](https://stellar.expert/explorer/testnet/tx/b97e498466a9b54aa19625a95fdb67aae6127264f5991db4e3eb230983903f18) |
| Vault deploy (from WASM hash) | `956c9cb3f91e16270d88961a3d492e0069b4056974deb4a2cf3eea44970c714d` | [View](https://stellar.expert/explorer/testnet/tx/956c9cb3f91e16270d88961a3d492e0069b4056974deb4a2cf3eea44970c714d) |
| Vault init | `b59e4503ddedd5d73c24b5008bb068ccd897f008bb6fa7b3f3e0b49e055f2ce6` | [View](https://stellar.expert/explorer/testnet/tx/b59e4503ddedd5d73c24b5008bb068ccd897f008bb6fa7b3f3e0b49e055f2ce6) |
| Register bill (factory) | `30e7ccb895eb932cd20ca39961347f3c25b79d0c9f99f8931997fefaae393559` | [View](https://stellar.expert/explorer/testnet/tx/30e7ccb895eb932cd20ca39961347f3c25b79d0c9f99f8931997fefaae393559) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Rust • Soroban SDK v22.0.3 |
| Frontend | React 19 • TypeScript • Vite |
| Wallets | Freighter, Albedo, xBull, Rabet |
| Styling | Tailwind 4 • Dark theme |
| CI/CD | GitHub Actions |
| Hosting | [Vercel](https://stellar-orange-belt.vercel.app) |
| Native XLM | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` |

---

## Quick Start

```bash
# Prerequisites
rustup target add wasm32-unknown-unknown

# Build contracts
cd contracts
cargo build --release --target wasm32-unknown-unknown

# Run tests
cargo test

# Frontend
cd frontend
npm install
npm run dev        # → http://localhost:3001
```

### Environment Variables

```bash
# frontend/.env
VITE_FACTORY_CONTRACT=CDJKY6Q5ZZDOTENXZTA7YBJGDSKGMIDCJG4ZSTBSNUX3F5EBWJ57C2KO
VITE_VAULT_WASM_HASH=c7634a97b809c02d5fddb61da2745890891d63e89b9d16b8f527e8c91686c5af
VITE_NATIVE_TOKEN=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

---

## Project Structure

```
stellar-orange-belt/
├── contracts/
│   ├── factory/src/   # SplitBillFactory contract
│   │   ├── lib.rs     # Register, settle, list bills
│   │   └── test.rs    # 2 unit tests
│   └── vault/src/     # BillVault contract
│       ├── lib.rs     # Contribute, refund, cross-contract
│       └── test.rs    # 4 unit tests
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.tsx   # Marketing page
│       │   └── Dashboard.tsx # dApp interface
│       ├── App.tsx          # Router
│       └── main.tsx         # Entry point
├── .github/workflows/
│   └── ci.yml               # CI/CD pipeline
├── Cargo.toml               # Workspace
└── README.md
```

---

## CI/CD Pipeline

Every push to `main` triggers:

1. ✅ **Smart Contract Tests** — `cargo test` (11 tests)
2. ✅ **WASM Build** — Builds factory + vault for deployment
3. ✅ **Frontend Build** — `npm run build`

[![CI/CD](https://github.com/yt2025id-lab/stellar-split-bill/actions/workflows/ci.yml/badge.svg)](https://github.com/yt2025id-lab/stellar-split-bill/actions)

---

## License

MIT © 2026 — Built for Stellar Journey to Mastery • Orange Belt
