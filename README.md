# Stellar DAO — Orange Belt

A decentralized autonomous organization (DAO) built on Stellar Soroban. Features inter-contract communication, governance token voting, proposal creation/execution, event streaming, and a mobile-responsive React frontend.

## Architecture

```
stellar-orange-belt/
├── contracts/
│   ├── dao-token/       # SEP-41 Governance Token
│   └── dao-core/        # DAO Core (calls dao-token for voting power)
├── frontend/             # React + Vite + TypeScript
├── .github/workflows/    # CI/CD Pipeline
│   └── ci.yml
└── tests/               # E2E tests
```

## Smart Contracts

### dao-token
- `initialize(admin, name, symbol, initial_supply)` — Deploy governance token
- `transfer(from, to, amount)` — Transfer tokens
- `balance(owner)` — Check token balance
- `mint(admin, to, amount)` — Mint new tokens (admin only)
- `burn(from, amount)` — Burn tokens
- `total_supply()` — Total token supply

### dao-core (Inter-Contract Communication)
- `initialize(admin, token_address)` — Initialize DAO with token contract
- `create_proposal(proposer, title)` — Create governance proposal
- `cast_vote(voter, proposal_id, support)` — Vote (0=yes, 1=no, 2=abstain)
- `execute_proposal(executor, proposal_id)` — Execute passed proposal
- `get_voting_power(voter)` — Get voting power (calls dao-token.balance())
- `get_all_proposals()` — List all proposals

## Inter-Contract Communication

The `dao-core` contract calls `dao-token.balance()` and `dao-token.total_supply()` to determine voting power and quorum:
```rust
env.invoke_contract::<i128>(token_addr, &symbol_short!("balance"), vec![env, voter.to_val()])
```

## Test Results

```
running 5 tests (dao-token)
test test::test_burn ... ok
test test::test_initialize ... ok
test test::test_mint ... ok
test test::test_transfer ... ok
test test::test_transfer_insufficient_balance ... ok

running 5 tests (dao-core)
test test::test_create_proposal_and_vote ... ok
test test::test_get_all_proposals ... ok
test test::test_initialize_dao ... ok
test test::test_inter_contract_voting_power ... ok
test test::test_no_tokens_cant_create ... ok

Result: 10 passed, 0 failed
```

## CI/CD Pipeline

- **contract-tests**: Builds contracts + runs tests on every push/PR
- **frontend-tests**: Builds frontend on every push/PR
- **deploy-contracts**: Deploys contracts to Stellar Testnet on main
- **deploy-frontend**: Deploys frontend to Vercel on main

## Quick Start

```bash
# Contracts
cargo build --release
cargo test

# Frontend
cd frontend
npm install
npm run dev
```

## Deployed Contracts (Testnet)

- **DAO Token**: `TBD`
- **DAO Core**: `TBD`

## Tech Stack

- **Contracts**: Rust + Soroban SDK v26
- **Frontend**: React 19 + TypeScript + Vite 8
- **Wallet**: Freighter browser extension
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel

## Screenshots

![Mobile Responsive](screenshots/mobile.png)
![CI/CD Pipeline](screenshots/ci.png)
![Contract Interaction](screenshots/vote.png)

## License

MIT
