# Setup PostgreSQL + Redis dengan Docker

## Cara Menggunakan

### 1. Install Docker Desktop
Download dan install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 2. Start Database dengan Docker

Buka terminal di folder project dan jalankan:

```bash
# Start semua services (PostgreSQL + Redis + pgAdmin)
docker-compose up -d

# Cek status
docker-compose ps

# Lihat logs
docker-compose logs -f postgres
```

### 3. Stop Database

```bash
# Stop semua services
docker-compose down

# Stop dan hapus semua data (reset)
docker-compose down -v
```

---

## Akses Database

### PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **User:** tadabburquran
- **Password:** tadabburquran123
- **Database:** tadabburquran_db

### pgAdmin (GUI)
Buka browser: http://localhost:5050
- Email: admin@tadabburquran.id
- Password: admin123

### Redis
- **Host:** localhost
- **Port:** 6379

---

## Setup Environment

Copy file `.env.example` ke `.env`:

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

---

## Koneksi dari Code

File `lib/db.js` sudah otomatis menggunakan environment variables:

```javascript
import { queryAll, cachedQuery } from '@/lib/db'

// Query tanpa cache
const courses = await queryAll('SELECT * FROM courses WHERE is_published = true')

// Query dengan cache (5 menit)
const courses = await cachedQuery('courses:all', async () => {
  return await queryAll('SELECT * FROM courses WHERE is_published = true')
}, 300)
```

---

## Troubleshooting

### Port 5432 sudah dipakai?

Edit `docker-compose.yml`, ganti port:
```yaml
ports:
  - "5433:5432"  # Gunakan port 5433
```

### Database tidak terkoneksi?

1. Cek Docker status: `docker-compose ps`
2. Cek logs: `docker-compose logs postgres`
3. Pastikan container running (status: Up)

### Reset database

```bash
# Hapus semua data dan buat ulang
docker-compose down -v
docker-compose up -d
```

---

## Command Lengkap

| Command | Keterangan |
|---------|-----------|
| `docker-compose up -d` | Start services |
| `docker-compose down` | Stop services |
| `docker-compose logs -f` | Lihat logs real-time |
| `docker-compose ps` | Cek status |
| `docker-compose exec postgres psql -U tadabburquran -d tadabburquran_db` | Masuk ke PostgreSQL CLI |
| `docker-compose exec redis redis-cli` | Masuk ke Redis CLI |
