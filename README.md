<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=24&duration=3000&pause=1000&color=11CF3D&center=true&vCenter=true&width=500&lines=Personal+Portfolio+Website;Final+Exam+Project;Aufan+Taufiqurrahman" alt="Typing SVG" />

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/Theme-Neon%20Green-11cf3d?style=for-the-badge" />
</p>

<a href="http://aufan.ifportofolio.com">
  <img src="https://img.shields.io/badge/Live_Demo-Visit_Website-success?style=flat&logo=google-chrome" height="30" />
</a>

<br/>

![Website Preview](images/preview-website.gif)
</div>

<br/>

# 📄 Informasi Project

| Entitas | Detail |
| :--- | :--- |
| **Project** | Ujian Akhir Semester - Desain Web |
| **Nama** | Aufan Taufiqurrahman |
| **NIM** | 2411532011 |
| **Dosen** | Nurfiah, S.ST., M.Kom. |
| **Domain** | [aufan.ifportofolio.com](http://aufan.ifportofolio.com) |

---

## 📝 Deskripsi Singkat

Website ini adalah **Portofolio Personal** yang dirancang khusus untuk mahasiswa IT. Dibangun untuk menampilkan profil, keahlian, dan galeri project dengan nuansa profesional.

Mengusung tema **"Dark Mode"** dengan aksen warna **Hijau Neon (`#11cf3d`)**, desain ini memberikan kesan *modern, futuristik, dan clean*. Website ini dibangun menggunakan **Native JavaScript** untuk performa maksimal tanpa library berat, dipadukan dengan **Bootstrap 5** untuk layout yang responsif.

---

## 🚀 Fitur Unggulan (Advanced Components)

Berikut adalah fitur teknis utama yang diimplementasikan dalam website ini:

### 🎵 1. Persistent Music Player
Widget pemutar musik yang "pintar". Menggunakan `LocalStorage` browser untuk menyimpan status:
* ✅ Status Play/Pause
* ✅ Volume
* ✅ Durasi (timestamp) terakhir
* **Hasil:** Musik tidak akan terputus atau mengulang dari awal saat pengunjung berpindah halaman.

### ✨ 2. Scroll Reveal Animation
Menggunakan **Intersection Observer API** native. Elemen website akan muncul secara halus (*fade-in up*) saat pengguna menggulir (scroll) halaman ke bawah.

### 📂 3. Dynamic Portfolio Filtering & Modal
* **Filtering:** Sortir project berdasarkan kategori (Web/Design/App) secara instan tanpa reload halaman.
* **Dynamic Modal:** Detail project ditampilkan dalam *Modal Popup* tunggal yang kontennya berubah secara dinamis sesuai project yang diklik (lengkap dengan tombol Live Demo & Source Code).

### ⌨️ 4. Typing Effect
Animasi pengetikan teks otomatis pada bagian *Hero Section* (Halaman Utama) untuk memberikan kesan interaktif pada pandangan pertama.

### 🛡️ 5. Client-side Form Validation
Validasi form kontak menggunakan JavaScript sebelum data dikirim. Sistem akan mengecek input kosong atau format email yang tidak valid untuk memastikan data bersih.

---

## 📂 Struktur File & Folder

```bash
/ (Root Directory)
├── index.html          # Halaman Utama (Hero & Skills)
├── about.html          # Halaman Tentang Saya
├── portofolio.html     # Halaman Galeri Projek
├── kontak.html         # Halaman Kontak
├── README.txt          # Dokumentasi Project (Original)
│
├── css/
│   └── style.css       # Styling kustom, variabel warna neon, animasi
│
├── js/
│   ├── script.js       # Logika utama (Typing, Scroll, Modal, Filter)
│   └── music.js        # Logika khusus pemutar musik background
│
├── images/             # Aset gambar profil, projek, dan favicon
│
└── music/              # Aset file audio mp3