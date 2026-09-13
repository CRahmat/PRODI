# Panduan Deploy — Dyca Creative (Worksheet Anak)

Dokumen ini menggantikan komentar instruksi yang sebelumnya ada di dalam kode.
Semua file HTML/JS sekarang bersih dari komentar dan siap dipasang.

Domain produksi: `https://dyca-creative.myscalev.com`

---

## 1. Ringkasan file

| File | Fungsi | Dipasang di |
|---|---|---|
| `dyca-creative-landing-page.html` | Landing page utama | Scalev → Pages → **HTML Sales Page** di root domain (`/`) |
| `scalev-checkout-page.html` | Halaman checkout kustom | Scalev → Pages → **HTML Checkout Page** (path `/checkout-worksheet`) |
| `scalev-thank-you-page.html` | Halaman terima kasih (post-payment) | Scalev → Pages → **HTML Sales Page** (path `/terima-kasih`) |
| `og-image.html` | Template gambar preview link 1200×630 | Tidak di-deploy — dipakai untuk membuat `og-image.jpg` (lihat bagian 5) |
| `tanya-produk-worker.js` | Proxy form "Tanya Produk" → email (Resend) | Cloudflare Worker (lihat bagian 6) |
| `favicon_io/` | Favicon & webmanifest | Upload ke root domain bila ingin dipakai (opsional; LP sudah inline favicon) |

> `dyca-creative-landing-page - Copy.html` adalah backup lama. **Jangan di-upload.**

---

## 2. Meta Pixel & tracking (Meta Ads)

Pixel **tidak lagi ditanam manual** di file HTML. Sumber pixel = **Dashboard Scalev → Pengaturan Pixel/Tracking** (Meta Pixel ID + Access Token untuk CAPI). Scalev menyuntik `fbq` ke semua halaman `myscalev.com` dan mengirim event server-side.

Alur event:

| Aksi | Event | Sumber | Parameter |
|---|---|---|---|
| Buka landing page | `PageView` | Pixel global Scalev | — |
| Landing page selesai load | `ViewContent` | `lpTrack()` di LP | `content_name`, `content_type` |
| Klik CTA paket gratis | `Lead` | `lpTrack()` di LP | `content_ids` = key paket |
| Klik "Ambil paket …" berbayar | `InitiateCheckout` | `lpTrack()` di LP + `coTrack()` di checkout | `value`, `currency:IDR`, `content_ids`, `contents`, `num_items` |
| Buka halaman checkout | `ViewContent` + `InitiateCheckout` | `coTrack()` di checkout (sekali, saat produk termuat; `InitiateCheckout` pakai ulang `eventID` dari klik CTA di LP bila umur < 30 mnt) | idem |
| Ganti / konfirmasi metode bayar | `AddPaymentInfo` | `coTrack()` di checkout (**sekali**, tidak per klik) | `value`, `currency:IDR`, `content_ids` |
| Pembayaran berhasil | `Purchase` (+ `value`, `currency:IDR`, `content_ids`, `order_id` sbg `eventID`) | **CAPI Scalev** + browser di thank-you page (dedup via `eventID`) | lihat §2 "Purchase di halaman terima kasih" |

- `content_ids` konsisten LP ↔ checkout: `free` / `simple` / `all-worksheet` / `reseller` / `custom-landing-page` — jadi ROAS bisa dibreakdown per paket.
- Setiap event `coTrack()` mengirim `eventID` yang sama ke Pixel (browser) **dan** ke `Scalev.analytics.track('facebook')` (server/CAPI) → dedup otomatis.

