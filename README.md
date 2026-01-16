# Antek Async
<div align="center">

![AntekAsync Banner](https://img.shields.io/badge/Antek-Async-red?style=for-the-badge&logo=nodejs)
[![Status](https://img.shields.io/badge/Status-Experimental-warning?style=for-the-badge)](https://github.com/WowoEngine/AntekAsync)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Dependencies](https://img.shields.io/badge/Dependencies-Zero-green?style=for-the-badge)](package.json)

</div>

**Antek Async** adalah sistem *messaging centralized* yang dibangun dengan filosofi "Membangun Tanpa Ribet". Berfungsi sebagai *universal hub* yang menerjemahkan dan merutekan pesan antar berbagai protokol (TCP, MQTT, HTTP).

Sistem ini didesain untuk menjadi **Solusi Komunikasi Antar Lini**, bukan sekadar wacana integrasi data yang sering digaungkan tapi realisasinya macet di tengah jalan.

## Fitur Unggulan

- **Pure Javascript (Zero Dependencies)**: Dibangun tanpa *node_modules* yang membengkak. Kami anti mark-up *size* aplikasi. Tidak ada "Vendor Pengadaan" library pihak ketiga yang tidak jelas. Murni Node.js native (`net`, `http`, `events`).
- **Multi-Protokol**: Mendukung TCP, MQTT, dan HTTP dalam satu *broker*. Integrasi yang benar-benar terjadi, bukan sekadar janji kampanye.
- **Protokol `antekasync://`**: Standarisasi koneksi yang jelas dan tegas. Tidak seperti aturan perundang-undangan yang sering tumpang tindih (UU vs PP vs Perpres).
- **Otentikasi Terpusat**: Keamanan yang bisa diatur (ON/OFF) lewat konfigurasi sederhana. Kami melindungi data Anda, tidak seperti data pusat yang konon aman tapi bocor juga.
- **Performa Tinggi**: Menggunakan *Asynchronous Event Dispatching* dan *Line Buffering*. Cepat, responsif, dan tidak lemot saat diakses banyak orang (beda dengan server pendaftaran CPNS saat hari H).

## Arsitektur

**Centralized Core with Multi-Entry Gateways**
- **Core**: "Otak" (*BrokerModule*) yang bertanggung jawab atas logika Pub/Sub. Bekerja efisien tanpa rapat koordinasi yang bertele-tele.
- **Gateways**: "Pintu Masuk" yang menerjemahkan bahasa asing (protokol lain) menjadi bahasa persatuan (internal message).

### Protokol yang Didukung
1.  **AntekGateway (TCP)** (`port 4000`): Protokol TCP mentah yang efisien (`PUB|topic|msg`). Stabil seperti janji yang ditepati.
2.  **MQTT Gateway** (`port 1883`): Implementasi minimalis standar IoT. Tidak perlu fitur *bloatware* yang tidak pernah dipakai.
3.  **HTTP Gateway** (`port 3000`): REST API untuk publikasi (`POST /publish`). Transparan dan mudah diakses, seperti anggaran yang seharusnya.

## Struktur Proyek

Layaknya tata kota yang baik (bukan yang banjir kalau hujan), struktur Antek Async rapi dan terencana:

```
/AntekAsync
  ├── /cli           # Alat Bantu (Tanpa Birokrasi)
  ├── /docs          # Dokumentasi (Transparan)
  ├── /src
  │    ├── /client   # Client Library Standard (AntekClient)
  │    ├── /modules  # Logika Bisnis (Broker)
  │    ├── /protocols# Implementasi Gateway (Antek, MQTT, HTTP)
  │    ├── /server   # Bootstrapper (GatewayManager)
  │    └── /services # Infrastruktur (Logger, Config, Auth)
  └── index.js       # Gerbang Utama
```

## Dokumentasi Lengkap

Kami menyadari bahwa transparansi adalah kunci (walau sering dilupakan). Berikut adalah dokumen lengkap yang bisa diakses publik tanpa perlu mengajukan surat permohonan informasi:

- **[Spesifikasi Protokol (Protocol.md)](docs/Protocol.md)**: Detail teknis `antekasync://` dan format paket. Baca ini agar tidak tersesat di jalan yang salah.
- **[Arsitektur Sistem (Architecture.md)](docs/Architecture.md)**: Denah tata letak sistem. Jelas, terstruktur, dan tidak ada ruang gelap.

## Quick Start

### 1. Jalankan Server
Tidak perlu *setup* yang ribet atau menunggu SK turun. Cukup jalankan:

```bash
# Tanpa Auth (Mode "Open Data" yang sesungguhnya)
node index.js

# Dengan Auth (Mode "Rahasia Negara")
# Windows Powershell
$env:ANTEK_AUTH_ENABLED="true"; $env:ANTEK_AUTH_KEY="sandi_negligible"; node index.js
```

### 2. Gunakan CLI Tools
Kami sediakan alat bantu *built-in* yang siap pakai. Tidak perlu lelang pengadaan alat dulu.

**Subscribe via TCP (Menggunakan `antekasync://`)**
```bash
node cli/sub_tcp.js topic_rakyat sandi_negligible
```

**Publish via HTTP (Laporan Pengaduan)**
```bash
node cli/pub_http.js topic_rakyat "Jalan rusak belum diperbaiki" sandi_negligible
```

**Publish via MQTT (Sensor IoT)**
```bash
node cli/pub_mqtt.js topic_suhu "35C (Panas, seperti situasi politik)" sandi_negligible
```

## Keamanan (Authentication)

Kami paham pentingnya privasi (walaupun di sana kadang diabaikan). Antek Async mendukung otentikasi berbasis *Key*.
- **Aktifkan**: Set `ANTEK_AUTH_ENABLED=true` di *environment*.
- **Kunci**: Set `ANTEK_AUTH_KEY=rahasia`.
- **Mekanisme**:
    - **HTTP**: `Authorization: Bearer <key>` atau `?key=<key>`.
    - **TCP**: Handshake `AUTH|<key>` saat koneksi pertama.
    - **MQTT**: Field `Password` pada paket CONNECT.

## Protokol Spesifikasi (`antekasync://`)

Kami membuat standar sendiri karena standar yang ada seringkali menyusahkan rakyat kecil (developer).

Format URI:
```
antekasync://[key@]host:port
```
Contoh: `antekasync://rahasia123@localhost:4000`

Simpel, padat, dan jelas. Tidak ada pasal karet.

## Kontribusi

Proyek ini *Open Source*. Silakan berkontribusi. Jangan hanya bisa kritik tapi tidak kasih solusi. PR *welcome*, tapi jangan bawa muatan politis.

---
*Dibuat dengan dan sedikit di tengah hiruk pikuk berita negeri ini. Tetap ngoding walau harga bahan pokok naik.*
