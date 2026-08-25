# JATSC Inspection System

A professional web-based equipment monitoring and inspection system with real-time data collection, historical analysis, and threshold-based anomaly detection.

## 🎯 Features

### ✓ Daily Check Workflow
- Start/stop inspection sessions with date, shift, and time tracking
- Personnel management (add team members during checks)
- Multi-equipment data entry (Chiller 180TR, Pump, AHU)
- Real-time anomaly detection based on configurable thresholds
- Notes and metadata per session

### 📚 History & Analysis
- View all completed daily checks
- Inline expansion with detailed readings
- Multi-equipment comparison on single graph
- Equipment-specific threshold visualization
- Export to CSV, XLSX, PDF formats

### 📊 Data Monitoring Dashboard
- Historical trend analysis with Recharts
- Multi-select equipment display (all on one graph)
- Multiple time range views (Monthly, 6-Month, Yearly)
- Threshold management interface
- Color-coded equipment (Blue/Green/Amber)
- Voltage and temperature parameter tracking

### ⚡ Advanced Capabilities
- Real-time anomaly detection and flagging
- Configurable min/max thresholds per equipment
- Alert levels (Warning/Critical)
- Multi-format data export (CSV, XLSX, PDF)
- Responsive design (Desktop/Tablet/Mobile)
- Professional design system with Electric Blue/Emerald/Amber palette

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** React 19 + Vite 8.2.2 + Recharts
- **Backend:** Flask 2.3.3 + SQLAlchemy 2.0.23
- **Database:** SQLite
- **Styling:** CSS Grid + Design Token System

### Project Structure
```
jatsc-inspection-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Shell.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── DailyCheck/
│   │   │   │   ├── index.jsx
│   │   │   │   ├── DailyCheckStart.jsx
│   │   │   │   ├── DailyCheckActive.jsx
│   │   │   │   ├── DailyCheckComplete.jsx
│   │   │   │   └── DailyCheck.css
│   │   │   ├── History/
│   │   │   │   ├── HistoryList.jsx
│   │   │   │   ├── HistoryDetail.jsx
│   │   │   │   └── History.css
│   │   │   ├── DataMonitoring/
│   │   │   │   ├── index.jsx
│   │   │   │   ├── GraphViewer.jsx
│   │   │   │   ├── GraphViewerMulti.jsx
│   │   │   │   ├── ThresholdManager.jsx
│   │   │   │   └── DataMonitoring.css
│   │   │   ├── Toast.jsx
│   │   │   └── Toast.css
│   │   ├── config/constants.js
│   │   ├── hooks/useApi.js
│   │   ├── hooks/useExport.js
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   ├── layout.css
│   │   │   └── components.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── models.py
│   ├── app.py
│   └── requirements.txt
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+

### Installation

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd frontend
npm install
```

### Running the Application

#### Option 1: Start Everything with One Command (Recommended)
```bash
./START.sh
```

This will:
- ✅ Start Backend on http://127.0.0.1:5000
- ✅ Start Frontend on http://localhost:5173
- ✅ Wait for both services to be ready
- ✅ Show URLs and logs

#### Option 2: Start Backend and Frontend Separately

**Start Backend**
```bash
cd backend
python3 app.py
# Backend runs on http://127.0.0.1:5000
```

**Start Frontend (in new terminal)**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

#### Option 3: Use Individual Start Scripts
```bash
# Terminal 1
./START_BACKEND.sh

# Terminal 2
./START_FRONTEND.sh
```

---

## 📱 Application Views

### 1. Daily Check (✓)
- **Purpose:** Primary data entry point
- **Features:** 
  - Session start with date/shift/time
  - Personnel management
  - Equipment readings (Chiller/Pump/AHU)
  - Export to CSV/XLSX/PDF
  - Anomaly detection

### 2. History (📚)
- **Purpose:** Review and analyze past checks
- **Features:**
  - List of all daily checks
  - Click to expand detailed view
  - Multi-equipment graph comparison (all on one chart)
  - Threshold visualization
  - Filtered readings display

### 3. Monitoring (📊)
- **Purpose:** Historical trend analysis
- **Features:**
  - Multi-equipment selection
  - Combined graph view
  - Parameter selection
  - Time range filtering (Monthly/6-Month/Yearly)
  - Threshold management
  - Color-coded equipment display

---

## 🗄️ Database Schema

### Daily Checks Table
- `id` (PK), `date`, `shift`, `start_time`, `stop_time`, `status`, `notes`, `created_at`, `updated_at`

