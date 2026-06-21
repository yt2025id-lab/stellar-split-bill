import type { Dict } from "./types";

export const id: Dict = {
  nav: { launch: "Buka Aplikasi" },
  hero: {
    badge: "Split Bill · Berbagi Biaya Terdesentralisasi",
    titleLine1: "Split",
    titleLine2: "Bills",
    titleLead: "di",
    lead: "Split tagihan digital tanpa ribet.",
    leadStrong: "Tanpa kejar teman. Tanpa sengketa pembayaran. Hanya smart contract.",
    features: "Split rata · Settlement on-chain · Dibangun di Stellar.",
    ctaPrimary: "Buka dApp",
    ctaSecondary: "Baca docs",
    cardTitle: "Protokol Split Bill",
    builtOn: "Dibangun di Stellar",
    live: "Live",
    stats: [
      { value: "Instan", label: "Settlement" },
      { value: "Nol", label: "Sengketa" },
      { value: "100% On-chain · Transparan", label: "Keamanan" },
    ],
    ticker: ["Split tagihan terdesentralisasi", "Tanpa matematika canggung", "Tanpa perlu percaya", "Sepenuhnya teraudit"],
    scrollCue: "Scroll",
  },
  akar: {
    kicker: "Masalah Sehari-hari",
    title: "Split tagihan, dipercaya miliaran teman.",
    body:
      "Berbagi biaya adalah cara dunia berbagi pengeluaran turun-temurun: setiap orang membayar bagian masing-masing. Tapi selalu ada yang lupa bayar, hitungannya berantakan, dan menagih teman itu hal paling canggung.",
    statValue: "Miliaran",
    statLabel: "tagihan di-split setiap tahun",
    facts: ["Tanpa canggung", "Tanpa menagih", "Hanya percaya"],
  },
  percikan: {
    kicker: "Percikan",
    title: "Bagaimana kalau tagihan selesai sendiri?",
    body:
      "Kalau split tagihan sudah jadi kontrak sosial, Stellar Soroban bisa membuatnya terverifikasi, otomatis, dan terbuka untuk siapa saja — mengubah janji sosial menjadi kode yang tidak bisa diubah.",
    points: ["Terverifikasi", "Otomatis", "Terbuka untuk siapa saja"],
  },
  retakan: {
    kicker: "Masalah Split Tagihan Tradisional",
    title: "Tapi cara lama gampang rusak.",
    body:
      "Lupa bayar: selalu ada yang lupa. Menagih canggung: nggak ada yang suka nagih uang. Catatan manual: spreadsheet penuh error. Tanpa bukti: argumen 'aku udah bayar!' tanpa penyelesaian.",
  },
  tempaan: {
    kicker: "Sistem Token Kewajiban",
    title: "Anti-lupa: token yang bikin nagih nggak perlu.",
    body:
      "Setiap pembayar dapat token kewajiban sebesar bagiannya. Tandai diri sudah bayar, kontrak bakar tokenmu. Nggak ada yang bisa pura-pura bayar. Nggak ada yang bisa bayar dua kali. Semua terselesaikan di on-chain selamanya.",
    fleeLabel: "Belum bayar ✗",
    safeLabel: "Sudah bayar & selesai ✓",
    formula: "Bagian = Total ÷ Pembayar · Split rata dijamin smart contract",
  },
  nyala: {
    kicker: "Inter-Contract Magic",
    title: "Split Core panggil Split Token. Otomatis.",
    body:
      "Saat kamu tandai pembayaran, kontrak Split Core langsung panggil Split Token untuk membakar token kewajibanmu. Komposabilitas sejati — dua kontrak bekerja bersama memverifikasi dan menyelesaikan setiap pembayaran.",
    streamCollateral: "Split Core",
    streamDues: "Split Token",
    streamYield: "Inter-Contract",
  },
  sistem: {
    kicker: "Cara Main",
    title: "Setiap aturan dijamin smart contract.",
    body:
      "Buat tagihan, undang teman dengan alamat Stellar, cetak token kewajiban, tandai pembayaran saat masuk, dan lihat tagihan selesai otomatis saat semua sudah bayar. 100% on-chain, tanpa admin.",
    rules: [
      "Tagihan harus split rata — kontrak memastikan pembagian tepat, tanpa sisa.",
      "Setiap pembayar dapat token kewajiban sebesar bagian masing-masing.",
      "Bayar membakar tokenmu via inter-contract communication dengan Split Token.",
      "Pembayaran terverifikasi on-chain: kamu selalu bisa buktikan sudah bayar.",
      "Pembayaran ganda tidak mungkin: kontrak melacak siapa yang sudah bayar.",
      "Saat pembayar terakhir tandai pembayaran, tagihan selesai otomatis.",
      "Hanya pembayar yang diundang yang bisa ikut — daftar undangan tersimpan di kontrak.",
      "Semua riwayat tagihan tersimpan permanen di ledger Stellar.",
      "Kontrak menangani hingga 100 tagihan aktif tanpa degradasi.",
    ],
    timeline: [
      { day: "Langkah", label: "Buat tagihan" },
      { day: "Cetak", label: "Token" },
      { day: "Bayar", label: "& selesai" },
    ],
  },
  galeri: {
    kicker: "100% On-Chain",
    title: "Dibangun native di Stellar, bukan sekadar porting.",
    items: [
      { name: "Soroban", desc: "Smart contract Rust dengan performa dan keamanan kelas atas." },
      { name: "Inter-Contract", desc: "Panggilan antar kontrak tanpa friksi — Split Core panggil Split Token secara native." },
      { name: "Freighter Wallet", desc: "Hubungkan dengan ekstensi browser. Seed phrase tidak terekspos ke dApp." },
      { name: "Stellar RPC", desc: "Akses JSON-RPC langsung ke Soroban untuk simulasi dan pengiriman transaksi." },
      { name: "Stellar Expert", desc: "Block explorer untuk verifikasi setiap transaksi dan interaksi kontrak." },
    ],
  },
  bukti: {
    kicker: "Keunggulan",
    title: "Kenapa pilih Split Bill?",
    stats: [
      { value: "Rata", label: "Split tepat setiap kali" },
      { value: "2X", label: "Dua kontrak verifikasi" },
      { value: "$0.001", label: "Per transaksi" },
      { value: "100%", label: "On-chain & teraudit" },
    ],
  },
  cta: {
    title: "Mulai split tagihan di testnet.",
    button: "Buka aplikasi",
    explorer: "Lihat di Stellar Expert",
    github: "GitHub",
    community: "Komunitas",
  },
  landing: {
    footer: {
      tagline: "Berbagi Biaya Terdesentralisasi",
      blurb: "Protokol smart contract di Stellar Soroban. Split tagihan tanpa percaya dengan verifikasi inter-contract, token kewajiban, dan settlement otomatis.",
      productTitle: "Produk",
      ecosystemTitle: "Ekosistem",
      communityTitle: "Komunitas",
      deployed: "Berjalan di Stellar Testnet",
      event: "Stellar Orange Belt 2026",
      rights: "© 2026 Split Bill. Berbagi Biaya Terdesentralisasi di Stellar.",
      product: ["Tagihan", "Buat", "Tandai Bayar", "Riwayat", "Profil", "FAQ"],
    },
  },
};
