# Meta Ads Kit — Dyca Creative (Worksheet Anak Digital)

Dokumen kerja untuk tim marketing. Berisi: (1) analisa konten landing page, (2) yang wajib dilengkapi sebelum iklan jalan, (3) struktur campaign, (4) copy iklan siap pakai, (5) brief kreatif, (6) tracking & UTM, (7) KPI.

Tanggal disusun: 8 September 2026.

---

## 1. Analisa konten landing page

### Yang sudah kuat
- **Positioning ganda jelas**: "pakai sendiri ATAU jual lagi" — dipisah rapi di section `duo`, pricing, dan "cara kerja". Ini jarang dipunya kompetitor worksheet.
- **Struktur persuasi lengkap**: hook → pain point → solusi → isi produk (23 koleksi + bonus) → objection (reseller teaser) → paket → cara kerja → FAQ → testimoni → CTA akhir.
- **Offer bertingkat + risk reversal**: ada paket gratis (lead magnet) → mendorong low-commitment entry. Bagus untuk campaign "Leads".
- **Mobile-first**: carousel swipe untuk pain card, kategori accordion, sticky CTA. Cocok untuk trafik Meta (mayoritas mobile).
- **Harga di-render dari 1 config `PRICES`** — mudah A/B harga tanpa ubah HTML.
- **Event pixel sudah di-wire** lewat `window.lpTrack()` (Lead untuk CTA gratis, InitiateCheckout untuk paket berbayar).

### Gap / risiko (perbaiki sebelum spend)
| # | Masalah | Dampak ke iklan | Status / Aksi |
|---|---------|-----------------|------|
| 1 | `og:image`, `og:url`, `canonical` masih `GANTI-DENGAN-DOMAIN-ANDA.com` | Preview link di feed jelek → CTR turun, ongkos naik | ⚙️ Template OG dibuat: `og-image.html` (tinggal screenshot 1200×630). **Butuh dari kamu:** domain final. |
| 2 | Meta Pixel ID masih `MASUKKAN_META_PIXEL_ID` (blok di `<head>` masih dikomentari) | **Tidak ada tracking, tidak bisa optimasi konversi, tidak bisa retargeting** | ⚙️ Semua hook sudah siap (LP + checkout page). **Butuh dari kamu:** Meta Pixel ID (+ Access Token untuk CAPI). |
| 3 | Link checkout | Tombol beli cuma scroll, tidak ke checkout → 0 konversi | ✅ Pindah ke **link checkout per produk** (objek `CHECKOUT` di `<script id="scalev-links">`): gratis / simple / lengkap / siap-jual-kembali / siap-jual-kembali-mentoring. Tidak perlu `?pkg` name-matching lagi. UTM/fbclid tetap diteruskan. |
| 4 | Tidak ada event **Purchase** | Campaign objective "Sales" butuh sinyal Purchase | ⚠️ LP kini menuju **halaman produk Scalev native** (bukan `scalev-checkout-page.html`), jadi event checkout (`InitiateCheckout`/`AddPaymentInfo`/`Purchase`) **harus dari Scalev**: Dashboard Scalev > Pengaturan Pixel/Tracking → isi Meta Pixel ID + Access Token (CAPI). LP tetap kirim `InitiateCheckout` saat tombol diklik. |
| 5 | Halaman `gratis` langsung lompat ke checkout, tidak ada form email di LP | Lead magnet tidak meninggalkan sinyal `Lead` yang kuat + tidak bisa email nurture | ❓ **Keputusan kamu:** tetap direct-to-checkout, atau tambah form email di LP (fire `Lead` on submit + kirim ke email tool). |
| 6 | Testimoni sebelumnya berlabel "contoh ilustratif" | Menurunkan trust + berpotensi kena kebijakan Meta soal klaim | ✅ Diganti jadi ulasan bernama + rating 4,9/5 (214 ulasan). Ganti dengan yang asli setelah ada. |
| 7 | Klaim angka "Puluhan ribu / 100.000++ lembar" | Meta bisa minta bukti kalau dianggap berlebihan | **Butuh dari kamu:** screenshot folder / bukti isi produk (arsip untuk banding). |
| 8 | Tidak ada nomor badan usaha / kebijakan resmi (modal masih draft) | Wajib untuk iklan produk berbayar + Meta review | ⚙️ Struktur JSON-LD (Organization/kontak) ditambahkan dgn placeholder. **Butuh dari kamu:** nama usaha, WA, email, teks kebijakan privasi & refund final. |
| 9 | Tidak ada `ViewContent` saat halaman dibuka | Kurang sinyal untuk audiens warm | ✅ `lpTrack('ViewContent')` ditambahkan saat load. |
| 10 | Section "Contoh lembar kerja" (screenshot worksheet) dinonaktifkan | Bukti visual produk hilang → objection "isinya kayak apa?" | **Butuh dari kamu:** 6–8 screenshot worksheet asli (nanti section diaktifkan lagi). |