**`lpTrack()` di landing page (dioptimalkan untuk akurasi):**
- Setiap event dapat `eventID` unik dan dikirim **dua jalur** — `fbq('track', …, {eventID})` (browser) + `Scalev.analytics.track('facebook', …)` (CAPI, kalau objek `Scalev.analytics` tersedia di halaman) → dedup otomatis, tahan ad-blocker / ITP. Kalau `Scalev.analytics` tidak ada di HTML Sales Page, otomatis fallback ke browser-only (perilaku lama, tanpa error).
- **Antrian tunggu pixel**: kalau `fbq` belum disuntik Scalev saat event dipanggil, event di-buffer dan di-flush begitu `fbq` siap (retry 200 ms, batas 12 dtk) — `ViewContent` tidak lagi hilang karena race saat load.
- **Dedup di dalam halaman**: `ViewContent` sekali per load; `Lead` / `InitiateCheckout` sekali per (event + paket) per 1,5 dtk — klik pada beberapa tombol CTA identik tidak menggandakan event.
- **Dedup LP → checkout**: `lpTrack('InitiateCheckout'|'Lead')` menyimpan `eventID` + paket ke `localStorage.sv_lp_intent`. Checkout page membaca `sv_lp_intent` (kalau umur < 30 mnt) dan memakai `eventID` yang sama untuk `InitiateCheckout` pertamanya → 1 klik CTA + buka checkout = **1** `InitiateCheckout` di Events Manager, bukan 2.
- **Match quality**: `external_id` stabil per-browser (`localStorage.sv_ext_id`) ikut di setiap payload CAPI. Event `Contact` (form "Tanya Produk") mengirim `firstName` + `email` + `phone` ke CAPI untuk Advanced Matching. Field form sudah `type="email"` / `type="tel"` / `autocomplete` yang benar → Automatic Advanced Matching Scalev/Meta juga bisa menangkapnya.

Checklist sebelum iklan ON:
- [ ] Meta Pixel ID + Access Token (CAPI) diisi di Dashboard Scalev.
- [ ] Domain diverifikasi di Meta Business Manager.
- [ ] 8 event AEM diprioritaskan: `Purchase` > `InitiateCheckout` > `AddPaymentInfo` > `Lead` > `ViewContent`.
- [ ] Tes dengan **Meta Pixel Helper** — pastikan tidak ada event dobel (terutama `PageView` & `Purchase`), dan `InitiateCheckout` bawa `value` + `currency`.
- [ ] Klik CTA berbayar di LP → lanjut ke checkout: di Events Manager harus muncul **1** `InitiateCheckout` (bukan 2) — cek kolom "Event ID" sama antara baris Browser & Server.
- [ ] Test Events (Events Manager → Test events) saat buka LP: `ViewContent` muncul **sekali**, ada baris Browser **dan** Server dengan Event ID sama. Kalau hanya Browser → `Scalev.analytics` tidak tersedia di HTML Sales Page (fallback aman, tapi CAPI LP mati).
- [ ] Submit form "Tanya Produk" → `Contact` muncul dengan Advanced Matching terisi (email/phone/nama ter-hash).
- [ ] `Purchase` di Events Manager membawa `value` + `currency: IDR` dan bisa dibreakdown per paket.

TikTok Pixel: **tidak dipakai.** Semua kode TikTok/`ttq` sudah dihapus.

### Purchase di halaman terima kasih (aktif)
`scalev-thank-you-page.html` **fire `Purchase` sisi browser** (flag `FIRE_PURCHASE = true` di `<script>`):
`fbq('track','Purchase', {value, currency:'IDR', content_ids:[<key paket>], contents, num_items}, {eventID: <order_id>})`.
- Anti-dobel per order lewat `localStorage` (`ty_purchase_<order_id>`) — refresh halaman tidak fire ulang.
- `order_id` dibaca dari `?order_id=` atau `localStorage.co_lastOrder`. Kalau kosong, event tetap fire tanpa `eventID` (dedup CAPI tidak jalan — usahakan `order_id` selalu ada).
- **Wajib dicek**: di Events Manager pastikan Purchase browser + Purchase CAPI Scalev **ter-dedup** (1 order = 1 Purchase). Kalau Pixel Helper / Events Manager menunjukkan dobel, set `FIRE_PURCHASE = false` dan andalkan CAPI saja.
- Pastikan CAPI Scalev memakai **order id sebagai `event_id`** supaya cocok dengan `eventID` di sini.

