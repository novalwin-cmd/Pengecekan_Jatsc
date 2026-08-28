# Visual Implementation Guide - Two-Level Approval Workflow

## Component Structure

```
DailyCheckComplete
├── Summary Cards (Date, Time, Personnel, Readings)
├── Reading Breakdown
├── Monitoring Graphs
├── Personnel Section
├── 🆕 ApprovalChecklist Component
│   ├── Header
│   ├── Completion Banner (when both approved)
│   ├── Supervisor Section (Step 1)
│   │   ├── Name Input
│   │   ├── Signature Canvas + Capture
│   │   └── Approve Button
│   └── Technical Manager Section (Step 2, locked until Step 1)
│       ├── Name Input
│       ├── Signature Canvas + Capture
│       └── Approve Button
├── Export Section
│   ├── CSV Export (always available)
│   ├── XLSX Export (always available)
│   └── PDF Export (locked until both approvals)
└── Action Buttons
```

## Screen States Flowchart

```
┌─────────────────────────────────┐
│   DAILY CHECK COMPLETED         │
│   (No approvals yet)            │
└──────────────┬──────────────────┘
               │
        ┌──────▼──────────┐
        │ STEP 1: READY   │
        │ SUPERVISOR      │
        └──────┬──────────┘
               │
        ┌──────▼──────────────────────┐
        │ User enters:                │
        │ 1. Supervisor name          │
        │ 2. Draws signature on canvas│
        │ 3. Clicks Capture           │
        │ 4. Clicks Approve Button    │
        └──────┬──────────────────────┘
               │
        ┌──────▼──────────────────────┐
        │ API POST to backend         │
        │ /approve-supervisor         │
        └──────┬──────────────────────┘
               │
        ┌──────▼──────────────────────┐
        │ Backend validates:          │
        │ ✓ Name not empty            │
        │ ✓ Signature not empty       │
        │ ✓ Generate timestamp        │
        └──────┬──────────────────────┘
               │
        ┌──────▼──────────────────────┐
        │ Database saved              │
        │ supervisor_approved = true  │
        │ supervisor_name = ...       │
        │ supervisor_signature = ...  │
        │ supervisor_approved_at = ..│
        └──────┬──────────────────────┘
               │
        ┌──────▼────────────────────────┐
        │ STEP 1 COMPLETE ✓              │
        │ Section now shows:             │
        │ • Supervisor name              │
        │ • Approval timestamp           │
        │ • Signature preview            │
        │ • Remove approval button       │
        └──────┬────────────────────────┘
               │
        ┌──────▼──────────────────────┐
        │ STEP 2: NOW AVAILABLE       │
        │ TECHNICAL MANAGER           │
        │ (Previously locked 🔒)      │
        │ Section unlocked             │
        └──────┬──────────────────────┘
               │
        ┌──────▼──────────────────────────┐
        │ User enters:                    │
        │ 1. Tech Manager name            │
        │ 2. Draws signature on canvas    │
        │ 3. Clicks Capture               │
        │ 4. Clicks Approve Button        │
        └──────┬──────────────────────────┘
               │
        ┌──────▼────────────────────────────────────┐
        │ API POST to backend                      │
        │ /approve-technical-manager               │
        │ Backend checks:                          │
        │ ✗ Is supervisor_approved = true? (YES)   │
        │ ✓ Name not empty? (YES)                  │
        │ ✓ Signature not empty? (YES)             │
        │ ✓ Generate timestamp                    │
        └──────┬────────────────────────────────────┘
               │
        ┌──────▼──────────────────────┐
        │ Database saved              │
        │ technical_manager_appr = T  │
        │ technical_manager_name = ..│
        │ technical_manager_sig = .. │
        │ technical_manager_at = ... │
        └──────┬──────────────────────┘
               │
        ┌──────▼────────────────────────────────┐
        │ ✅ BOTH APPROVALS COMPLETE            │
        │ • Approval banner shows               │
        │ • PDF button enables                  │
        │ • "✅ PDF" appears                     │
        │ • User can now export PDF             │
        └────────────────────────────────────────┘
```

## UI Layout Examples

### State 1: Initial (No Approvals)

