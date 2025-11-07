# 🚀 Panduan Setup Interactive Medical Learning Tree di VS Code

Panduan lengkap step-by-step untuk setup proyek di Visual Studio Code.

## 📋 Prasyarat

Sebelum memulai, pastikan Anda telah menginstall:

1. **Node.js** (v16 atau lebih tinggi)
   - Download dari: https://nodejs.org/
   - Verifikasi: Buka terminal dan jalankan `node --version`

2. **Visual Studio Code**
   - Download dari: https://code.visualstudio.com/

3. **Git** (opsional, untuk version control)
   - Download dari: https://git-scm.com/

4. **Gemini API Key**
   - Dapatkan dari: https://makersuite.google.com/app/apikey
   - Gratis dengan quota cukup untuk development

## 🗂️ Step 1: Persiapan Folder

### 1.1 Buat Folder Proyek

```bash
# Buat folder utama
mkdir interactive-medical-learning-tree
cd interactive-medical-learning-tree

# Buat subfolder
mkdir backend
mkdir frontend
```

### 1.2 Struktur yang Diharapkan

```
interactive-medical-learning-tree/
├── backend/
│   ├── server.js
│   ├── prompts.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .gitignore
└── README.md
```

## 📝 Step 2: Setup Backend

### 2.1 Buka Folder di VS Code

1. Buka VS Code
2. File → Open Folder
3. Pilih folder `interactive-medical-learning-tree`

### 2.2 Buat File Backend

Di VS Code:

1. **Buat `backend/package.json`**
   - Klik kanan folder `backend` → New File
   - Nama: `package.json`
   - Copy paste isi dari **Dokumen 1: package.json**

2. **Buat `backend/.env`**
   - New File di folder `backend`
   - Nama: `.env`
   - Copy paste dari **Dokumen 2: .env**
   - **PENTING:** Ganti `YOUR_GEMINI_API_KEY_HERE` dengan API key Anda

   ```env
   GEMINI_API_KEY=AIzaSy...  # API Key Anda
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5500
   ```

3. **Buat `backend/prompts.js`**
   - New File di folder `backend`
   - Nama: `prompts.js`
   - Copy paste dari **Dokumen 3: prompts.js**

4. **Buat `backend/server.js`**
   - New File di folder `backend`
   - Nama: `server.js`
   - Copy paste dari **Dokumen 4: server.js**

### 2.3 Install Dependencies

1. Buka Terminal di VS Code:
   - Menu: Terminal → New Terminal
   - Atau tekan: `Ctrl + Shift + ` (backtick)

2. Masuk ke folder backend:
   ```bash
   cd backend
   ```

3. Install semua dependencies:
   ```bash
   npm install
   ```

4. Tunggu proses selesai (sekitar 30-60 detik)

### 2.4 Test Backend

Jalankan server:
```bash
npm start
```

Jika berhasil, Anda akan melihat:
```
╔════════════════════════════════════════════╗
║   🏥 Medical Learning Tree API Server     ║
║   🚀 Server running on port 3000          ║
║   📍 http://localhost:3000                ║
╚════════════════════════════════════════════╝
✅ Gemini API initialized
✅ All endpoints ready
```

**Test Health Check:**
Buka browser dan kunjungi: `http://localhost:3000/health`

Anda harus melihat:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "activeSessions": 0
}
```

✅ Backend siap!

## 🎨 Step 3: Setup Frontend

### 3.1 Buat File Frontend

Di VS Code:

1. **Buat `frontend/index.html`**
   - New File di folder `frontend`
   - Nama: `index.html`
   - Copy paste dari **Dokumen 5: index.html**

2. **Buat `frontend/styles.css`**
   - New File di folder `frontend`
   - Nama: `styles.css`
   - Copy paste dari **Dokumen 6: styles.css**

3. **Buat `frontend/app.js`**
   - New File di folder `frontend`
   - Nama: `app.js`
   - Copy paste dari:
     - **Dokumen 7: app.js (Part 1)**
     - **Dokumen 8: app.js (Part 2)**
   - **Gabungkan kedua part dalam satu file**

### 3.2 Install Extension Live Server

1. Di VS Code, buka Extensions (Ctrl+Shift+X)
2. Cari: **Live Server**
3. Install extension oleh **Ritwick Dey**
4. Restart VS Code jika diminta

### 3.3 Jalankan Frontend

1. Buka file `frontend/index.html` di VS Code
2. Klik kanan di editor
3. Pilih: **"Open with Live Server"**
4. Browser akan otomatis terbuka di `http://localhost:5500`

✅ Frontend siap!

## 🔄 Step 4: Test Full Integration

### 4.1 Pastikan Backend Running

Di terminal pertama:
```bash
cd backend
npm start
```

### 4.2 Buka Frontend

Di browser (via Live Server):
```
http://localhost:5500
```

### 4.3 Test Upload PDF

1. Siapkan file PDF (materi kuliah)
2. Klik "Select PDF File" atau drag & drop
3. Klik "🚀 Analyze PDF"
4. Tunggu proses analisis
5. Tree diagram akan muncul

