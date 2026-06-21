import type { Dict } from "./types";

export const id: Dict = {
  nav: { launch: "Buka Aplikasi" },
  hero: {
    badge: "Suivan · Community Wealth Protocol",
    titleLine1: "Trustless",
    titleLine2: "ROSCA",
    titleLead: "di",
    lead: "Arisan digital tanpa bendahara.",
    leadStrong: "Tak ada risiko dana hilang. Tak perlu percaya buta.",
    features: "Yield otomatis · Settlement instan · Sepenuhnya di Sui.",
    ctaPrimary: "Ikut arisan sekarang",
    ctaSecondary: "Baca docs",
    cardTitle: "Protokol Suivan",
    builtOn: "Dibangun di Sui",
    live: "Live",
    stats: [
      { value: "Instan", label: "Settlement" },
      { value: "Nol", label: "Bendahara" },
      { value: "100% On-chain · Permissionless", label: "Keamanan" },
    ],
    ticker: ["Arisan terdesentralisasi", "Yield dari dana nganggur", "Tanpa perlu percaya", "Sepenuhnya teraudit"],
    scrollCue: "Gulir",
  },
  akar: {
    kicker: "Keuangan Tradisional",
    title: "Arisan bergilir, dipercaya 100J+ orang.",
    body:
      "Arisan adalah cara dunia menabung bersama turun-temurun: setiap orang menyetor jumlah tetap tiap putaran dan bergiliran menerima uangnya. Tanpa bank, tanpa bendahara. Sejatinya ini DeFi tradisional yang berjalan ratusan tahun hanya bermodal kepercayaan.",
    statValue: "100J+",
    statLabel: "orang memakai ROSCA di dunia",
    facts: ["Tanpa bank", "Tanpa bendahara", "Cukup percaya"],
  },
  percikan: {
    kicker: "Percikan",
    title: "Bagaimana kalau dibawa on-chain?",
    body:
      "Kalau arisan memang sudah DeFi, Sui bisa membuatnya terverifikasi, otomatis, dan terbuka untuk siapa saja, memutar kekayaan digital baru tanpa kehilangan hal yang membuatnya berjalan.",
    points: ["Terverifikasi", "Otomatis", "Terbuka untuk semua"],
  },
  retakan: {
    kicker: "Masalah Arisan Tradisional",
    title: "Tapi cara lama gampang retak.",
    body:
      "Risiko kabur: peserta hilang setelah giliran pertama. Dana nganggur: uang terkumpul tak menghasilkan apa pun. Catatan manual: mudah dimanipulasi, tak pernah transparan. Skala terbatas: hanya bisa dengan keluarga atau teman dekat.",
  },
  tempaan: {
    kicker: "Sistem Jaminan",
    title: "Anti-kabur: angka yang membuat kabur jadi sia-sia.",
    body:
      "Setor jaminan di awal, dikembalikan beserta yield kalau kamu konsisten. 50%, masih sepadan untuk kabur. 100%, masih belum aman. Hitungan berhenti di 125%: jaminannya selalu lebih besar dari yang bisa dibawa lari siapa pun.",
    fleeLabel: "Masih sepadan untuk kabur ✗",
    safeLabel: "Aman: kabur malah rugi ✓",
    formula: "Jaminan aman = 125% × jumlah anggota × iuran per periode",
  },
  nyala: {
    kicker: "AI Yield Optimizer",
    title: "Jaminan nganggur? Buat ia bekerja, dua kali.",
    body:
      "Mengunci dana mematikan semangat ikut arisan. Maka AI optimizer otomatis menyalurkan jaminan dan iuran bulanan ke protokol DeFi Sui terbaik, jadi tiap peserta untung dua kali selagi menunggu giliran.",
    streamCollateral: "Jaminan",
    streamDues: "Iuran bulanan",
    streamYield: "Double yield",
  },
  sistem: {
    kicker: "Cara Main",
    title: "Setiap aturan ditegakkan smart contract.",
    body:
      "Pilih pool, setor jaminan, iuran bulanan, dapat giliran lewat undian terverifikasi, lalu bagi bonus yield di akhir. 100% on-chain, tanpa admin yang perlu dipercaya.",
    rules: [
      "Periode bulanan, minimal 3 anggota (makin banyak anggota, makin tinggi jaminan).",
      "Pembayaran pertama mencakup iuran bulanan dan jaminan.",
      "Iuran dibayar tanggal 1-10; pengocokan tanggal 25 untuk memaksimalkan yield bulanan.",
      "Leaderboard membuatnya seru: bayar sebelum tanggal 10 dapat yield lebih dan nilai lebih baik.",
      "Pembayaran setelah tanggal 25 masuk bulan depan; jaminan menutup iuran bulan itu.",
      "Tanggal 25 pemenang diumumkan dan menerima jumlah anggota × iuran bulanan.",
      "Yield tiap anggota terkumpul bulanan dan diselesaikan di akhir arisan.",
      "Setelah putaran terakhir (sekitar tanggal 29), jaminan beserta seluruh yield dikembalikan.",
      "10 arisan dengan nilai bagus membuka diskon jaminan di arisan ke-11.",
    ],
    timeline: [
      { day: "1-10", label: "Bayar iuran" },
      { day: "25", label: "Kocok pemenang" },
      { day: "29", label: "Selesai & kembali" },
    ],
  },
  galeri: {
    kicker: "100% On-Chain",
    title: "Dibangun native di Sui, bukan sekadar porting.",
    items: [
      { name: "zkLogin", desc: "Masuk dengan akun Google, tanpa seed phrase, tanpa ekstensi." },
      { name: "Sponsored Tx", desc: "Ikut dan bayar tanpa gas; relayer yang menanggung biaya SUI." },
      { name: "DeepBook V3", desc: "Yield nyata dari arbitrase flash-loan, bukan APY simulasi." },
      { name: "Seal", desc: "Commit-reveal terenkripsi ambang memilih pemenang yang tak bisa dicurangi." },
      { name: "Walrus", desc: "Perjanjian pool dan metadata disimpan di blob terdesentralisasi." },
    ],
  },
  bukti: {
    kicker: "Keunggulan",
    title: "Kenapa pilih Suivan?",
    stats: [
      { value: "125%", label: "Jaminan · anti-kabur" },
      { value: "2X", label: "Aliran yield ganda" },
      { value: "$0.001", label: "Per transaksi" },
      { value: "100%", label: "On-chain & teraudit" },
    ],
  },
  cta: {
    title: "Masuk protokol di testnet.",
    button: "Buka aplikasinya",
    explorer: "Lihat di Suiscan",
    github: "GitHub",
    community: "Komunitas",
  },
  landing: {
    footer: {
      tagline: "Community Wealth Protocol",
      blurb: "Protokol arisan terprogram di Sui Move. Trust-minimized, non-kustodial, DeFi yang dapat dikomposisi untuk tabungan komunitas.",
      productTitle: "Produk",
      ecosystemTitle: "Ekosistem",
      communityTitle: "Komunitas",
      deployed: "Berjalan di Sui Testnet",
      event: "Sui Overflow 2026",
      rights: "© 2026 Suivan. Community Wealth Protocol di Sui.",
      product: ["Pools", "Faucet", "Simulator", "Yield", "Profil", "FAQ"],
    },
  },
};
