---

# Skolla Intern Test - Data Administrator Project

## Deskripsi Proyek

Proyek ini adalah bagian dari **Skolla Intern Test** untuk posisi **Data Administrator**. Tujuan dari proyek ini adalah untuk mengekstrak data sekolah dari website [Dapodik](https://dapo.kemdikbud.go.id/) dan menyimpannya ke dalam database **MySQL**. Data yang diambil berasal dari wilayah **Merauke, South Papua** dengan jenjang pendidikan yang berbeda-beda.

---

## Fitur

- **Scraping Data Sekolah** dari website Dapodik menggunakan **Puppeteer**.
- **Menyimpan Data** ke dalam database **MySQL** secara otomatis.
- Mendukung jenjang pendidikan seperti TK, SD, SMP, SMA, dll.
- Menangani data dengan validasi untuk nilai `null` agar disimpan sebagai `0` jika diperlukan.

---

## Struktur Data

Data yang diekstrak memiliki kolom-kolom berikut:

| Field       | Tipe Data | Deskripsi                   |
|-------------|-----------|-----------------------------|
| `school_name` | STRING    | Nama sekolah               |
| `npsn_id`     | INTEGER   | Nomor Pokok Sekolah Nasional|
| `bp`          | STRING    | Jenjang pendidikan         |
| `status`      | STRING    | Status sekolah (Negeri/Swasta) |
| `last_sync`   | TIMESTAMP | Waktu sinkronisasi terakhir |
| `students`    | INTEGER   | Jumlah siswa               |
| `province`    | STRING    | Provinsi                   |
| `subdistrict` | STRING    | Kecamatan                  |

---

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd skolla-intern-test
```

### 2. Install Dependencies

Pastikan Anda memiliki **Node.js** dan **MySQL** terinstal. Lalu jalankan perintah berikut untuk menginstal dependencies:

```bash
npm install puppeteer mysql2
```

### 3. Konfigurasi Database

Buat database MySQL dengan nama `skolla_intern_test` dan tabel `school_data_fredrik`. Berikut adalah DDL untuk membuat tabel:

```sql
CREATE DATABASE IF NOT EXISTS skolla_intern_test;

USE skolla_intern_test;

CREATE TABLE IF NOT EXISTS school_data_fredrik (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    npsn_id INT NOT NULL DEFAULT 0,
    bp VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_sync TIMESTAMP NULL DEFAULT NULL,
    students INT NOT NULL DEFAULT 0,
    province VARCHAR(100) NOT NULL,
    subdistrict VARCHAR(100) NOT NULL
) COLLATE = 'utf8mb4_unicode_ci';
```

---

## Menjalankan Proyek

1. Pastikan MySQL Server Anda sedang berjalan.
2. Jalankan script scraping dengan perintah berikut:

```bash
node index.js
```

### Alur Kerja:

1. Script akan membuka halaman Dapodik dan mengambil semua jenjang pendidikan yang tersedia.
2. Data sekolah akan diekstrak dari halaman tersebut.
3. Data yang telah diekstrak akan disimpan langsung ke tabel `school_data_fredrik` dalam database.

---

## Contoh Output Data

Data yang berhasil diekstrak dan disimpan akan terlihat seperti berikut:

| school_name      | npsn_id | bp  | status  | last_sync           | students | province   | subdistrict |
|------------------|---------|-----|---------|---------------------|----------|------------|-------------|
| SD Inpres Gudang Arang | 60300706 | SD  | Negeri  | 2024-11-15 06:32:07 | 268      | South Papua | Kontuar     |

---

## Membuat View

Untuk membuat **view** berdasarkan kriteria tertentu, gunakan perintah SQL berikut:

```sql
CREATE VIEW v_common_school AS
SELECT school_name, npsn_id, bp, status, students, province, subdistrict
FROM school_data_fredrik
WHERE bp IN ('SD', 'SMP', 'SMA') AND status = 'Negeri'
ORDER BY FIELD(bp, 'TK', 'KB', 'TPA', 'SPS', 'PKBM', 'SKB', 'SD', 'SMP', 'SMA', 'SMK', 'SLB');
```

---

## Menjalankan View

Untuk melihat data dari view `v_common_school`, gunakan perintah berikut di MySQL:

```sql
SELECT * FROM v_common_school;
```

---

## Dump Database

Untuk melakukan **dump** database ke dalam file `.sql`, gunakan perintah berikut:

```bash
mysqldump -u root -p skolla_intern_test > skolla_intern_fredrik.sql
```

---

## Lisensi

Proyek ini dibuat untuk keperluan tes Skolla Intern dan bukan untuk distribusi publik.
