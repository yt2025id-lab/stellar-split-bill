# 📸 Screenshot Capture Guide

## File Naming Convention
Simpan semua screenshot di folder `screenshots/` dengan nama berikut:

```
screenshots/
├── 1-mobile-responsive.png       # Tampilan mobile
├── 2-cicd-pipeline.png           # GitHub Actions CI/CD hijau
├── 3-test-output.png             # 12 passing tests
├── 4-live-demo-desktop.png       # Live demo desktop
├── 5-tx-explorer.png             # Transaction di Stellar Expert
└── 6-inter-contract-events.png   # Events dari 2 kontrak dalam 1 TX
```

---

## Screenshot 1 — Mobile Responsive UI

**Buka:**
```
https://frontend-ivory-nine-47.vercel.app
```

**Langkah:**
1. Chrome → ⌘⌥I (DevTools) → ⌘⇧M (Toggle Device Toolbar)
2. Pilih **iPhone 14 Pro** (393 × 852)
3. Scroll untuk menunjukkan: hero + navigation + "Connect Freighter" button
4. ⌘⇧4 → drag untuk capture area browser → **simpan sebagai `1-mobile-responsive.png`**

---

## Screenshot 2 — CI/CD Pipeline Running

**Buka:**
```
https://github.com/yt2025id-lab/stellar-split-bill/actions
```

**Langkah:**
1. Scroll ke workflow paling atas (latest run)
2. Pastikan terlihat: **"Smart Contract Tests ✓"** dan **"Frontend Build ✓"**
3. ⌘⇧4 → capture area workflow → **simpan sebagai `2-cicd-pipeline.png`**

---

## Screenshot 3 — Test Output (12 Passing)

**Buka Terminal, jalankan:**
```bash
cd "/Users/macbookair/Documents/project/Project Stellar/stellar-orange-belt"
cargo test 2>&1 | grep -E "test |running|result"
```

**Langkah:**
1. Pastikan tampak: `running 7 tests` + `running 5 tests` + `test result: ok. 12 passed`
2. ⌘⇧5 → capture terminal window → **simpan sebagai `3-test-output.png`**

---

## Screenshot 4 — Live Demo Desktop

**Buka:**
```
https://frontend-ivory-nine-47.vercel.app
```

**Langkah:**
1. Tampilan full desktop, scroll dari hero sampai ke dApp section
2. Pastikan terlihat: logo, hero dengan 3D sphere, "Launch dApp" button
3. ⌘⇧4 → capture window → **simpan sebagai `4-live-demo-desktop.png`**

---

## Screenshot 5 — Transaction Explorer

**Buka:**
```
https://stellar.expert/explorer/testnet/tx/746eb4f75c44cd97877d3bb10f7f2b727c66220c82a3c8c473d0645075587292
```

**Langkah:**
1. Scroll ke bagian **Events**
2. Pastikan terlihat event dari **kedua kontrak**: `burn` (dari split-token) + `bill.paid` (dari split-core)
3. ⌘⇧4 → capture area events → **simpan sebagai `5-tx-explorer.png`**

---

## Screenshot 6 — Inter-Contract Events (Close-up)

**Buka halaman yang sama:**
```
https://stellar.expert/explorer/testnet/tx/746eb4f75c44cd97877d3bb10f7f2b727c66220c82a3c8c473d0645075587292
```

**Langkah:**
1. Zoom in pada bagian events
2. Highlight/lingkari kedua event: `burn` dan `bill.paid`
3. ⌘⇧4 → capture zoomed area → **simpan sebagai `6-inter-contract-events.png`**
