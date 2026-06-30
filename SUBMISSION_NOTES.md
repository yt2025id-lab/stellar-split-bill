# Submission Notes — Split Bill (Orange Belt)

## Project Name
**Stellar Split Bill** — Decentralized Bill Splitting Protocol

## Tagline
Split any expense. Share the burden. Settle on-chain via inter-contract communication.

## Description
Split Bill is a decentralized expense-sharing protocol on Stellar Soroban with two smart contracts communicating via inter-contract calls. The SplitBillFactory manages bill registration, and a per-bill BillVault contract handles XLM contributions. When fully funded, the vault automatically calls the factory via `env.invoke_contract` to settle — both contracts emit events in one transaction. 7 smart contract tests pass. CI/CD green.

## What makes your project unique?
Inter-contract communication with automatic settlement. Unlike simple escrow dApps, Split Bill's vault contract atomically calls the factory's `settle_bill` function when all participants have paid — the total XLM is transferred to the creator in the same transaction. Each bill gets its own vault contract deployed dynamically, with authorization checks, duplicate payment prevention, refund after deadline, and cross-contract events verified on-chain.

## Technical Highlights
- **Inter-Contract Communication**: BillVault → `env.invoke_contract(&factory, "settle_bill", ...)` — vault + factory emit events in 1 TX
- **Dynamic Vault Deployment**: Each bill deploys a fresh vault instance from WASM hash
- **7 Smart Contract Tests**: create_and_list, settle, contribute_and_settle, partial_contribution, double_contribute fails, non_participant fails, withdraw_after_settle
- **46 Meaningful Commits**: scaffold → contracts → tests → deploy → frontend → polish → native XLM → withdraw
- **Multi-Wallet**: Freighter, Albedo, xBull, Rabet
- **Mobile Responsive**: Tailwind 4, dark theme, works on all screen sizes
- **CI/CD Pipeline**: GitHub Actions — contract tests + WASM build + frontend build on every push

## Links
- **GitHub**: https://github.com/yt2025id-lab/stellar-split-bill
- **Live Demo**: https://frontend-ivory-nine-47.vercel.app
- **Demo Video**: [INSERT YOUTUBE/DRIVE LINK]

## Contract Addresses (Testnet)
- **SplitBillFactory**: CA7R7GECD23KFFLYSQRSAROZ52Y3UAEO6JAJBTO4WCK46PV3IJUY4L5M
- **BillVault WASM Hash**: cb2a043f5a07224c24e1a90df9498a48b7ccd36fac745800e3ce66163288d22f
- **Native XLM (Testnet)**: CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC

## Verified Transaction Hashes
| Action | TX Hash |
|--------|---------|
| Factory deploy | b97e498466a9b54aa19625a95fdb67aae6127264f5991db4e3eb230983903f18 |
| Vault deploy + init + register | c58a204f5a276c541e2c9e3f96e190a59e41132264fd21d8e4e423ba23f45150 |
| Contribute + cross-contract settle | f3f2b4de6f359b3a23a5f8dc5355eb1664f05a6cd8f3619ac6f6b6b3ed170d4d |

## Screenshots
- `screenshots/1-mobile-responsive.png` — Mobile responsive UI (iPhone 14 Pro)
- `screenshots/2-cicd-pipeline.png` — CI/CD green
- `screenshots/3-test-output.png` — 7 passing tests

## Criteria Mapping

| # | Criteria | Evidence |
|---|----------|----------|
| 1 | Smart contract development | 2 contracts: SplitBillFactory + BillVault with authorization, whitelist, duplicate prevention |
| 2 | Inter-contract communication | `env.invoke_contract()` — vault calls factory `settle_bill` on full funding |
| 3 | Event streaming | Contract events on `bill_registered`, `contributed`, `bill_settled` |
| 4 | CI/CD pipeline | GitHub Actions — contract tests + WASM build + frontend build |
| 5 | Contract deployment workflow | WASM artifacts built and uploaded in CI |
| 6 | Mobile responsive frontend | Tailwind 4, dark theme, multi-wallet, responsive |
| 7 | Error handling | try/catch everywhere, status bar, TX explorer links |
| 8 | Writing tests | 7 unit tests covering happy + edge + rejection paths (incl. withdraw) |
| 9 | Production-ready practices | Env vars, persistent keypair, validation, Vercel deploy, share links |
| 10 | Documentation | Architecture diagram, contract addresses, TX hashes, test output |
