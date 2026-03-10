# Setup Google OAuth untuk Login/Register

## Langkah 1: Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada

## Langkah 2: Enable Google+ API

1. Di menu sidebar, pilih **APIs & Services** > **Library**
2. Cari "Google+ API" atau "Google Identity"
3. Klik **Enable**

## Langkah 3: Buat OAuth 2.0 Credentials

1. Di menu sidebar, pilih **APIs & Services** > **Credentials**
2. Klik **+ Create Credentials** > **OAuth client ID**
3. Jika diminta, buat **OAuth consent screen** dulu:
   - Pilih **External** untuk User Type
   - Isi form:
     - App name: `TadabburQuran`
     - User support email: email Anda
     - Developer contact: email Anda
   - Klik **Save and Continue** (skip langkah lain jika tidak wajib)

4. Setelah OAuth consent screen selesai, buat OAuth client ID:
   - Application type: **Web application**
   - Name: `TadabburQuran Web`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (untuk local)
     - `https://yourdomain.com/api/auth/callback/google` (untuk production)
   - Klik **Create**

## Langkah 4: Copy Credentials

Anda akan mendapatkan:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxx`

## Langkah 5: Update Environment Variables

Buka file `.env.local` dan update:

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

## Langkah 6: Generate NEXTAUTH_SECRET

Jalankan command ini di terminal:

```bash
openssl rand -base64 32
```

Copy hasilnya ke `.env.local`:

```env
NEXTAUTH_SECRET=hasil_openssl_di_atas
```

## Langkah 7: Restart Server

```bash
# Stop server lalu jalankan lagi
npm run dev
```

## Test Google OAuth

1. Buka http://localhost:3000/auth/login
2. Klik "Lanjutkan dengan Google"
3. Login dengan akun Google Anda
4. Setelah berhasil, Anda akan diarahkan ke dashboard

---

## Cek User di Database

Untuk melihat user yang sudah login:

```bash
# Masuk ke PostgreSQL
docker exec -it tadabburquran-postgres psql -U tadabburquran -d tadabburquran_db

# Lihat semua users
SELECT id, email, full_name, avatar_url, role, created_at FROM users;
```

---

## Troubleshooting

### Error: redirect_uri_mismatch
Pastikan Authorized redirect URI di Google Console sama dengan:
- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

### Error: Invalid Client
Pastikan `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` sudah benar di `.env.local`

### Session tidak tersimpan
Pastikan `NEXTAUTH_SECRET` sudah di-set dengan nilai yang unik
