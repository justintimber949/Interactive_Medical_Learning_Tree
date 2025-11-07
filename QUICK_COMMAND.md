# ⚡ Quick Commands - Copy & Paste

Kumpulan command yang sering digunakan untuk development.

## 🏗️ Initial Setup (One Time)

```bash
# 1. Buat struktur folder
mkdir -p interactive-medical-learning-tree/backend
mkdir -p interactive-medical-learning-tree/frontend
cd interactive-medical-learning-tree

# 2. Inisialisasi backend
cd backend
npm init -y

# 3. Install dependencies
npm install express @google/generative-ai multer pdf-parse dotenv cors

# 4. Install dev dependencies (optional)
npm install --save-dev nodemon

# 5. Kembali ke root
cd ..
```

## 🚀 Daily Development

### Start Backend (Production)
```bash
cd backend
npm start
```

### Start Backend (Development with auto-reload)
```bash
cd backend
npm run dev
```

### Test Backend Health
```bash
curl http://localhost:3000/health
```

### Start Frontend
```bash
# Di VS Code:
# 1. Buka frontend/index.html
# 2. Klik kanan → Open with Live Server

# Atau buka manual di browser:
# http://localhost:5500
```

## 🧹 Maintenance

### Clear Node Modules & Reinstall
```bash
cd backend
rm -rf node_modules
rm package-lock.json
npm install
```

### Check Installed Packages
```bash
cd backend
npm list --depth=0
```

### Update All Packages
```bash
cd backend
npm update
```

### Check for Outdated Packages
```bash
cd backend
npm outdated
```

## 🐛 Debugging

### Check Node & npm Version
```bash
node --version
npm --version
```

### Find Process Using Port 3000
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

### Kill Process on Port 3000
```bash
# Windows
# Cari PID dari command di atas, lalu:
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Check Backend Logs
```bash
cd backend
npm start 2>&1 | tee backend.log
```

## 📦 Package Management

### Install Specific Package Version
```bash
npm install express@4.18.2
```

### Uninstall Package
```bash
npm uninstall <package-name>
```

### Add to .gitignore
```bash
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
```

## 🔐 Environment Variables

### Create .env File
```bash
cd backend
cat > .env << EOL
GEMINI_API_KEY=YOUR_KEY_HERE
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500
EOL
```

### Load .env in Terminal (for testing)
```bash
# Mac/Linux
export $(cat .env | xargs)

# Windows PowerShell
Get-Content .env | ForEach-Object {
    $name, $value = $_.split('=')
    Set-Content env:\$name $value
}
```

## 🧪 Testing Endpoints

### Test Upload (using curl)
```bash
curl -X POST \
  http://localhost:3000/upload-pdf \
  -H 'Content-Type: multipart/form-data' \
  -F 'pdfFile=@/path/to/your/file.pdf'
```

### Test Analogy
```bash
curl -X POST \
  http://localhost:3000/get-analogy \
  -H 'Content-Type: application/json' \
  -d '{"topic":"Siklus Krebs"}'
```

### Test Clinical
```bash
curl -X POST \
  http://localhost:3000/get-clinical \
  -H 'Content-Type: application/json' \
  -d '{"topic":"Siklus Krebs"}'
```

### Test Chat Start
```bash
curl -X POST \
  http://localhost:3000/start-chat \
  -H 'Content-Type: application/json' \
  -d '{"topic":"Siklus Krebs"}'
```

### Test Chat Message
```bash
curl -X POST \
  http://localhost:3000/chat-message \
  -H 'Content-Type: application/json' \
  -d '{
    "sessionId":"12345",
    "message":"Apa itu Siklus Krebs?"
  }'
```

## 🔄 Git Commands (Optional)

### Initialize Git
```bash
git init
git add .
git commit -m "Initial commit"
```

### Create .gitignore
```bash
cat > .gitignore << EOL
node_modules/
.env
*.log
.DS_Store
EOL
```

### Commit Changes
```bash
git add .
git commit -m "Your commit message"
```

### Create New Branch
```bash
git checkout -b feature/new-feature
```

### View Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
```

## 📊 Performance Monitoring

### Check Memory Usage
```bash
# Mac/Linux
ps aux | grep node

# Windows
tasklist | findstr node
```

### Monitor Backend Logs in Real-time
```bash
cd backend
npm start | grep "Error\|Success\|Failed"
```

## 🔧 VS Code Integration

### Open Project in VS Code
```bash
code interactive-medical-learning-tree
```

### Open Specific Folder
```bash
code backend
code frontend
```

### Install VS Code Extensions via CLI
```bash
code --install-extension ritwickdey.LiveServer
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

## 📱 Network Testing

### Find Your Local IP
```bash
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### Access from Other Device
```bash
# Update FRONTEND_URL in .env to:
FRONTEND_URL=http://YOUR_LOCAL_IP:5500

# Then access from phone/tablet:
http://YOUR_LOCAL_IP:3000  # Backend
http://YOUR_LOCAL_IP:5500  # Frontend
```

## 🎨 Frontend Development

### Watch CSS Changes
```bash
# No command needed - Live Server auto-reloads
```

### Minify CSS (optional)
```bash
npm install -g csso-cli
csso frontend/styles.css -o frontend/styles.min.css
```

### Validate HTML
```bash
npm install -g html-validator-cli
html-validator frontend/index.html
```

## 🚨 Emergency Commands

### Force Stop All Node Processes
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall node
```

### Reset Everything
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Check Disk Space
```bash
# Windows
dir /s

# Mac/Linux
du -sh *
```

## 📋 Checklist Commands

### Pre-Development Check
```bash
node --version        # Should be v16+
npm --version         # Should be 8+
cd backend && npm list --depth=0  # All packages installed
curl http://localhost:3000/health  # Backend responds
```

### Pre-Deployment Check
```bash
npm test              # Run tests (if any)
npm run lint          # Check code quality (if configured)
npm audit             # Check vulnerabilities
npm outdated          # Check package updates
```

## 🎯 Useful Aliases (Optional)

Add to `.bashrc` or `.zshrc`:

```bash
# Quick start backend
alias start-backend="cd ~/path/to/project/backend && npm start"

# Quick start dev mode
alias dev-backend="cd ~/path/to/project/backend && npm run dev"

# Quick open project
alias open-imlt="code ~/path/to/project"

# Quick health check
alias check-backend="curl -s http://localhost:3000/health | json_pp"
```

## 💡 Pro Tips

### Use npm scripts
Add to `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"No tests yet\"",
    "clean": "rm -rf node_modules package-lock.json && npm install"
  }
}
```

Then run:
```bash
npm run dev
npm run clean
```

### Use environment variables in terminal
```bash
PORT=3001 npm start  # Override port temporarily
```

### Use PM2 for production (advanced)
```bash
npm install -g pm2
pm2 start server.js --name imlt-backend
pm2 logs imlt-backend
pm2 stop imlt-backend
pm2 restart imlt-backend
```

---

**💾 Save this file for quick reference!**

Copy paste command yang dibutuhkan langsung dari sini untuk mempercepat development workflow Anda.