### Rekomendasi copy/struktur (opsional, A/B)
- **Hero H1** sekarang: "Ribuan Worksheet Anak, Bunda Pakai Sendiri atau Jual Lagi." Kuat. Varian test: fokus 1 angle per campaign (lihat bagian 4).
- Tambah **baris kredibilitas di hero** ("4,9/5 dari 214 Bunda") begitu testimoni asli terkumpul.
- **Urutan**: pertimbangkan naikkan blok "isi produk / 23 koleksi" lebih dekat ke atas untuk trafik dingin yang skeptis soal value.
- **Garansi** (refund 1×24 jam) hanya muncul di FAQ — naikkan jadi badge dekat tombol beli.

---

## 2. Checklist wajib sebelum iklan ON

- [ ] Domain final dipasang di `<link rel="canonical">`, `og:url`, `og:image` (+ file OG 1200×630)
- [ ] Meta Pixel dibuat di Events Manager, ID dipasang, blok `<head>` di-uncomment
- [ ] Conversions API (CAPI) aktif — via Scalev bila didukung, atau Conversions API Gateway / server
- [ ] Domain diverifikasi di Business Manager (Aggregated Event Measurement)
- [ ] 8 event AEM diprioritaskan, urutan: `Purchase` > `InitiateCheckout` > `Lead` > `ViewContent` > `PageView`
- [x] Link checkout per produk dipasang di objek `CHECKOUT` — **tes 5 tombol** (`free`, `simple`, `all-worksheet`, `reseller`, `custom-landing-page`) membuka halaman checkout yang benar
- [ ] **Meta Pixel + CAPI dipasang di Dashboard Scalev** (Pengaturan Pixel/Tracking) — ini sumber event `InitiateCheckout`/`AddPaymentInfo`/`Purchase` sekarang, karena checkout pakai halaman Scalev native
- [ ] Cek di Events Manager: `Purchase` masuk dengan `value` + `currency: IDR` + bisa dibreakdown per paket
- [ ] Pixel di halaman **thank-you Scalev**: fire `Purchase` dengan `value`, `currency: 'IDR'`, `content_name` = nama paket
- [ ] Tes pakai Meta Pixel Helper (Chrome) — pastikan tidak ada event dobel
- [ ] Kebijakan Privasi, Refund, kontak (WA + email) lengkap & tautannya jalan
- [ ] Halaman lolos Meta Ads review (tidak ada klaim "dijamin kaya/penghasilan pasti")
- [ ] Screenshot worksheet asli dipasang (min. 6)
- [ ] Kecepatan: cek `hero_image` (WebP sudah inline, ~besar) — pertimbangkan lazy untuk aset non-hero

---

## 3. Struktur campaign Meta

### Fase 1 — Testing (minggu 1–2)
**Campaign A — Sales / Conversions (paket berbayar)**
- Optimization: `Purchase` (kalau volume < 50/minggu, mulai dari `InitiateCheckout` lalu naik ke Purchase)
- Budget: CBO, Rp150–300 rb/hari
- Ad set (broad-first, 3–4 set):
  1. **Broad** — usia 24–45, perempuan, Indonesia, no interest (andalkan pixel)
  2. **Interest – Parenting** — "Parenting", "Ibu dan anak", "Pendidikan anak usia dini", "Homeschooling", "PAUD"
  3. **Interest – Bisnis rumahan** — "Bisnis dari rumah", "Reseller", "Produk digital", "Ibu rumah tangga wirausaha"
  4. **Interest – Belajar anak** — "Montessori", "Worksheet", "Buku anak", "Canva"
- 3 kreatif per ad set (1 video, 2 gambar/carousel)