---

## 3. Landing page

1. Scalev → Pages → Create → **HTML Sales Page**.
2. Tab **Code** → Import HTML → Paste HTML → tempel seluruh isi `dyca-creative-landing-page.html`.
3. Tab **Security** → tambahkan:
   - `style-src`: `fonts.googleapis.com`
   - `font-src`: `fonts.gstatic.com`
   - `connect-src` / `script-src`: `connect.facebook.net` (bila pixel Scalev belum mengizinkan)
4. Pasang di path root (`/`).
5. Publish.

Konfigurasi yang mungin perlu disesuaikan di dalam file:
- `PRICES` (blok `<script>` pertama) — harga tampil di kartu paket.
- `CHECKOUT_PAGE` (blok `<script id="scalev-links">`) — URL halaman checkout kustom.
- `ENDPOINT` (blok `<script id="tanya-produk-email">`) — isi dengan URL Cloudflare Worker (bagian 6). Sebelum diisi, form "Tanya Produk" menampilkan pesan "Form belum terhubung" dan tidak mengirim apa pun.
- `og:image` / `twitter:image` menunjuk ke `https://dyca-creative.myscalev.com/og-image.jpg` — file ini harus dibuat & di-upload (bagian 5).

Aset: hero image & favicon sudah di-inline (base64), jadi LP tetap 1 file mandiri.

---

## 4. Checkout page & thank-you page

**Checkout (`scalev-checkout-page.html`):**
1. Scalev → Pages → Create → **HTML Checkout Page**.
2. Tab **Context** → pilih Store, lalu ikat **kelima** produk/bundle (free, simple, all-worksheet, reseller, custom-landing-page) ke halaman ini.
3. Tab **Code** → Import HTML → Paste HTML.
4. Tab **Security** → `style-src: fonts.googleapis.com`, `font-src: fonts.gstatic.com`.
5. Publish di path `/checkout-worksheet` (samakan dengan `CHECKOUT_PAGE` di LP).

Kunci paket (dipakai untuk `?pkg=...`, `content_ids` Pixel, `PRICES`, `CHECKOUT`): `free` · `simple` · `all-worksheet` · `reseller` · `custom-landing-page`. Sama persis di LP dan checkout.

Pemilihan paket otomatis dari `?pkg=<kunci>`. Cocokkan **nama produk di Scalev** dengan `PKG_TESTS` di dalam file (yang dicek nama produknya, bukan kuncinya):
- `free` → nama mengandung "Kenalan" / "Gratis" / "Free"
- `simple` → "Simple" / "Sederhana"
- `all-worksheet` → "Lengkap" / "Komplet" / "Complete" / "All Worksheet"
- `reseller` → "Jual Kembali" / "Reseller" **tanpa** kata tutorial/mentoring/custom/setup
- `custom-landing-page` → "Tutorial" / "Mentoring" / "Custom Landing" / "Setup"

Harga & metode pembayaran dibaca otomatis dari toko (tidak di-hardcode).

Isi `SUPPORT_WA` (var di atas blok `<script>` utama) dengan nomor WhatsApp admin
format internasional tanpa `+` / spasi, mis. `6281234567890`. Kalau diisi, tombol
chat mengambang & link "Chat kami dulu" mengarah ke `wa.me`. Kalau dikosongkan,
keduanya jatuh ke `mailto:dyca.creative@gmail.com` (tetap berfungsi).

Section "Setelah pembayaran berhasil" (di atas tombol Bayar) menjelaskan alur ke
pelanggan: file dikirim ke email; khusus paket reseller/custom, admin menghubungi
lewat WhatsApp/email — dan nomor WhatsApp jadi wajib benar untuk paket itu
(label + catatan tambahan muncul otomatis saat paket reseller dipilih).

