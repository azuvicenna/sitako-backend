# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [2026-09-09]

#### Added
- Inisialisasi unit test

### [2026-09-09]

#### Added
- Menambahkan CRUD pada modul fine, fine-payment, transaction, stack, dan shelf
- Menambahkan GET summary, transaction today, dan statistics untuk dashboard pustakawan
- Menambahkan get dan update profile untuk anggota dan pustakawan
- Menambahkan fitur logout

#### Changed
- Menyusun ulang arsitektur pada modul controllers, services, repositories, dan routes

### [2026-09-08]

#### Added
- Menambahkan auth dengan jsonwebtoken dengan HTTP-only cookies
- Menambahkan verfikasi captcha dan mengimplementasikannya pada login
- Menembahkan operasi CRUD dan clear cache pada modul book dan user sebagai uji coba

#### Changed
- Menghapus kode logger yang overuse, sekarang logger difokuskan untuk mencatat error kritis pada catch

### [2026-09-07]

#### Added
- [NOTE] Task spesifik mengerjakan modul book, fine, fine-payment, shelf, stack, transaction, librarian, dan member
- Menambahkan fitur search berdasarkan relasi pada modul fine, fine-payment, stack, dan transaction
- Menambahkan orderby ke modul book, fine, fine-payment, shelf, stack, transaction, librarian, dan member
- Membuat zod validation create dan update
- Membuat generator kode transaksi di transaction-code.ts
- Menyisipkan kode logger winston ke dalam controller, repository, dan membuat request-logger

#### Fixed
- Merefaktor kode controller dan repository

#### Changed
- Merestruktur isi folder utils agar terkategori (auth, core, data, generators, services)
- Merestruktur isi folder controller, repository, dan routes agar berorientasi role user
- Menambahkan import alias menggunakan "@/" untuk menghindari path import yang panjang

### [2026-09-06]

#### Added
- [NOTE] Task spesifik mengerjakan modul book, fine, fine-payment, shelf, stack, transaction, librarian, dan member
- Menambahkan fitur pagination dan endpoint GET data untuk pustakawan
- Menambahkan fitur pencarian namun masih belum support pencarian berdasarkan relasi

### [2026-09-05]

#### Added
- Setup project SITAKO Backend express typescript.
- Setup docker compose dan dockerfile
- Setup .env
- Setup jenkinsfile
- Setup config for Cloudflare R2
- Setup drizzle-orm with postgresql & ULID
- Setup jsonwebtoken
- Setup redis
- Setup winston
- Setup zod
- Setup typst
- Install xlxs (SheetJS)
- Setup nodemailer
