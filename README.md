# JATSC Inspection System

Professional equipment monitoring and inspection dashboard with React + Node.js + SQLite.

**Now 100% Node.js - Super Simple Setup!** ✨

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 16+** → [Download](https://nodejs.org/)

That's it! No Python, no virtual environments!

### Installation & Running

```bash
# 1. Download ZIP from GitHub
# https://github.com/novalwin-cmd/Pengecekan_Jatsc

# 2. Extract and enter folder
cd Pengecekan_Jatsc

# 3. Install dependencies (one time)
npm install

# 4. Start everything
npm run dev
```

Done! 🎉

- **Frontend**: http://localhost:5173
- **Backend**: http://127.0.0.1:5000

---

## 📋 What Just Happened

When you run `npm run dev`, it:
- ✅ Starts React frontend on port 5173
- ✅ Starts Node.js backend on port 5000
- ✅ Both running simultaneously
- ✅ Hot reload enabled for both
- ✅ One command to rule them all!

---

## 🎯 Features

### ✓ Daily Check Workflow
- Record equipment readings (Chiller, Pump, AHU)
- Add team members
- Real-time anomaly detection
- Export to CSV, XLSX, PDF

### 📚 History & Analysis
- View all past checks
- Inline graph visualization
- Multi-equipment comparison
- Export historical data

### 📊 Data Monitoring
- Historical trend analysis
- Configurable thresholds
- Time range filtering
- Color-coded equipment display

---

## 📁 Project Structure

```
Pengecekan_Jatsc/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Daily Check, History, Monitoring
│   │   ├── hooks/           # API utilities
│   │   ├── utils/           # Export & debug tools
│   │   └── styles/          # Design tokens
│   └── package.json
├── backend/                  # Node.js + Express
│   ├── src/
│   │   ├── index.js        # Server entry
│   │   ├── models.js       # Database models
│   │   └── routes.js       # API endpoints
│   └── package.json
├── package.json            # Root commands
└── README.md               # This file
```

---

## 🔧 Available Commands

```bash
# Start both frontend and backend
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Install all dependencies
npm install-all

# Build frontend for production
npm run build
```

---

## 💾 Database

SQLite database is automatically created at:
```
backend/jatsc_inspections.db
```

Tables:
- `DailyChecks` - Daily inspection sessions
- `DailyCheckPersonnels` - Team members per check
- `DailyCheckReadings` - Equipment readings
- `Thresholds` - Min/max alert values

---

## 🌐 API Endpoints

All endpoints are localhost:5000 - perfect for AirNav private network!

### Daily Checks
- `GET /api/daily-checks` - List all checks
- `GET /api/daily-check/:id` - Get check details
- `POST /api/daily-check/start` - Start new check
- `POST /api/daily-check/:id/stop` - Complete check

### Personnel
- `POST /api/daily-check/:id/personnel` - Add team member
- `DELETE /api/personnel/:id` - Remove team member

### Readings
- `POST /api/daily-check/:id/reading` - Record reading
- `DELETE /api/reading/:id` - Remove reading

### Thresholds
- `GET /api/thresholds` - List thresholds
- `POST /api/thresholds` - Create threshold
- `PUT /api/thresholds/:id` - Update threshold

### Monitoring
- `GET /api/data-monitoring/readings` - Historical data

---

## 📊 Equipment Types

Supported equipment:
- **Chiller (180 TR)** - Voltage (R,S,T) + Temperature (In/Out)
- **Pump** - Voltage (R,S,T)
- **AHU** - Voltage (R,S,T)

---

## ⚙️ Configuration

### Change Backend Port
Edit `backend/src/index.js`:
```javascript
const PORT = 5000; // Change here
```

### Change Frontend Port
Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 5173 // Change here
}
```

---

## 🛠️ Troubleshooting

### Port Already in Use

**Kill existing processes:**
```bash
# macOS/Linux
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
taskkill /F /IM node.exe
```

### Dependencies Installation Fails

```bash
# Clear cache and reinstall
npm cache clean --force
npm install-all
```

### Backend Won't Start

```bash
cd backend
npm install
npm run dev
```

---

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🔐 Security Notes

- Localhost only (perfect for private network)
- CORS enabled for localhost
- No authentication layer (internal use)
- SQLite suitable for single server

---

## 📚 Technology Stack

### Frontend
- React 19
- Vite 8.2.2
- Recharts (graphs)
- html2canvas (export)
- jsPDF (PDF generation)

### Backend
- Node.js 16+
- Express 4.18
- Sequelize ORM
- SQLite3

---

## 🚀 Deployment on AirNav Network

1. Clone repository on AirNav server
2. Run `npm install`
3. Run `npm run dev`
4. Access from any device on AirNav network:
   ```
   http://<server-ip>:5173
   ```

---

## 📞 Support

Check browser console (F12) for errors. Backend logs show in terminal.

---

## 📄 License

Proprietary - JATSC

---

## 👨‍💻 Version

v2.0.0 - Node.js Edition (100% JavaScript stack)

Built with ❤️ for JATSC