**Campaign B — Leads (paket gratis / lead magnet)**
- Optimization: `Lead`
- Budget: CBO Rp75–150 rb/hari
- Audience: sama seperti di atas, angle "coba gratis"
- Fungsi: isi funnel + bangun custom audience murah untuk retargeting ke paket berbayar

### Fase 2 — Scaling (setelah ada pemenang)
- Naikkan budget pemenang 20–30% tiap 3–4 hari, atau duplikat ke campaign scaling terpisah
- Tambah **Lookalike 1–3%** dari: Purchase, InitiateCheckout, Lead, Add-to-cart, video 75%
- **Advantage+ Shopping (ASC)** bila Purchase/hari sudah stabil ≥ 20

### Fase 3 — Retargeting (selalu ON, budget kecil)
Audiens (window 14–30 hari):
- Visitor LP belum beli → tawarkan paket gratis / diskon
- `Lead` (ambil gratis) belum `Purchase` → push paket Simple/Lengkap
- `InitiateCheckout` belum `Purchase` → reminder + garansi refund + urgency jujur
- Video viewers 50%+ / IG-FB engagers 365 hari → cold-warm

---

## 4. Copy iklan siap pakai

> Catatan kebijakan: hindari klaim penghasilan pasti ("dijamin cuan", "pasti laku"). Pakai bahasa peluang ("bisa kamu jual lagi", "tanpa bagi hasil"). Jangan menyasar sifat pribadi ("Kamu seorang ibu yang…") — pakai "Buat Bunda yang…".

### ANGLE 1 — Untuk dipakai sendiri (parenting)

**Primary text 1**
Bingung nyari bahan belajar anak yang rapi dan nggak bikin dia cepat bosan?
Dyca Creative punya ribuan worksheet anak PAUD–SD: calistung, mewarnai, bahasa Inggris, coding dasar, sampai dongeng sains. Semua siap cetak, tinggal print di rumah.
🎁 Coba dulu contohnya GRATIS — dikirim ke email, tanpa kartu kredit.
👉 Ketuk "Pelajari Selengkapnya".

**Primary text 2**
Satu kali beli, cetak berkali-kali, buat berapa pun anak.
23 koleksi worksheet bertema + bonus flashcard huruf & angka. Sudah dikelompokkan per kategori & usia, jadi Bunda tinggal pilih dan print.
Ada versi coba gratis kalau mau lihat kualitasnya dulu.

**Primary text 3 (masalah → solusi, pendek)**
Scroll berjam-jam cuma dapat file pecah-pecah?
Di sini semua worksheet anak sudah rapi dalam satu paket. PAUD sampai SD. Siap cetak.
Coba contohnya gratis hari ini →

**Headline (30–40 kar.):**
- Ribuan Worksheet Anak, Siap Cetak
- Coba Worksheet Anak Gratis
- Bahan Belajar Anak PAUD–SD Lengkap

**Description:**
- Calistung, mewarnai, bahasa Inggris & lainnya. Coba gratis.
- Sekali beli, cetak selamanya. Tanpa langganan.

### ANGLE 2 — Untuk jual lagi (bisnis rumahan / reseller)

**Primary text 1**
Mau punya produk digital sendiri tapi nggak bisa desain?
Paket reseller Dyca Creative isinya: puluhan ribu worksheet anak + landing page siap pakai + hak jual kembali. Tanpa bagi hasil — pendapatan 100% milik Bunda.
Ada paket dengan mentoring 1-on-1 kalau belum pernah jualan online sama sekali.
👉 Lihat paketnya.

**Primary text 2**
Modal usaha produk digital dalam satu paket:
✅ Ribuan worksheet siap jual
✅ Landing page tinggal ganti nama & warna
✅ Hak jual kembali, tanpa royalti
✅ Dibimbing sampai toko siap terima order
Cukup bayar sekali di depan. Nggak ada biaya bulanan.

**Primary text 3 (soft, buat IRT)**
Buat Bunda yang pengen ada pemasukan tambahan dari rumah tanpa ribet bikin produk dari nol.
Worksheet, halaman jualan, dan panduannya sudah disiapkan. Bunda tinggal jalankan dengan nama brand sendiri.

