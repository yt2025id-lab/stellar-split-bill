# Stellar Split Bill — Orange Belt 🟠

**Decentralized bill splitting on Stellar Soroban.** Create a bill, split it among friends, and track payments in real-time. Built with inter-contract communication, neo-brutalist design, and full CI/CD.

## Architecture

```
split-core.mark_paid() ──calls──► split-token.burn()
      ▲                                    ▲
      │                                    │
  "Pay your share"                   "Burn obligation token"
```

## Smart Contracts

### split-token
SEP-41 compatible token for split payment obligations.
- `initialize(admin, name, symbol, initial_supply)`
- `transfer(from, to, amount)`
- `balance(owner)`
- `mint(admin, to, amount)` — admin-only
- `burn(from, amount)` — burns tokens

### split-core (Inter-Contract)
- `create_bill(creator, description, total_amount, payer_count)`
- `mark_paid(payer, bill_id)` — **calls split-token.burn()** to burn payer's obligation tokens
- `get_bill(bill_id)` / `get_all_bills()`

## Test Results

```
running 5 tests (split-token)   ✅ 5 passed
running 5 tests (split-core)    ✅ 5 passed
Result: 10 passed, 0 failed
```

## Tech Stack

- **Contracts:** Rust + Soroban SDK v26
- **Frontend:** React 19 + TypeScript + Vite 8 + Neo-Brutalism CSS
- **Wallet:** Freighter browser extension
- **CI/CD:** GitHub Actions
- **Deploy:** Vercel (frontend) + Stellar Testnet (contracts)

## Deployed Contracts (Testnet)

- **Split Token:** `TBD`
- **Split Core:** `TBD`

## CI/CD Pipeline

```
push → [contract-tests] → [frontend-build] → [deploy-contracts] → [deploy-frontend]
```

## Quick Start

```bash
# Contracts
cargo build --release --target wasm32v1-none
cargo test

# Frontend
cd frontend && npm install && npm run dev
```

## License

MIT