**Thank-you (`scalev-thank-you-page.html`):**
1. Scalev → Pages → Create → **HTML Sales Page** → tempel isi file → Publish di path `/terima-kasih`.
2. Tab **Security** sama seperti di atas.
3. Di setelan checkout → **After Checkout Success** → aktifkan "Arahkan ke URL khusus" → isi `https://dyca-creative.myscalev.com/terima-kasih`.

Personalisasi nama/nilai order dibaca berurutan: query string (`?name=&email=&total=&pkg=&order_id=`) → `localStorage.co_lastOrder` (hanya jika checkout & thank-you satu domain) → fallback "Bunda". Halaman ini `noindex`.

Tombol chat mengambang membuka pop-up berisi tombol **Email kami** (belum ada WhatsApp — `SUPPORT_EMAIL` di `<script>`). Kalau nanti punya nomor WA, tinggal tambahkan lagi tombolnya di modal.

Langkah ke-4 **"Siap jual kembali"** di daftar bernomor **selalu tampil** (soft note untuk semua pembeli). Blok detail **"🚀 Paket siap jual kembali"** muncul otomatis hanya kalau nama paket (`pkg`) mengandung kata kunci reseller/custom (jual kembali, reseller, tutorial, mentoring, custom landing, setup) — menjelaskan hak jual kembali tanpa bagi hasil + bahwa tim akan menghubungi via WhatsApp/email untuk serah-terima file & setup.

`Purchase` browser (flag `FIRE_PURCHASE`) — detail di **§2**.

---

## 5. Membuat `og-image.jpg` (1200×630)

Preview link Meta butuh gambar ini. Selama belum ada, preview link tampil tanpa gambar.

1. Buka `og-image.html` di Chrome.
2. DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M) → set 1200 × 630, zoom 100%.
3. Command menu (Ctrl+Shift+P) → "Capture screenshot" (bukan full size).
4. Kompres ke JPG < 300 KB (mis. squoosh.app).
5. Upload sebagai `/og-image.jpg` di root domain.

Alternatif: buat ulang di Figma/Canva dengan teks & warna yang sama.

---

## 6. Cloudflare Worker — form "Tanya Produk"

1. dash.cloudflare.com → Workers & Pages → Create → Create Worker → beri nama (mis. `tanya-produk`) → Deploy.
2. Edit code → hapus contoh → tempel seluruh isi `tanya-produk-worker.js` → Deploy.
3. Settings → Variables and Secrets:
   - `RESEND_API_KEY` (Secret) = API key baru dari Resend.
   - `TO_EMAIL` (Text) = email tujuan (email akun Resend).
   - `ALLOWED_ORIGIN` (Text) = `https://dyca-creative.myscalev.com`.
   - `FROM_EMAIL` (Text, opsional) = default `Tanya Produk <onboarding@resend.dev>`. Ganti hanya jika domain sudah diverifikasi di Resend.
4. Deploy ulang. Salin URL Worker (mis. `https://tanya-produk.NAMA-AKUN.workers.dev`).
5. Tempel URL itu ke `ENDPOINT` pada blok `<script id="tanya-produk-email">` di landing page, lalu publish ulang LP.

Catatan: dengan `FROM_EMAIL` default, Resend hanya mengizinkan kirim ke email akun sendiri — itu memang yang diinginkan (pertanyaan masuk ke admin).

---

## 7. Kontak & data yang masih perlu dilengkapi

- Teks final Kebijakan Privasi & Refund (modal `#kebijakan` di LP).
- Nama badan usaha + nomor WhatsApp (footer & JSON-LD `Organization`).
- Akun sosial (IG/FB) untuk `sameAs` di JSON-LD.
- 6–8 screenshot worksheet asli untuk mengaktifkan kembali section "Contoh lembar kerja".
- Testimoni asli (saat ini pengisi sementara — rating 4,9/5, 214 ulasan).