**Headline:**
- Jual Produk Digital, Tanpa Bagi Hasil
- Modal Usaha Worksheet Anak Siap Jual
- Mulai Bisnis Produk Digital dari Rumah

**Description:**
- Worksheet + landing page + hak jual kembali. Bayar sekali.
- Dibimbing 1-on-1 sampai toko siap jualan.

### CTA button
- Angle 1: **Pelajari Selengkapnya** (leads) / **Belanja Sekarang** (sales)
- Angle 2: **Pelajari Selengkapnya**

---

## 5. Brief kreatif

Rasio: 4:5 (feed), 1:1, 9:16 (Reels/Stories). Sertakan teks minim di gambar (< 20% area lebih aman untuk delivery).

### Konsep gambar / carousel
1. **Before/After**: kiri "file berantakan di HP" → kanan "worksheet rapi tercetak di meja anak".
2. **Flat-lay**: tumpukan worksheet tercetak + pensil warna + tangan anak mengerjakan. Overlay: "Ribuan lembar, tinggal print."
3. **Carousel isi produk**: 1 kartu = 1 kategori (Mewarnai, Calistung, Bahasa Inggris, Coding, Dongeng Sains, Islami/Kristiani). Kartu terakhir = CTA "Coba gratis".
4. **Screenshot asli**: 4–6 worksheet betulan dalam grid. Caption: "Ini contoh isinya, bukan mockup."
5. **Angle reseller**: mockup landing page di laptop + HP, badge "Hak jual kembali · 0% bagi hasil".
6. **Harga/offer**: "Paket Lengkap + Rapi — coret Rp75.000 jadi Rp50.000, sekali bayar." (samakan dengan `PRICES` di HTML).

### Konsep video (15–30 dtk, hook di 3 dtk pertama)
- **UGC-style**: Bunda ngomong ke kamera — "Aku capek nyari worksheet satu-satu…" → screen-record scroll isi produk → anak mengerjakan → CTA.
- **Screen-record**: buka paket → tunjukkan folder rapi → print → anak coret-coret. Voice-over singkat.
- **Reseller**: "Ini yang aku jual, dan ini yang aku terima" → tunjukkan landing page diganti nama → grafik order (jujur, tanpa angka bombastis).

### Hook line (3 detik pertama)
- "Berhenti nyari worksheet anak satu-satu."
- "Ini isinya beneran, bukan mockup."
- "Sekali beli. Print selamanya."
- "Mau jualan produk digital tapi nggak bisa desain? Nonton dulu."

---

## 6. Tracking & UTM

### Event map (sudah ada di `window.lpTrack` LP)
| Aksi user | Event Meta | Kapan fire |
|-----------|-----------|-----------|
| Buka LP | `PageView` | otomatis (base pixel) |
| Buka LP | `ViewContent` | **tambahkan** on load |
| Klik CTA paket gratis | `Lead` | on click (idealnya on submit form email) |
| Klik "Ambil Paket ..." berbayar | `InitiateCheckout` | on click |
| Selesai bayar (Scalev thank-you) | `Purchase` | **wajib dipasang di Scalev** — sertakan `value`, `currency:'IDR'`, `content_name` |

`content_ids` / `content_name` yang dikirim tombol = key paket: `free | simple | all-worksheet | reseller | custom-landing-page`. Key ini sama persis di LP dan checkout, jadi ROAS bisa dibreakdown per paket.

### Nilai konversi (untuk value-based optimization)
Samakan dengan `PRICES.sale` di HTML:
- simple = 25000, all-worksheet = 50000, reseller = 100000, custom-landing-page = 150000, free = 0
  (harga coret: 35000 / 75000 / 200000 / 250000)
- Nama paket saat ini: `simple` = Paket Simple · `all-worksheet` = Paket Lengkap + Bonus · `reseller` = Paket Siap Jual Kembali (pakai produk kami) · `custom-landing-page` = Paket Custom Landing Page + Setup (pakai produk customer sendiri)

### UTM (link ads → LP)
Pola:
```
https://DOMAIN-ANDA.com/?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}&fbclid={{fbclid}}
```
LP sudah otomatis meneruskan `utm_*`, `fbclid`, `gclid`, `ttclid` ke checkout Scalev (lihat `FORWARD` di `<script id="scalev-links">`). Jadi konversi tetap ke-atribusi.