```
╔════════════════════════════════════════════════════╗
║ ✅ Approval Checklist                              ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║ 1️⃣  Supervisor Approval                           ║
║                                                    ║
║ [Supervisor Name]                                 ║
║ ┌──────────────────────────────────────────┐     ║
║ │ Enter full name                          │     ║
║ └──────────────────────────────────────────┘     ║
║                                                    ║
║ Supervisor Signature *                            ║
║ ╔════════════════════════════════════════════╗    ║
║ ║                                            ║    ║
║ ║  [Draw signature here with mouse/touch]  ║    ║
║ ║                                            ║    ║
║ ╚════════════════════════════════════════════╝    ║
║ Draw signature above                               ║
║                                                    ║
║ [🗑️ Clear] [📸 Capture]                           ║
║                                                    ║
║ ┌────────────────────────────────────────────┐   ║
║ │ 👤 Approve as Supervisor  (disabled)       │   ║
║ └────────────────────────────────────────────┘   ║
║                                                    ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║ 2️⃣  Technical Manager Approval                    ║
║ ⏳ Waiting for Supervisor                         ║
║ ╭────────────────────────────────────────────╮   ║
║ │ 🔒                                          │   ║
║ │ This step is locked until Supervisor       │   ║
║ │ approves the daily check                   │   ║
║ ╰────────────────────────────────────────────╯   ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

### State 2: Supervisor Approved

```
╔════════════════════════════════════════════════════╗
║ ✅ Approval Checklist                              ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║ 1️⃣  Supervisor Approval                    ✓     ║
║                                                    ║
║ Name:      John Doe                               ║
║ Approved:  2026-08-28 14:30:00 ID                ║
║                                                    ║
║ ┌──────────────────────────────────────────┐     ║
║ │  [Signature image preview displayed]     │     ║
║ └──────────────────────────────────────────┘     ║
║                                                    ║
║ [🔄 Remove Approval]                              ║
║                                                    ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║ 2️⃣  Technical Manager Approval                    ║
║                                                    ║
║ [Technical Manager Name]                          ║
║ ┌──────────────────────────────────────────┐     ║
║ │ Enter full name                          │     ║
║ └──────────────────────────────────────────┘     ║
║                                                    ║
║ Technical Manager Signature *                     ║
║ ╔════════════════════════════════════════════╗    ║
║ ║                                            ║    ║
║ ║  [Draw signature here with mouse/touch]  ║    ║
║ ║                                            ║    ║
║ ╚════════════════════════════════════════════╝    ║
║ Draw signature above                               ║
║                                                    ║
║ [🗑️ Clear] [📸 Capture]                           ║
║                                                    ║
║ ┌────────────────────────────────────────────┐   ║
║ │ 👔 Approve as Technical Manager (disabled) │   ║
║ └────────────────────────────────────────────┘   ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

### State 3: Both Approved (Ready for PDF Export)

```
╔════════════════════════════════════════════════════╗
║ ✅ Approval Checklist                              ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║ 🎉 All approvals completed - PDF export is now   ║
║    available                                      ║
║                                                    ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║ 1️⃣  Supervisor Approval                    ✓     ║
║                                                    ║
║ Name:      John Doe                               ║
║ Approved:  2026-08-28 14:30:00 IDN                ║
║                                                    ║
║ ┌──────────────────────────────────────────┐     ║
║ │  [Signature image preview]               │     ║
║ └──────────────────────────────────────────┘     ║
║                                                    ║
║ [🔄 Remove Approval]                              ║
║                                                    ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║ 2️⃣  Technical Manager Approval             ✓     ║
║                                                    ║
║ Name:      Jane Smith                             ║
║ Approved:  2026-08-28 14:35:00 IDN                ║
║                                                    ║
║ ┌──────────────────────────────────────────┐     ║
║ │  [Signature image preview]               │     ║
║ └──────────────────────────────────────────┘     ║
║                                                    ║
║ [🔄 Remove Approval]                              ║
║                                                    ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║ 📥 Export Data                                     ║
║                                                    ║
║ Download this daily check in your preferred       ║
║ format:                                            ║
║                                                    ║
║ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ ║
║ │ 📄 CSV       │ │ 📊 XLSX      │ │ ✅ PDF     │ ║
║ │              │ │              │ │            │ ║
║ │ Available    │ │ Available    │ │ UNLOCKED ✓ │ ║
║ └──────────────┘ └──────────────┘ └────────────┘ ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

## Signature Canvas Interaction

### Canvas Drawing States

```
1. EMPTY STATE
   ╭─────────────────────────────────╮
   │                                 │
   │    Draw signature above         │
   │    (cursor: crosshair)          │
   │                                 │
   │    [empty space]                │
   │                                 │
   ╰─────────────────────────────────╯

2. DRAWING STATE
   ╭─────────────────────────────────╮
   │                                 │
   │     ╱╲     ╱                   │
   │    ╱  ╲   ╱   ╱╲ ╱╲            │
   │   ╱    ╲ ╱   ╱  ╲╱             │
   │                                 │
   ╰─────────────────────────────────╯
   [In progress, user drawing]

