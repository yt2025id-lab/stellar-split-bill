# Demo Video Script — Split Bill (Orange Belt)
## Duration: ~1:30 | Language: English or Bahasa

---

### SCENE 1 — HOOK (0:00 - 0:10)
**[Screen: Split Bill dApp landing page — dark theme with gradient]**

> "Pernah traktir temen tapi susah nagih? Split Bill is a decentralized bill-splitting protocol on Stellar Soroban. Create a bill, invite friends, and collect XLM directly on-chain."

---

### SCENE 2 — ARCHITECTURE (0:10 - 0:25)
**[Screen: README architecture section — Factory + Vault diagram]**

> "Two smart contracts. SplitBillFactory manages bill registration. Each bill gets its own BillVault contract. When all participants have paid, the vault automatically calls the factory to settle — inter-contract communication in one transaction."

**[Highlight: env.invoke_contract code]**

---

### SCENE 3 — TESTS (0:25 - 0:40)
**[Screen: Terminal — cargo test output]**

> "6 smart contract tests pass — factory tests for creating and settling bills, vault tests for contributions, double-payment rejection, and non-participant authorization. CI/CD via GitHub Actions runs these tests on every push."

---

### SCENE 4 — LIVE DEMO (0:40 - 1:10)
**[Screen: Live dApp at frontend-ivory-nine-47.vercel.app]**

> "Let me show you the live dApp. I'll connect my Freighter wallet..."

**[Connect wallet → Create bill form]**

> "Create a bill — enter title, total XLM, number of payers, and their Stellar addresses."

**[Fill form → Click "Create Bill" → Success modal appears]**

> "The bill is created. A vault contract is deployed dynamically, initialized, and registered in the factory — all in under 30 seconds. Here's the share link to send to friends."

**[Click contribute on another bill]**

> "Participants connect their wallets and contribute their share. When everyone has paid, the vault calls the factory to settle, and the creator receives the total XLM."

---

### SCENE 5 — CLOSING (1:10 - 1:30)
**[Screen: GitHub repo with all items]**

> "34 commits. 6 tests. CI/CD green. Deployed to Vercel. Inter-contract communication verified on-chain. Split Bill — decentralized bill splitting on Stellar Soroban."

---

## Shot List

| # | Scene | Duration | Screen |
|---|-------|----------|--------|
| 1 | Hook + value prop | 10s | Landing page |
| 2 | Architecture + inter-contract code | 15s | README architecture |
| 3 | Tests + CI/CD | 15s | Terminal + GitHub Actions |
| 4 | Live demo | 30s | Live dApp |
| 5 | Closing | 20s | GitHub repo |
| **Total** | | **1m30s** | |
