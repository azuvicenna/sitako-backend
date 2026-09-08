# SITAKO Backend

## Deskripsi Proyek

SITAKO (Sistem Informasi Perpustakaan Sekolah) Backend adalah service API utama yang menangani logika bisnis, pengelolaan database, dan otentikasi untuk aplikasi perpustakaan sekolah. Proyek ini dirancang agar scalable dan mudah di-deploy menggunakan sistem container.

## Teknologi Utama

Berikut adalah beberapa teknologi utama yang digunakan beserta fungsinya:

- **Node.js & TypeScript**: Lingkungan eksekusi dan bahasa pemrograman utama yang memastikan kode lebih rapi dan bebas dari error pengetikan tipe data.
- **Express.js**: Framework web ringan untuk mengatur routing API.
- **Drizzle ORM & PostgreSQL**: PostgreSQL sebagai database utama, sedangkan Drizzle ORM digunakan untuk memudahkan manajemen skema dan query ke database.
- **Redis**: In-memory data store yang dipakai untuk caching agar respons aplikasi lebih cepat.
- **Cloudflare R2**: Layanan object storage yang kompatibel dengan S3 API, digunakan untuk menyimpan file seperti gambar, dokumen, atau aset lainnya.
- **Docker & Docker Compose**: Mengemas aplikasi beserta environment-nya (PostgreSQL & Redis) ke dalam container sehingga aplikasi bisa dijalankan dengan konsisten di mesin manapun.
- **Jenkins**: Tools CI/CD untuk mengotomatisasi pipeline mulai dari build, test, hingga proses deploy langsung ke Virtual Machine (menggunakan Multipass).

## Daftar Library Dependencies

Berikut adalah rincian fungsi dari masing-masing dependencies utama yang terdaftar di `package.json`:

- **`@aws-sdk/client-s3`**: Library official AWS SDK untuk berinteraksi dengan S3-compatible storage (digunakan untuk Cloudflare R2).
- **`bcrypt`**: Digunakan untuk melakukan _hashing_ password pengguna agar aman di database.
- **`cookie-parser`**: Middleware Express untuk memparsing cookie dari header HTTP.
- **`drizzle-orm`**: TypeScript ORM yang ringan dan cepat untuk berinteraksi dengan database PostgreSQL.
- **`express`**: Framework web minimalis untuk membangun RESTful API di Node.js.
- **`jsonwebtoken`**: Untuk membuat dan memverifikasi JSON Web Token (JWT) untuk sistem otentikasi.
- **`nodemailer`**: Library untuk mengirim email (misal: verifikasi akun, reset password) via SMTP.
- **`pg`**: Node.js client murni untuk PostgreSQL (koneksi database utama).
- **`redis`**: Client Redis resmi untuk Node.js guna mengelola cache dan session.
- **`svg-captcha`**: Untuk menghasilkan gambar captcha berbasis SVG (biasanya untuk keamanan form login/register).
- **`typst`**: Package wrapper untuk menjalankan engine compiler Typst dari dalam Node.js.
- **`ulid`**: Generator unique identifier berbasis waktu yang berurutan secara leksikografis (alternatif UUID).
- **`winston`**: Library logging yang fleksibel dan powerful untuk mencatat aktivitas atau error aplikasi.
- **`xlsx`**: Library untuk membaca, menulis, dan memanipulasi file spreadsheet Excel (.xlsx/.xls).
- **`zod`**: Library validasi skema berbasis TypeScript yang ketat untuk data input/request.

## Perintah Terminal & Cara Menjalankan

### Persiapan Awal

Langkah pertama sebelum menjalankan aplikasi secara lokal:

1. Salin template file environment:
   ```bash
   cp .env.example .env
   ```
2. Sesuaikan nilai di dalam `.env` dengan kredensial database, Redis, S3 (Cloudflare R2), dan pengaturan mailer.
3. Install semua dependencies:
   ```bash
   npm install
   ```

### Mode Development

Gunakan perintah berikut untuk pengembangan lokal:

- Menjalankan server lokal (dengan watch/hot-reload):
  ```bash
  npm run dev
  ```

Perintah khusus untuk database (Drizzle):

- `npm run db:generate` : Membuat file migrasi dari skema terbaru.
- `npm run db:migrate` : Mengeksekusi migrasi ke database.
- `npm run db:push` : Mendorong perubahan skema langsung ke database (cocok untuk dev).
- `npm run db:studio` : Membuka antarmuka web GUI untuk melihat dan mengelola isi database.

### Menggunakan Docker

Jika ingin langsung menjalankan aplikasi, database, dan redis menggunakan Docker:

- Build dan jalankan semua container di background:
  ```bash
  docker compose up -d
  ```
- Melihat log dari container aplikasi:
  ```bash
  docker logs -f sitako-app
  ```
- Menghentikan dan menghapus container yang sedang berjalan:
  ```bash
  docker compose down
  ```

### CI/CD dengan Jenkins

Aplikasi ini sudah dipasang otomatisasi melalui `Jenkinsfile`. Pipeline akan menjalankan tahapan berikut secara berurutan:

1. **Install Dependencies & Lint/Test** (`npm ci`, `npm run lint`, `npm test`)
2. **Build TypeScript** (`npm run build`)
3. **Docker Build** (Membungkus hasil build ke dalam image Docker)
4. **Ship Image** (Menyimpan image ke dalam file `.tar` dan mengirimnya ke VM `sitako-vm` via Multipass)
5. **Deploy** (Menjalankan `docker compose up -d` langsung di dalam VM)