### 4.4 Test Fitur Interaktif

1. **Klik node** di tree
2. Sidebar kanan akan terbuka
3. Test tab **Analogy** → Klik "Generate Analogy"
4. Test tab **Clinical** → Klik "Get Clinical Context"
5. Test tab **Chat** → Ketik pertanyaan

## 📦 Step 5: File Tambahan

### 5.1 Buat .gitignore

- New File di root folder
- Nama: `.gitignore`
- Copy paste dari **Dokumen 10: .gitignore**

### 5.2 Buat README.md

- New File di root folder
- Nama: `README.md`
- Copy paste dari **Dokumen 9: README.md**

### 5.3 Buat SETUP_GUIDE.md

- New File di root folder
- Nama: `SETUP_GUIDE.md`
- Copy paste dari **Dokumen 11** (file ini)

## 🎯 Step 6: Workflow Development

### 6.1 Setup Multiple Terminals

Di VS Code:
1. Terminal 1 (Backend): `cd backend && npm start`
2. Terminal 2 (Git/Commands): untuk command lainnya

Split terminal: Klik icon "Split Terminal" di kanan atas terminal

### 6.2 Development Mode

Untuk auto-reload backend saat coding:
```bash
cd backend
npm run dev
```

### 6.3 Debugging

**Backend:**
- Lihat logs di terminal backend
- Tambahkan `console.log()` di `server.js`

**Frontend:**
- Buka Developer Tools (F12)
- Tab Console untuk error
- Tab Network untuk request/response

## 🔧 Troubleshooting Setup

### Error: "Cannot find module"
```bash
cd backend
rm -rf node_modules
npm install
```

### Error: "Port 3000 already in use"
1. Ubah PORT di `.env`:
   ```env
   PORT=3001
   ```
2. Ubah `API_BASE_URL` di `frontend/app.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:3001';
   ```

### Error: "CORS policy blocked"
Pastikan di `.env`:
```env
FRONTEND_URL=http://localhost:5500
```
Sesuaikan dengan port Live Server Anda.

### Live Server tidak buka browser
1. Install ulang extension Live Server
2. Restart VS Code
3. Atau buka manual: `http://localhost:5500`

### Gemini API Error 401
- API Key salah atau expired
- Generate ulang di https://makersuite.google.com/app/apikey
- Update di `.env`

### PDF tidak ter-extract
- Pastikan PDF tidak ter-password
- Gunakan PDF dengan text (bukan scan image)
- Coba PDF lain

## ✅ Checklist Setup

Pastikan semua ini ✅:

**Backend:**
- [ ] Node.js terinstall (`node --version`)
- [ ] Dependencies terinstall (`node_modules` ada)
- [ ] File `.env` dibuat dengan API Key valid
- [ ] Server berjalan tanpa error
- [ ] Health check endpoint respond

**Frontend:**
- [ ] File HTML, CSS, JS dibuat
- [ ] Live Server extension terinstall
- [ ] Browser membuka aplikasi
- [ ] Tidak ada error di Console

**Integration:**
- [ ] Upload PDF berhasil
- [ ] Tree diagram muncul
- [ ] Analogy feature berfungsi
- [ ] Clinical feature berfungsi
- [ ] Chatbot berfungsi

## 🎓 Tips Development

### VS Code Extensions Recommended
- **Live Server** - Frontend preview
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **GitLens** - Git visualization
- **Path Intellisense** - File path autocomplete

### Keyboard Shortcuts
- `Ctrl + P` - Quick file open
- `Ctrl + Shift + P` - Command palette
- `Ctrl + `` - Toggle terminal
- `Ctrl + B` - Toggle sidebar
- `Ctrl + /` - Toggle comment
- `Alt + Up/Down` - Move line up/down

### Project Organization
- Gunakan Git untuk version control
- Commit setelah fitur selesai
- Buat branch untuk fitur baru
- Jangan commit `.env` file!

## 📚 Next Steps

Setelah setup selesai:

1. **Baca README.md** untuk detail penggunaan
2. **Eksperimen** dengan berbagai PDF
3. **Customize prompts** di `prompts.js`
4. **Modifikasi UI** di `styles.css`
5. **Tambah fitur** sesuai kebutuhan

## 🆘 Butuh Bantuan?

Jika mengalami masalah:

1. **Cek Console** (browser & terminal)
2. **Baca error message** dengan teliti
3. **Google error** spesifik yang muncul
4. **Cek dokumentasi:**
   - Node.js: https://nodejs.org/docs/
   - Express: https://expressjs.com/
   - D3.js: https://d3js.org/
   - Gemini API: https://ai.google.dev/docs

## 🎉 Selamat!

Setup Anda sudah selesai! Sekarang Anda bisa mulai:
- Upload materi kuliah
- Eksplorasi fitur interaktif
- Belajar lebih efektif

**Happy Coding & Happy Learning! 🚀📚**

---

*Last updated: 2024*
*For questions: lihat README.md*