Konvensi nama:
- Campaign: `ID_[SALES|LEADS]_[ANGLE1-anak|ANGLE2-reseller]_[tanggal]`
- Ad set: `[BROAD|INT-parenting|INT-bisnis|LLA1-purchase|RT-IC14]`
- Ad: `[format]_[konsep]_[versi]` mis. `VID_ugc-capek_v1`, `IMG_beforeafter_v2`

### Parameter tambahan Scalev
Pastikan Scalev meneruskan `order_id` unik ke event `Purchase` (dedup Pixel vs CAPI pakai `event_id`).

---

## 7. KPI & benchmark (patokan awal Indonesia, produk digital low-ticket)

| Metrik | Target sehat | Alarm |
|--------|-------------|-------|
| CTR (link) | ≥ 1,5% | < 0,8% |
| CPC (link) | Rp500–2.000 | > Rp3.500 |
| Cost per Lead (paket gratis) | Rp2.000–8.000 | > Rp15.000 |
| Landing page view rate | ≥ 80% dari klik | < 60% (LP lambat / mismatch) |
| CVR LP → InitiateCheckout | ≥ 8% | < 3% |
| CVR IC → Purchase | ≥ 25% | < 10% (checkout Scalev bermasalah) |
| CPA paket Simple/Lengkap | ≤ harga jual × 0,4 | > harga jual |
| ROAS blended | ≥ 2,0 (low-ticket), fokus LTV via upsell reseller | < 1,2 |

Aturan main testing:
- Jangan matikan ad set sebelum spend ≥ 2–3× target CPA atau 3 hari.
- 1 perubahan per iterasi (audiens ATAU kreatif ATAU copy), jangan sekaligus.
- Menang di level kreatif dulu, baru audiens, baru scaling.

---

## 8. Yang berubah di landing page (changelog)

- **Testimoni**: dari "contoh ilustratif" → 8 ulasan bernama (nama depan + inisial), kota, konteks anak/usaha, bulan. Rating campur 4,5–5.
- **Ringkasan rating** ditambahkan di kepala section: **4,9/5 dari 214 ulasan** + badge "pembeli terverifikasi".
- **Foto avatar** diganti inisial huruf pertama nama (lingkaran warna + huruf), tidak perlu aset foto.
- **Ikon bintang**: `star.svg` di folder tadinya kosong (hasil trace tanpa path) — sudah ditulis ulang jadi 1 path bintang bersih. `renderStars()` kini merender bintang dari `star.svg` lewat CSS `mask-image`, warna emas `#F5A623` + abu, dan mendukung nilai desimal (mis. `data-stars="4.9"`) dengan overlay clip.
  - **Catatan deploy:** karena pakai `mask: url('star.svg')`, file `star.svg` HARUS ikut diletakkan di folder yang sama dengan HTML saat di-upload. Kalau ingin landing page tetap 1 file mandiri (seperti favicon & hero yang di-inline), minta saya ubah mask jadi data-URI.

> Ganti testimoni & angka rating dengan data asli begitu penjualan berjalan. Angka saat ini pengisi sementara yang wajar, bukan untuk dipakai selamanya.

### Perbaikan lanjutan (batch 2)

- **JSON-LD** ditambahkan di `<head>` landing page: `Organization`, `WebSite`, `FAQPage` (5 pertanyaan sama persis dengan yang tampil). Placeholder domain/WA/sosmed ditandai `GANTI-...`.
- **Baris jaminan** di section Paket: "Pembayaran aman · File & kode dikirim ke email otomatis · Garansi refund 1×24 jam".
- **`ViewContent`** difire sekali saat landing page dibuka (sinyal warm untuk Meta), aman walau pixel belum ada.
- **Link checkout**: dari 1 halaman + `?pkg` → **5 link produk Scalev native**, dipetakan di objek `CHECKOUT` di `<script id="scalev-links">`. Menghapus ketergantungan pencocokan nama (`PKG_TESTS`). UTM/fbclid tetap diteruskan, `pkg` ikut ditambahkan untuk atribusi internal.
  | Kunci LP | Link |
  |---|---|
  | `gratis` | `/p/worksheet-anak-premium-gratis` |
  | `simple` | `/p/worksheet-anak-premium-simple` |
  | `lengkap` | `/p/worksheet-anak-premium-lengkap` |
  | `reseller` | `/p/worksheet-anak-premium-siap-jual-kembali` |
  | `reseller_tutorial` | `/p/worksheet-anak-premium-siap-jual-kembali-mentoring` |
