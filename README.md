# JATSC Inspection System v2.0

**Professional Equipment Monitoring & Inspection Dashboard**  
*React + Node.js + SQLite | 100% JavaScript Stack*

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Node.js 16+** — [Download](https://nodejs.org/)
- That's all you need! ✨

### Installation

```bash
# 1. Extract project folder
cd jatsc-inspection-system

# 2. Install all dependencies
npm install

# 3. Start the system
npm run dev
```

**Done!** The system is now running:
- 🌐 **Frontend**: http://localhost:5173
- ⚙️ **Backend API**: http://localhost:5000

---

## ⚡ What Happens When You Run `npm run dev`

✅ Starts React frontend (port 5173)  
✅ Starts Node.js backend (port 5000)  
✅ Both run simultaneously  
✅ Hot reload enabled (auto-refresh on code changes)  
✅ One command, complete system

---

## 📋 Features

### 📝 Daily Check Workflow
- **Record equipment readings** for 4 logsheet categories:
  - **Beban Listrik** (Power Load)
  - **STS** (Static Transfer Switch)
  - **UPS** (200 KVA & 20 KVA)
  - **MDS** (Main Distribution Switchboard)
- **3 Inspection Concepts**: Inspection, Preventive, Corrective
- **Add team members** per inspection session
- **Real-time validation** with threshold alerts
- **Export reports** to Excel, PDF, CSV

### 📊 History & Analytics
- View all past inspection sessions
- **Equipment trend graphs** with Recharts
- **Multi-equipment comparison**
- Filter by date, shift, equipment, status
- Search & sort capabilities

### 📈 Data Monitoring
- Historical data analysis
- Equipment performance trends
- Configurable alert thresholds
- Status tracking (NORMAL, U/S, GANGGUAN, PERBAIKAN)
- Real-time incident logging

---

## 📁 Project Structure

```
jatsc-inspection-system/
│
├── frontend/                      # React Application
│   ├── src/
│   │   ├── components/           # Daily Check, History, Monitoring UI
│   │   ├── hooks/                # API call utilities
│   │   ├── utils/                # Export & helper functions
│   │   ├── styles/               # CSS & design tokens
│   │   └── App.jsx               # Main app component
│   ├── vite.config.js            # Frontend config
│   └── package.json
│
├── backend/                       # Node.js + Express Server
│   ├── src/
│   │   ├── index.js              # Server entry & initialization
│   │   ├── models.js             # Sequelize database models
│   │   ├── routes.js             # API route handlers
│   │   └── middleware/           # CORS, validation, auth
│   ├── jatsc_inspections.db      # SQLite database (auto-created)
│   └── package.json
│
├── package.json                  # Root npm commands
├── SPESIFIKASI_DATA_PENGECEKAN_JATSC.md  # Data specification
└── README.md                     # This file
```

---

## 🛠 NPM Commands

```bash
# Development: Start both frontend & backend
npm run dev

# Backend only (port 5000)
npm run dev:backend

# Frontend only (port 5173)
npm run dev:frontend

# Install dependencies for all projects
npm install-all

# Build frontend for production
npm run build
```

---

## 💾 Database

SQLite database is **automatically created** at:
```
backend/jatsc_inspections.db
```

### Database Tables

| Table | Purpose |
| :--- | :--- |
| `daily_check_sessions` | Inspection session metadata (date, shift, category) |
| `equipment_readings` | Individual equipment readings & parameters |
| `Thresholds` | Min/max alert values per parameter |
| `DailyCheckPersonnels` | Team members assigned per session |

---

## 🔌 API Endpoints

**Base URL**: `http://localhost:5000/api`

### Daily Check Sessions
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/daily-checks` | List all sessions |
| `GET` | `/daily-check/:id` | Get session details |
| `POST` | `/daily-check/start` | Start new inspection |
| `POST` | `/daily-check/:id/stop` | Complete inspection |

### Equipment Readings
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/daily-check/:id/reading` | Record equipment reading |
| `GET` | `/daily-check/:id/readings` | Get all readings in session |
| `DELETE` | `/reading/:id` | Remove reading |

### Personnel
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `POST` | `/daily-check/:id/personnel` | Add team member |
| `DELETE` | `/personnel/:id` | Remove team member |

### Monitoring & History
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/data-monitoring/readings` | Get historical data |
| `GET` | `/thresholds` | List alert thresholds |
| `POST` | `/thresholds` | Create threshold |
| `PUT` | `/thresholds/:id` | Update threshold |

---

## 🖥 Equipment Categories

### Beban Listrik (Power Load)
- P713, T705A, CHILLER 1-3
- MDS T7/P7 LCA/LCB
- TRAFO T-7A/B, P-7A/B

### STS (Static Transfer Switch)
- ESS, AMSC, MER
- PROCESSING ROOM, OPS ROOM 1-2
- BILLING SYSTEM, TER

### UPS (200 KVA & 20 KVA)
- UPS 1-2 (200 KVA)
- PDB 200 KVA (1-2)
- UPS 20 KVA, PDB 20 KVA

### MDS (Main Distribution Switchboard)
- MDS, MDS T7 LCA/LCB
- MDS P7 LCA/LCB

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

## 🔧 Troubleshooting

### ❌ Port Already in Use

**Linux/macOS:**
```bash
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Windows:**
```bash
taskkill /F /IM node.exe
```

### ❌ Dependencies Won't Install

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install-all
```

### ❌ Backend Won't Start

```bash
cd backend
npm install
npm run dev
```

### ❌ Frontend Won't Load

- Check console (F12) for errors
- Ensure backend is running (http://localhost:5000)
- Clear browser cache (Ctrl+Shift+Delete)

---

## 📱 Browser Support

| Browser | Min Version |
| :--- | :--- |
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## 🔐 Security & Network

- ✅ **Localhost only** - Perfect for private AirNav network
- ✅ **CORS enabled** for localhost
- ✅ **SQLite** - Single server, no network database needed
- ⚠️ **No authentication layer** - Internal use only
- ⚠️ **HTTP only** - Use in trusted network environments

---

## 🛠 Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite 8.2.2** - Build tool & dev server
- **Recharts** - Data visualization
- **html2canvas** - Screenshot export
- **jsPDF** - PDF generation

### Backend
- **Node.js 16+** - Runtime
- **Express 4.18** - Web framework
- **Sequelize** - ORM
- **SQLite3** - Database

---

## 🚀 Deploy on AirNav Network

1. Clone/extract on AirNav server
2. Run `npm install`
3. Start with `npm run dev`
4. Access from network:
   ```
   http://<server-ip>:5173
   ```

---

## 📖 Documentation

- **Data Specification**: See `SPESIFIKASI_DATA_PENGECEKAN_JATSC.md`
  - 4 logsheet categories
  - 3 inspection concepts
  - Database schema
  - Validation rules

---

## 📞 Support & Debugging

- **Frontend Errors**: Open DevTools (F12) → Console
- **Backend Errors**: Check terminal output
- **Database Issues**: Check `backend/jatsc_inspections.db`
- **Port Conflicts**: Use commands above to kill processes

---

## 📄 License

**Proprietary** - JATSC  
All rights reserved.

---

## 👨‍💻 Version & Credits

**Version**: 2.0.0 (Node.js Edition)  
**Stack**: 100% JavaScript (React + Node.js + SQLite)  
**Built for**: JATSC Equipment Inspection  
**Author**: Clive (novalwin@gmail.com)

Built with ❤️ for JATSC | Last Updated: 26 August 2026