3. CAPTURED STATE
   ╭─────────────────────────────────╮
   │                                 │
   │     ╱╲     ╱                   │
   │    ╱  ╲   ╱   ╱╲ ╱╲            │
   │   ╱    ╲ ╱   ╱  ╲╱             │
   │                                 │
   ╰─────────────────────────────────╯
   [Saved - now shows preview below]

   ✓ Signature captured
   ┌─────────────────────────────────┐
   │  [Signature thumbnail preview]  │
   └─────────────────────────────────┘
```

## Export Section States

### Without Approvals
```
📥 Export Data

Download this daily check in your preferred format:

⚠️ PDF export requires both Supervisor and 
   Technical Manager approvals

┌──────────────┐ ┌──────────────┐ ┌────────────┐
│ 📄 CSV       │ │ 📊 XLSX      │ │ 📋 PDF     │
│              │ │              │ │ (Locked)   │
│ ✅ Available │ │ ✅ Available │ │ 🔒 LOCKED  │
└──────────────┘ └──────────────┘ └────────────┘
```

### With All Approvals
```
📥 Export Data

Download this daily check in your preferred format:

┌──────────────┐ ┌──────────────┐ ┌────────────┐
│ 📄 CSV       │ │ 📊 XLSX      │ │ ✅ PDF     │
│              │ │              │ │            │
│ ✅ Available │ │ ✅ Available │ │ ✅ READY   │
└──────────────┘ └──────────────┘ └────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────┐
│   USER INTERFACE (React Component)      │
│  ApprovalChecklist.jsx                  │
├─────────────────────────────────────────┤
│ • Canvas drawing (signature capture)    │
│ • Form inputs (name field)              │
│ • Button handlers (approve/remove)      │
└──────────────┬──────────────────────────┘
               │
               ▼
      ┌─────────────────┐
      │  useApiPost()   │
      │  (React Hook)   │
      └────────┬────────┘
               │
               ▼
    ┌──────────────────────┐
    │ BACKEND API ENDPOINTS│
    ├──────────────────────┤
    │ /approve-supervisor  │
    │ /approve-tech-mgr    │
    └────────┬─────────────┘
             │
             ▼
  ┌─────────────────────────┐
  │ VALIDATION LAYER        │
  ├─────────────────────────┤
  │ • Check name not empty  │
  │ • Check signature exists│
  │ • Check prerequisites   │
  │   (supervisor first)    │
  └────────┬────────────────┘
           │
           ▼
  ┌─────────────────────────┐
  │ DATABASE (SQLite)       │
  ├─────────────────────────┤
  │ daily_checks table      │
  │ • supervisor_approved   │
  │ • supervisor_name       │
  │ • supervisor_signature  │
  │ • supervisor_approved_at│
  │ • tech_mgr_approved     │
  │ • tech_mgr_name         │
  │ • tech_mgr_signature    │
  │ • tech_mgr_approved_at  │
  └─────────────────────────┘
```

## Responsive Breakpoints

### Desktop (> 600px)
- Two columns optional, full form width
- Signature canvas: 400px × 150px
- Full buttons side by side

### Tablet (600px - 1024px)
- Single column layout
- Signature canvas: 100% width
- Responsive font sizes

### Mobile (< 600px)
- Stack all elements vertically
- Signature canvas: 100% width max 300px
- Full-width buttons
- Smaller font sizes
- Touch-optimized for drawing

## Color Scheme

```
PRIMARY COLORS:
├── Supervisor (Step 1): #E3F2FD (light blue), #1976D2 (blue)
├── Technical Manager (Step 2): #E3F2FD, #1976D2
├── Completed: #E8F5E9 (light green), #4CAF50 (green)
└── Pending/Locked: #FFF3CD (light yellow), #FFC107 (yellow)

BUTTON COLORS:
├── Success (Approve): #4CAF50 (green)
├── Primary (Capture): #1976D2 (blue)
├── Secondary (Clear): #757575 (gray)
├── Danger (Remove): #D32F2F (red)
└── Disabled: #999 (light gray)

BACKGROUND:
├── Section: #FFFFFF (white)
├── Canvas: #FAFAFA (off-white)
├── Form Input: #FFFFFF (white)
└── Disabled Section: #FAFAFA (off-white)
```

## Animation & Transitions

```
• Approval completion banner: slideIn (0.4s)
• Button hover: elevation + color change (0.2s)
• Canvas border on hover: color change (0.2s)
• Form input focus: box-shadow + background (0.2s)
• All transitions: ease or ease-out
```

## Accessibility Features

```
✓ ARIA labels on form inputs
✓ Form input focus states (visible outline)
✓ Semantic HTML (labels, buttons)
✓ Color not only indicator (badges, text)
✓ Tab navigation support
✓ Error messages for validation
✓ Success feedback for actions
✓ Loading states visible to user
```

---

**This visual guide complements the technical implementation**
See `IMPLEMENTATION_SUMMARY.md` for technical details
