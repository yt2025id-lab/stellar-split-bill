# Submission Notes — Split Bill (Orange Belt)

## Project Name
**Stellar Split Bill** — Decentralized Bill Splitting Protocol

## Tagline
Split any expense. Share the burden. Settle on-chain via inter-contract communication.

## Description
Split Bill is a decentralized expense-sharing protocol on Stellar Soroban with two smart contracts communicating via inter-contract calls. **Factory-centric architecture** — each `BillInfo` stores `participants` and `shares` directly in the factory, eliminating the need to query individual vaults. Frontend loads all bills in **1 RPC call** via `get_bills_for_user(address)`. Share links use `?bill=INDEX` for instant deep-linking. 11 smart contract tests pass. CI/CD green.

## What makes your project unique?
**Factory-centric architecture with single-RPC loading.** Unlike typical dApps that query each vault individually, Split Bill stores participant data in the factory's `BillInfo` struct. Users see their bills instantly without iterating through vault contracts. Inter-contract communication: BillVault atomically calls the factory's `settle_bill` when fully funded — both contracts emit events in 1 TX. Has `withdraw` for creator claim, `refund` for expired bills, and init guard preventing re-initialization.

## Technical Highlights
- **Factory-Centric Architecture**: BillInfo stores `participants: Vec<Address>` + `shares: Vec<i128>` in factory — no vault queries needed
- **Single-RPC Loading**: `get_bills_for_user(address)` filters bills on-chain, frontend loads in 1 call
- **Index-Based Deep Links**: `?bill=0` → `get_bill_by_index(0)` — robust, not vault-ID dependent
- **Inter-Contract Communication**: BillVault → `env.invoke_contract(&factory, "settle_bill", ...)` — vault + factory emit events in 1 TX
- **Dynamic Vault Deployment**: Each bill deploys a fresh vault instance with init guard
- **11 Smart Contract Tests**: 5 factory (incl. get_bills_for_user, get_bill_by_index) + 6 vault (incl. init_twice_fails, withdraw_after_settle)
- **47+ Meaningful Commits**: scaffold → contracts → tests → deploy → factory-centric rewrite → native XLM → withdraw
- **Multi-Wallet**: Freighter, Albedo, xBull, Rabet
- **Mobile Responsive**: Tailwind 4, dark theme, works on all screen sizes
- **CI/CD Pipeline**: GitHub Actions — contract tests + WASM build + frontend build on every push

## Links
- **GitHub**: https://github.com/yt2025id-lab/stellar-split-bill
- **Live Demo**: https://frontend-ivory-nine-47.vercel.app
- **Demo Video**: [INSERT YOUTUBE/DRIVE LINK]

## Contract Addresses (Testnet)
- **SplitBillFactory**: CDJKY6Q5ZZDOTENXZTA7YBJGDSKGMIDCJG4ZSTBSNUX3F5EBWJ57C2KO
- **BillVault WASM Hash**: c7634a97b809c02d5fddb61da2745890891d63e89b9d16b8f527e8c91686c5af
- **Native XLM (Testnet)**: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

## Verified Transaction Hashes
| Action | TX Hash |
|--------|---------|
| Factory WASM upload | 102fd20e88068a8edae28c84132b87cb8691df1aa1a2deef851d956070990d62 |
| Vault WASM upload | f2ac9342d09decbe1ec2ba4df0f41181f7e10f57822ef5212c4e79f5a7916cac |
| Factory deploy | 3d473bcd132c304119d0086c04d24e7e024b1f98ef5ef7b734e06fe531c0bb91 |

## Screenshots
- `screenshots/1-mobile-responsive.png` — Mobile responsive UI (iPhone 14 Pro)
- `screenshots/2-cicd-pipeline.png` — CI/CD green
- `screenshots/3-test-output.png` — 11 passing tests

## Criteria Mapping

| # | Criteria | Evidence |
|---|----------|----------|
| 1 | Smart contract development | 2 contracts: SplitBillFactory (w/ participants,shares) + BillVault (w/ init guard, withdraw, refund) |
| 2 | Inter-contract communication | `env.invoke_contract()` — vault calls factory `settle_bill` on full funding |
| 3 | Event streaming | Contract events on `bill_created`, `contributed`, `bill_settled` |
| 4 | CI/CD pipeline | GitHub Actions — contract tests + WASM build + frontend build |
| 5 | Contract deployment workflow | WASM artifacts built, optimized with wasm-opt, uploaded and deployed via scripts |
| 6 | Mobile responsive frontend | Tailwind 4, dark theme, multi-wallet, responsive |
| 7 | Error handling | try/catch everywhere, status bar, TX explorer links |
| 8 | Writing tests | 11 unit tests covering happy + edge + rejection paths (5 factory, 6 vault) |
| 9 | Production-ready practices | Env vars, persistent keypair, validation, Vercel deploy, share links |
| 10 | Documentation | Architecture diagram, contract addresses, TX hashes, test output |
