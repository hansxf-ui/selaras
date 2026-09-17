# Selaras — vision board generator

Struktur awal project Next.js + Supabase. Panduan ini ditulis buat kamu yang kerja dari HP Android lewat browser (github.dev) dan deploy otomatis lewat Vercel.

## 1. Upload ke GitHub

1. Buat repo baru di GitHub (misalnya `selaras`).
2. Upload semua file di folder ini ke repo tersebut (lewat github.dev, atau upload manual lewat browser github.com — tombol "Add file" -> "Upload files").
3. **Jangan upload file `.env.local`** kalau kamu bikin nanti — itu tempat kunci rahasia, biar aman cukup ikuti langkah 3 di Vercel.

## 2. Setup Supabase

1. Buka project Supabase kamu.
2. Ke tab **SQL Editor** -> New query -> tempel isi file `supabase/schema.sql` -> jalankan (Run). Ini bikin tabel `boards` beserta aturan keamanannya.
3. Ke tab **Authentication -> Providers** -> pastikan **Email** aktif.
4. Ke tab **Storage** -> buat bucket baru namanya `board-images`, set jadi **public** (biar gambar bisa ditampilkan).
5. Ke tab **Settings -> API** -> catat dua nilai ini:
   - **Project URL**
   - **anon public key**

## 3. Deploy ke Vercel

1. Buka vercel.com, sign in pakai akun GitHub kamu.
2. **Add New -> Project** -> pilih repo `selaras`.
3. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL dari Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key dari Supabase
4. Klik **Deploy**. Setelah selesai, kamu dapat link website yang sudah live.
5. Tiap kali kamu commit perubahan baru ke GitHub, Vercel otomatis deploy ulang.

## 4. Struktur folder

```
app/
  page.js            -> halaman utama
  login/page.js       -> halaman masuk
  signup/page.js       -> halaman daftar
  dashboard/page.js    -> daftar board milik user
  layout.js
  globals.css
lib/
  supabaseClient.js    -> koneksi ke Supabase
supabase/
  schema.sql           -> struktur database
```

## 5. Yang belum ada (langkah selanjutnya)

- Halaman `/board/[id]` — editor board (drag, rotate, warna) seperti mockup yang sudah dibuat.
- Upload gambar ke Supabase Storage.
- Export board jadi gambar PNG.
- Integrasi pembayaran untuk fitur Premium.
