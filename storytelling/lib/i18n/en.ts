import type { Dict } from "./types";

export const en: Dict = {
  nav: { launch: "Launch App" },
  hero: {
    badge: "Split Bill · Decentralized Expense Sharing",
    titleLine1: "Split",
    titleLine2: "Bills",
    titleLead: "on",
    lead: "Decentralized bill splitting without awkward math.",
    leadStrong: "No chasing friends. No disputed payments. Just smart contracts.",
    features: "Even splits · On-chain settlement · Built on Stellar.",
    ctaPrimary: "Launch dApp",
    ctaSecondary: "Read docs",
    cardTitle: "Split Bill Protocol",
    builtOn: "Built on Stellar",
    live: "Live",
    stats: [
      { value: "Instant", label: "Settlement" },
      { value: "Zero", label: "Disputes" },
      { value: "100% On-chain · Transparent", label: "Security" },
    ],
    ticker: ["Decentralized splitting", "No awkward math", "Zero trust required", "Fully auditable"],
    scrollCue: "Scroll",
  },
  akar: {
    kicker: "Everyday Problem",
    title: "Splitting bills, trusted by billions of friends.",
    body:
      "Splitting expenses is how the world has shared costs for generations: everyone chips in their fair share. But someone always forgets to pay, the math gets messy, and chasing friends for money is the worst.",
    statValue: "Billions",
    statLabel: "of bills split every year",
    facts: ["No awkwardness", "No chasing", "Just trust"],
  },
  percikan: {
    kicker: "The Spark",
    title: "What if bills settled themselves?",
    body:
      "If split bills are already a social contract, Stellar Soroban can make it verifiable, automatic, and open to anyone — turning a social promise into immutable code.",
    points: ["Verifiable", "Automatic", "Open to anyone"],
  },
  retakan: {
    kicker: "Traditional Bill Splitting Problems",
    title: "But the old way breaks easily.",
    body:
      "Forgotten payments: someone always forgets. Awkward chasing: nobody likes asking for money. Manual records: spreadsheet errors everywhere. No proof: 'I already paid!' arguments with no resolution.",
  },
  tempaan: {
    kicker: "Obligation Token System",
    title: "Anti-forget: the token that makes chasing obsolete.",
    body:
      "Each payer receives obligation tokens equal to their share. Mark yourself as paid, the contract burns your tokens. No one can fake a payment. No one can pay twice. The math is settled on-chain forever.",
    fleeLabel: "Unpaid ✗",
    safeLabel: "Paid & settled ✓",
    formula: "Share = Total ÷ Payers · Even split enforced by smart contract",
  },
  nyala: {
    kicker: "Inter-Contract Magic",
    title: "Split Core calls Split Token. Automatically.",
    body:
      "When you mark a payment, the Split Core contract instantly calls Split Token to burn your obligation tokens. True composability — two contracts working together to verify and settle every payment.",
    streamCollateral: "Split Core",
    streamDues: "Split Token",
    streamYield: "Inter-Contract",
  },
  sistem: {
    kicker: "How to Play",
    title: "Every rule enforced by a smart contract.",
    body:
      "Create a bill, invite friends by their Stellar addresses, mint obligation tokens, mark payments as they come, and watch the bill auto-complete when everyone pays. 100% on-chain, zero admin needed.",
    rules: [
      "Bills require an even split — the contract enforces exact division, no remainder.",
      "Each payer receives obligation tokens equal to their share of the total.",
      "Paying burns your tokens via inter-contract communication with Split Token.",
      "Payment is verified on-chain: you can always prove you've paid your share.",
      "Double payments are impossible: the contract tracks who has already paid.",
      "When the last payer marks their payment, the bill auto-completes.",
      "Only invited payers can join — the payer whitelist is stored in the contract.",
      "All bill history is permanently stored on the Stellar ledger.",
      "The contract handles up to 100 active bills with no degradation.",
    ],
    timeline: [
      { day: "Step", label: "Create bill" },
      { day: "Mint", label: "Tokens" },
      { day: "Pay", label: "& complete" },
    ],
  },
  galeri: {
    kicker: "100% On-Chain",
    title: "Built native on Stellar, not ported.",
    items: [
      { name: "Soroban", desc: "Rust-based smart contracts with best-in-class performance and safety." },
      { name: "Inter-Contract", desc: "Cross-contract calls with zero friction — Split Core calls Split Token natively." },
      { name: "Freighter Wallet", desc: "Connect with a browser extension. No seed phrase exposure to the dApp." },
      { name: "Stellar RPC", desc: "Direct JSON-RPC access to Soroban for simulation and transaction submission." },
      { name: "Stellar Expert", desc: "Block explorer for verifying every transaction and contract interaction." },
    ],
  },
  bukti: {
    kicker: "Advantages",
    title: "Why choose Split Bill?",
    stats: [
      { value: "Even", label: "Exact splits every time" },
      { value: "2X", label: "Two contracts verifying" },
      { value: "$0.001", label: "Per transaction" },
      { value: "100%", label: "On-chain & auditable" },
    ],
  },
  cta: {
    title: "Start splitting bills on testnet.",
    button: "Launch the app",
    explorer: "View on Stellar Expert",
    github: "GitHub",
    community: "Community",
  },
  landing: {
    footer: {
      tagline: "Decentralized Expense Sharing",
      blurb: "A smart contract protocol on Stellar Soroban. Trustless bill splitting with inter-contract verification, obligation tokens, and automatic settlement.",
      productTitle: "Product",
      ecosystemTitle: "Ecosystem",
      communityTitle: "Community",
      deployed: "Deployed on Stellar Testnet",
      event: "Stellar Orange Belt 2026",
      rights: "© 2026 Split Bill. Decentralized Expense Sharing on Stellar.",
      product: ["Bills", "Create", "Mark Paid", "History", "Profile", "FAQ"],
    },
  },
};