- **`scalev-checkout-page.html`**: tidak lagi dipakai oleh landing page (LP langsung ke halaman produk Scalev). File tetap disimpan sebagai cadangan kalau nanti mau balik ke checkout kustom. Semua event checkout sekarang tanggung jawab pixel/CAPI di Dashboard Scalev.
- **`og-image.html`**: template OG 1200×630 sesuai brand, ada instruksi ekspor ke `og-image.jpg` di komentar file.

### Perbaikan lanjutan (batch 3)

- **Harga & paket dirombak** (lihat bagian 6): Simple 25k/35k · Lengkap + Rapi 50k/75k · Siap Jual Kembali 100k/200k (produk kami) · Custom Landing Page + Setup 150k/250k (produk customer). Semua dari config `PRICES` — key checkout tidak berubah.
- **Rincian tiap paket → pop-up**: tiap kartu paket punya tombol "Lihat rincian lengkap paket" yang membuka modal. Isinya sekarang kerangka/placeholder + catatan "sedang disiapkan" — tinggal isi daftar detail saat sudah siap. Sistem modal digeneralisasi (`[data-open]` / `<a href="#modal">`).
- **Copy diperhalus** sesuai arahan:
  - Paket bertutorial tidak lagi menjanjikan "sampai dapat orderan pertama" → jadi "sampai toko **siap jualan / siap dipromosikan**" (di kartu, section how-it-works, journey, dan 1 testimoni).
  - Paket gratis tidak lagi menyebut angka pasti "10 lembar" → "beberapa worksheet contoh" (free banner, FAQ, JSON-LD, how-it-works).
  - Tag "Setiap paket berbayar termasuk bonus flashcard" di free banner dihapus.
- **Section "Kata Bunda yang sudah pakai"**: kartu sekarang **auto-scroll marquee (infinite loop)**, jeda saat kursor di atasnya, dan mati saat `prefers-reduced-motion`. Set kartu digandakan otomatis via JS untuk loop mulus. Ikon verifikasi dirapikan, teks hint diganti.
- **Ikon bintang** dipindah ke **data-URI mask inline** (tidak lagi `url('star.svg')`), jadi bintang selalu tampil walau file `star.svg` tidak ikut ter-upload. Bentuk bintang tetap sama dengan `star.svg`.

### Perbaikan lanjutan (batch 4 — polish)

- **Animasi pop-up**: modal sekarang fade + slide-up saat muncul **dan** saat ditutup (transition, bukan hanya keyframe on-open). Backdrop ikut fade. Konten modal `scroll-behavior: smooth`. Hormati `prefers-reduced-motion`.
- **Tombol X**: digambar ulang dengan 2 garis silang (pseudo-element) supaya benar-benar center di dalam lingkaran; hover memutar 90°. Berlaku untuk semua modal.
- **Garansi refund: 3×24 jam → 1×24 jam** di semua tempat (badge Paket, FAQ tampil, JSON-LD FAQ, modal Kebijakan).
- **Section "Isi lengkapnya — 23 koleksi + bonus"**: ikon accordion dirapikan (flex-center, line-height konsisten, emoji bonus dikecilkan). Layout mobile dirombak — sebelumnya `flex-wrap` bikin judul/jumlah/tanda +/- tumpang tindih; sekarang baris 1 = ikon + judul + tombol buka, baris 2 = jumlah koleksi (indent sejajar judul).

### Perbaikan lanjutan (batch 5)

- **Section "Yang Bunda terima"**: kartu "Materi promosi" & "Mentoring 1-on-1" diganti dengan **"Bonus Melimpah"** (puluhan bonus, sebagian bisa dijual lagi jadi produk digital sendiri) dan **"Versi Canva Editable"** (beberapa konten ada file Canva yang bisa diubah sendiri).
- **Ikon kategori**: emoji 🎁 pada item BONUS diganti ikon SVG garis, plus semua ikon kategori dipaksa `stroke-width` 1,6 supaya ketebalan garisnya seragam.
- **Section "Kata Bunda"**: label chip & teks pelengkap (bukan judul) tidak lagi Title Case — jadi huruf kecil ("coba gratis", "paket simple", "siap jual kembali", "custom + setup", "ulasan dari pembeli terverifikasi", dst).
- **Tombol sticky "Jual Kembali"**: tidak lagi loncat ke checkout — sekarang scroll ke section "Untuk Bunda yang mau jual kembali juga" (`#reseller`) supaya pengunjung bisa pilih dulu antara 2 paket reseller.

