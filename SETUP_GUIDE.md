# 🚀 JATSC Inspection System - Setup Guide

Complete step-by-step guide to download, install, and run the application on a new laptop.

---

## 📋 Prerequisites

Before starting, make sure you have installed:

1. **Python 3.8+** → [Download Python](https://www.python.org/downloads/)
   - During installation, check ✅ "Add Python to PATH"
   
2. **Node.js 16+** → [Download Node.js](https://nodejs.org/)
   - Includes npm (Node Package Manager)
   
3. **Git** (optional, for cloning)  → [Download Git](https://git-scm.com/)

**Verify Installation:**
```bash
python --version    # Should show Python 3.8 or higher
node --version      # Should show Node.js 16 or higher
npm --version       # Should show npm 7 or higher
```

---

## 📥 Step 1: Download the Project

### Option A: Download as ZIP (Recommended for Beginners)

1. Go to: **https://github.com/novalwin-cmd/Pengecekan_Jatsc**
2. Click the green **"Code"** button
3. Select **"Download ZIP"**
4. Wait for download to complete

### Option B: Clone with Git

```bash
git clone https://github.com/novalwin-cmd/Pengecekan_Jatsc.git
cd Pengecekan_Jatsc
```

---

## 📂 Step 2: Extract the ZIP File

### Windows:
1. Right-click the **Pengecekan_Jatsc.zip** file
2. Select **"Extract All"**
3. Choose your destination folder
4. Click **"Extract"**

### macOS:
1. Double-click **Pengecekan_Jatsc.zip**
2. It will automatically extract

### Linux:
```bash
unzip Pengecekan_Jatsc.zip
```

---

## 📁 Step 3: Open the Extracted Folder

After extraction, you should see:

```
Pengecekan_Jatsc/
├── frontend/              # React application
├── backend/               # Flask API
├── START.sh              # Start both servers (macOS/Linux)
├── START.cmd             # Start both servers (Windows)
├── START_BACKEND.sh      # Start backend only
├── START_FRONTEND.sh     # Start frontend only
├── README.md             # Documentation
└── SETUP_GUIDE.md        # This file
```

---

## ⚙️ Step 4: Setup Backend

### Windows:

1. Open **Command Prompt** or **PowerShell**
2. Navigate to the project folder:
   ```bash
   cd C:\Users\YourName\Downloads\Pengecekan_Jatsc
   ```

3. Go to backend folder:
   ```bash
   cd backend
   ```

4. Create virtual environment:
   ```bash
   python -m venv venv
   ```

5. Activate virtual environment:
   ```bash
   venv\Scripts\activate
   ```
   
   You should see: `(venv)` at the start of your command line

6. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### macOS / Linux:

1. Open **Terminal**
2. Navigate to the project folder:
   ```bash
   cd ~/Downloads/Pengecekan_Jatsc
   ```

3. Go to backend folder:
   ```bash
   cd backend
   ```

4. Create virtual environment:
   ```bash
   python3 -m venv venv
   ```

5. Activate virtual environment:
   ```bash
   source venv/bin/activate
   ```
   
   You should see: `(venv)` at the start of your terminal

6. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 📦 Step 5: Setup Frontend

### Windows:

1. Open a **new** Command Prompt/PowerShell window
2. Navigate to frontend folder:
   ```bash
   cd C:\Users\YourName\Downloads\Pengecekan_Jatsc\frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### macOS / Linux:

1. Open a **new** Terminal window
2. Navigate to frontend folder:
   ```bash
   cd ~/Downloads/Pengecekan_Jatsc/frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

---

## 🚀 Step 6: Start the Application

### Option A: Start Everything at Once (Recommended)

#### macOS / Linux:
```bash
# From the project root folder
./START.sh
```

#### Windows:
```bash
# From the project root folder
START.cmd
```

### Option B: Start Manually

#### Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate    # macOS/Linux
# venv\Scripts\activate     # Windows

python app.py              # macOS/Linux
# python app.py            # Windows
```

You should see:
```
* Running on http://127.0.0.1:5000
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v8.2.2 ready in 249 ms
➜ Local: http://localhost:5173/
```

---

## 🌐 Step 7: Open in Browser

Once both servers are running, open your browser and go to:

**http://localhost:5173**

You should see the JATSC Inspection System dashboard! 🎉

---

## 📊 Quick Reference

### URLs After Starting:
| Service | URL | Port |
|---------|-----|------|
| Frontend (Web App) | http://localhost:5173 | 5173 |
| Backend (API) | http://127.0.0.1:5000 | 5000 |

### Common Commands:

**Stop all services:**
- Press **Ctrl + C** in the terminal

**View logs:**
- Backend: `tail -f /tmp/jatsc_backend.log`
- Frontend: `tail -f /tmp/jatsc_frontend.log`

**Restart services:**
- Stop with Ctrl+C
- Run `./START.sh` again (macOS/Linux)
- Run `START.cmd` again (Windows)

---

## ✅ Verification Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] ZIP extracted to a folder
- [ ] Backend virtual environment created (`venv` folder exists)
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install` in frontend folder)
- [ ] Backend running on http://127.0.0.1:5000
- [ ] Frontend running on http://localhost:5173
- [ ] Browser shows JATSC dashboard at http://localhost:5173

---

## 🆘 Troubleshooting

### Backend won't start - Port 5000 already in use

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Frontend won't start - Port 5173 already in use

**Windows:**
```bash
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -i :5173
kill -9 <PID>
```

### Dependencies installation fails

**For Backend:**
```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

**For Frontend:**
```bash
cd frontend
npm cache clean --force
npm install
```

### Virtual environment not activating

Make sure you're in the correct folder:
```bash
cd backend
# Then activate
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate         # Windows
```

### Python/Node not recognized

**Windows:** Make sure Python and Node were added to PATH during installation. Restart your computer after installing.

**macOS/Linux:** Try using `python3` and `npm` instead:
```bash
python3 --version
npm --version
```

---

## 📱 Using the Application

### Daily Check Workflow:
1. Click **"✓ Daily Check"** in sidebar
2. Click **"Start Daily Check"**
3. Fill in date, shift, and time
4. Add personnel who participated
5. Record equipment readings for each type
6. Click **"Stop Daily Check"** when done
7. Download as CSV, XLSX, or PDF

### View History:
1. Click **"📚 History"** in sidebar
2. See all past daily checks
3. Click on a check to expand details
4. View graphs comparing equipment
5. Export graph as PNG or PDF

### Data Monitoring:
1. Click **"📊 Monitoring"** in sidebar
2. Select equipment types (Chiller, Pump, AHU)
3. Choose parameter (Voltage R/S/T, Temperature)
4. View historical graphs
5. Manage thresholds
6. Export graphs

---

## 🎓 Features Overview

### ✨ Daily Check
- Record equipment readings
- Add team members
- Real-time anomaly detection
- Multi-format export (CSV/XLSX/PDF)

### 📊 History
- View all past checks
- Inline graph visualization
- Multi-equipment comparison
- Export historical data

### 📈 Data Monitoring
- Historical trend analysis
- Configurable thresholds
- Time range filtering (Monthly/6-Month/Yearly)
- Color-coded equipment display

---

## 📞 Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review browser console (F12) for errors
3. Check server logs in terminal
4. Visit GitHub: https://github.com/novalwin-cmd/Pengecekan_Jatsc

---

## 🎉 You're All Set!

The JATSC Inspection System is now ready to use. Enjoy! 🚀

For more information, see **README.md** in the project folder.