### Daily Check Personnel
- `id` (PK), `daily_check_id` (FK), `name`, `role`, `sequence`, `added_at`

### Daily Check Readings
- `id` (PK), `daily_check_id` (FK), `equipment_type`, `location`, `peralatan`
- `R`, `S`, `T`, `in_temp`, `out_temp`, `keterangan`
- `timestamp`, `anomaly_detected`, `anomaly_reason`

### Thresholds
- `id` (PK), `equipment_type`, `parameter`
- `min_value`, `max_value`, `alert_level`, `is_active`
- `created_at`, `updated_at`

---

## 🎨 Design System

### Color Palette
- **Primary:** Electric Blue (#0284C7)
- **Success:** Emerald Green (#10B981)
- **Warning:** Amber (#F59E0B)
- **Error:** Red (#EF4444)

### Responsive Breakpoints
- **Desktop:** Full sidebar + main content
- **Tablet (768px):** Sidebar to top nav
- **Mobile:** Single column, touch-friendly (44px targets)

---

## 🔧 API Endpoints

### Daily Checks
- `POST /api/daily-check/start` — Create new session
- `POST /api/daily-check/:id/personnel` — Add personnel
- `POST /api/daily-check/:id/reading` — Record equipment reading
- `POST /api/daily-check/:id/stop` — Complete session
- `GET /api/daily-check/:id` — Get check details
- `GET /api/daily-checks` — List all checks

### Thresholds
- `GET /api/thresholds` — List all thresholds
- `POST /api/thresholds` — Create threshold
- `PUT /api/thresholds/:id` — Update threshold

### Monitoring
- `GET /api/data-monitoring/readings` — Fetch historical readings

---

## ✨ Key Features Explained

### Real-Time Anomaly Detection
Readings are automatically compared against configured thresholds at submission time:
- If value > max_value → `anomaly_detected = true`
- If value < min_value → `anomaly_detected = true`
- Flagged readings appear with red markers on graphs

### Multi-Equipment Graphing
Select multiple equipment types and see them all on ONE combined graph:
- 🔵 Chiller = Blue line
- 🟢 Pump = Green line
- 🟠 AHU = Amber line
- Each equipment shows independent threshold lines

### Configurable Thresholds
Edit min/max values per equipment type:
- Values apply to anomaly detection
- Display as reference lines on graphs
- Alert level indicates severity (Warning/Critical)
- Can be enabled/disabled per equipment

---

## 📊 Data Export

### CSV Format
- Metadata header (Check ID, Date, Shift, etc.)
- Personnel section
- Equipment readings table
- Notes section

### Excel (XLSX)
- **Summary Sheet:** Check metadata and statistics
- **Personnel Sheet:** All team members
- **Readings Sheet:** Complete equipment data

### PDF
- Professional formatted report
- Header with check information
- Personnel list
- Equipment readings table
- Notes section
- Timestamp footer

---

## 🔐 Security Notes

- Backend uses CORS for frontend communication
- Database is SQLite (suitable for single-server deployment)
- No authentication implemented (designed for internal network use)
- All timestamps are server-generated

---

## 📝 Development Notes

### Component Architecture
- **State-based views** (no routing library) for simplicity
- **Reusable parameterized components** (EquipmentTable, GraphViewers)
- **CSS Grid layout** for responsive, mobile-first design
- **Custom hooks** (useApi, useExport) to eliminate boilerplate

### Performance Optimizations
- Recharts for efficient chart rendering
- Lazy loading of history data
- Browser storage for UI preferences
- Efficient timestamp filtering

### Testing Strategy
- Manual testing workflow described in guides
- Test data pre-loaded (14 daily checks, 66+ readings)
- Anomaly detection testable by exceeding thresholds

---

## 🤝 Contributing

When contributing, please:
1. Keep component files focused and single-responsibility
2. Add CSS classes to `components.css` rather than inline styles
3. Use design tokens from `tokens.css` for consistency
4. Update this README for new features

---

## 📄 License

This project is proprietary software for JATSC.

---

## 👨‍💻 Author

Built with Claude Code - AI-assisted full-stack development

---

## 📞 Support

For issues or questions:
1. Check the inline guides in the application
2. Review API response messages
3. Verify threshold configurations
4. Check browser console for frontend errors

---

## 🎉 Version History

- **v1.0.0** (2026-08-25) — Initial release
  - Daily Check workflow with multi-equipment support
  - History view with inline graph comparison
  - Data Monitoring dashboard with multi-equipment graphing
  - Configurable threshold management
  - Multi-format export (CSV/XLSX/PDF)
  - Real-time anomaly detection
  - Professional design system