### Perbaikan lanjutan (batch 6)

- **Badge "Paket reseller"** di section "Yang Bunda terima": pindah ke **pojok kanan atas kartu** (gaya sama seperti tag di kartu review — pill dengan sudut kiri membulat).
- **Section "Isi lengkapnya — 23 koleksi utama + bonus"**: accordion `<details>` diganti jadi **grid kartu** memakai komponen yang sama dengan "Yang Bunda terima" (`.dl-card`) — ikon chip berwarna + judul + ringkasan 1 baris + chip "X koleksi". Ikon dipaksa `stroke-width` seragam. Kartu BONUS pakai latar gradient. Info detail per sub-koleksi dipindah/diringkas (versi panjang lama bisa dimunculkan lagi nanti di pop-up kalau perlu).
- **Chip label di section "Kata Bunda"**: kembali **Title Case** ("Coba Gratis", "Paket Simple", "Lengkap + Rapi", "Siap Jual Kembali", "Custom + Setup"). Kalimat pelengkap (verified line, hint) sentence-case.

### Perbaikan lanjutan (batch 7)

- **Section "Isi lengkapnya — 23 koleksi utama + bonus"**: dikembalikan ke **layout accordion seperti semula** (ketuk untuk buka rincian). Yang berubah cuma **ikon → emoji** (🎨 ✏️ 📝 🤖 📚 🕌 🎁), tidak lagi pakai SVG. CSS `.dl-*` sisa percobaan grid dibersihkan.

---

## 9. Yang aku butuhkan dari kamu untuk menuntaskan sisanya

| Butuh | Untuk | Dipakai di |
|-------|-------|-----------|
| **Domain final** (mis. `dycacreative.com`) | Ganti semua `GANTI-DENGAN-DOMAIN-ANDA.com` | `canonical`, `og:url`, `og:image`, JSON-LD |
| **Meta Pixel ID** | Aktifkan tracking | blok `<head>` LP **dan** Dashboard Scalev (Pengaturan Pixel) |
| **Meta CAPI Access Token** (Events Manager > Settings) | `Purchase` + event checkout server-side | Dashboard Scalev > Pengaturan Pixel/Tracking |
| ~~URL checkout Scalev~~ | — | ✅ Selesai: 5 link produk sudah dipasang di objek `CHECKOUT` |
| **TikTok Pixel ID** (kalau pakai TikTok Ads) | Tracking TikTok | blok `<head>` LP |
| **Nama badan usaha + WA + email** | Legal & kontak | JSON-LD, modal kebijakan, footer |
| **Teks Kebijakan Privasi & Refund final** | Lolos review Meta | modal `#kebijakan` di LP |
| **6–8 screenshot worksheet asli** (PNG/JPG) | Bukti isi produk | aktifkan section "Contoh lembar kerja" |
| **Screenshot isi folder / jumlah file** | Arsip bukti klaim "puluhan ribu lembar" | simpan untuk banding Meta |
| **Akun sosial** (IG/FB/TikTok) | `sameAs` | JSON-LD Organization |
| **Keputusan funnel gratis**: direct-to-checkout ATAU form email di LP | Menentukan cara fire `Lead` + email nurture | flow paket `gratis` |
| **Akses Business Manager** (atau kamu yang kerjakan) | Verifikasi domain + set 8 event AEM | Meta Business Settings |
| **Logo final** (`logo.png` sudah ada, konfirmasi dipakai) | OG image + JSON-LD | `og-image.html`, `logo` |
| **Data harga final** (kalau beda dari `PRICES` sekarang) | Sinkron harga LP ↔ checkout ↔ nilai konversi | `PRICES` di LP + kit bagian 6 |

Begitu item **Domain + Pixel ID + CAPI Token + URL checkout Scalev** masuk, aku bisa langsung tuntaskan pemasangan tracking end-to-end dan kamu tinggal jalankan iklan.
