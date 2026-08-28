# Two-Level Approval Workflow - Technical Manager Approved Checklist

## Overview

The **Technical Manager Approved Checklist** is a digital approval system that requires two sequential levels of approval before a daily check can be exported to PDF. This reduces paper usage and maintains a complete digital audit trail.

## Approval Workflow

```
┌─────────────────────────────────────────────────────────┐
│           DAILY CHECK COMPLETION FLOW                   │
└─────────────────────────────────────────────────────────┘

                    ✅ Daily Check Completed
                              ↓
                    ┌─────────────────────┐
                    │   STEP 1: SUPERVISOR │
                    │    APPROVAL ✓        │
                    └─────────────────────┘
                              ↓
                   [Status: PENDING]
         ┌─ [Supervisor Name Required]
         ├─ [Supervisor Signature Capture]
         ├─ [Timestamp Auto-recorded]
         └─ [Confirm Button]
                              ↓
                   [If Approved ✓]
                              ↓
                    ┌─────────────────────┐
                    │  STEP 2: TECHNICAL  │
                    │  MANAGER APPROVAL ✓ │
                    └─────────────────────┘
                              ↓
              [Status: LOCKED (until Supervisor approves)]
          ┌─ [Technical Manager Name Required]
          ├─ [Technical Manager Signature Capture]
          ├─ [Timestamp Auto-recorded]
          └─ [Confirm Button]
                              ↓
                   [If Both Approved ✓]
                              ↓
                 ┌───────────────────────────┐
                 │  PDF EXPORT UNLOCKED ✓    │
                 │  Digital Logbook Ready    │
                 │  (Printed Paper → Digital)│
                 └───────────────────────────┘
```

## Key Features

### 1. **Sequential Approval (Two-Step Process)**

- **Step 1: Supervisor Approval** (Must happen first)
  - Supervisor enters their name
  - Supervisor provides digital signature via canvas
  - System timestamps the approval automatically
  - Approval is stored with full audit trail

- **Step 2: Technical Manager Approval** (Second step only)
  - **LOCKED** until Supervisor approves
  - Technical Manager enters their name
  - Technical Manager provides digital signature via canvas
  - System timestamps the approval automatically
  - Approval is stored with full audit trail

### 2. **Digital Signature Capture**

- **Canvas-based signature drawing**
  - Real-time drawing on digital canvas
  - Clear and capture buttons for each signature
  - Signature preview showing captured image
  - Base64 encoding for storage in database

- **Signature Features**
  - Touch/mouse support for drawing
  - Visual feedback during drawing
  - Ability to clear and redraw if needed
  - Permanent storage in database

### 3. **PDF Export Control**

- **Available Formats**: CSV, XLSX (always available)
- **PDF Export**: 🔒 **LOCKED** until both approvals complete
  - CSV: Always exportable (no approval needed)
  - XLSX: Always exportable (no approval needed)
  - PDF: ✅ Only available after **BOTH** approvals

- **Visual Indicators**:
  - PDF button shows "📋 PDF (Locked)" when approvals pending
  - PDF button shows "✅ PDF" when ready to export
  - Warning banner displays if PDF not yet available

### 4. **Approval Removal**

- Either approver can remove their approval
- Removes signature and marks approval as unchecked
- System requires confirmation before removal
- Useful for corrections or edits

## Database Schema

### New Columns in `daily_checks` Table

```sql
-- Supervisor Approval Fields
supervisor_approved (BOOLEAN)
supervisor_name (STRING)
supervisor_signature (TEXT) -- Base64 encoded image
supervisor_approved_at (DATETIME)

-- Technical Manager Approval Fields
technical_manager_approved (BOOLEAN)
technical_manager_name (STRING)
technical_manager_signature (TEXT) -- Base64 encoded image
technical_manager_approved_at (DATETIME)
```

## API Endpoints

### Approve as Supervisor

```bash
POST /api/daily-check/:id/approve-supervisor
Content-Type: application/json

{
  "supervisor_approved": true,
  "supervisor_name": "John Doe",
  "supervisor_signature": "data:image/png;base64,iVBORw0KGg..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "supervisor_approved": true,
    "supervisor_name": "John Doe",
    "supervisor_approved_at": "2026-08-28T14:30:00Z"
  }
}
```

### Approve as Technical Manager

```bash
POST /api/daily-check/:id/approve-technical-manager
Content-Type: application/json

{
  "technical_manager_approved": true,
  "technical_manager_name": "Jane Smith",
  "technical_manager_signature": "data:image/png;base64,iVBORw0KGg..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "technical_manager_approved": true,
    "technical_manager_name": "Jane Smith",
    "technical_manager_approved_at": "2026-08-28T14:35:00Z"
  }
}
```

**Error (if Supervisor not approved):**
```json
{
  "success": false,
  "error": "Supervisor must approve before Technical Manager can approve"
}
```

## Frontend Components

### ApprovalChecklist Component

**File**: `frontend/src/components/DailyCheck/ApprovalChecklist.jsx`

**Features**:
- Two-section layout (Supervisor | Technical Manager)
- Real-time signature drawing with canvas API
- Form validation (name + signature required)
- Loading states for each approval
- Toast notifications for user feedback
- Responsive design for mobile and desktop

**Props**:
```javascript
<ApprovalChecklist
  checkId={123}                    // Daily check ID
  checkData={checkData}            // Current check data
  onApprovalChange={handleRefresh} // Callback to refresh check
/>
```

## User Experience Flow

### 1. **Starting State** (Check completed but not approved)
```
✅ Approval Checklist

1️⃣  Supervisor Approval
   [Input: Name] [Canvas: Signature] [Capture] [Approve Button]

2️⃣  Technical Manager Approval 🔒
   [LOCKED: "Waiting for Supervisor approval"]
```

### 2. **After Supervisor Approves**
```
✅ Approval Checklist

1️⃣  Supervisor Approval ✓
   Name: John Doe
   Signed: 2026-08-28 14:30:00
   [Signature Image Preview]
   [Remove Approval Button]

2️⃣  Technical Manager Approval
   [Input: Name] [Canvas: Signature] [Capture] [Approve Button]
```

### 3. **After Both Approve**
```
✅ Approval Checklist
🎉 All approvals completed - PDF export is now available

1️⃣  Supervisor Approval ✓
   Name: John Doe
   Signed: 2026-08-28 14:30:00
   [Signature Image Preview]

2️⃣  Technical Manager Approval ✓
   Name: Jane Smith
   Signed: 2026-08-28 14:35:00
   [Signature Image Preview]

📥 Export Data
📄 CSV  |  📊 XLSX  |  ✅ PDF ← NOW AVAILABLE
```

## Security & Audit Trail

✅ **Complete Audit Trail**:
- Each approval records: name, signature, timestamp
- Approvals are immutable (can only be removed, not edited)
- All changes logged in database
- Timestamp recorded at approval time

✅ **Validation**:
- Technical Manager cannot approve before Supervisor
- Name and signature both required for approval
- Signature must be captured (not blank)
- Form validates before submission

✅ **Data Integrity**:
- Signatures stored as Base64 in database
- Base64 encoding ensures compatibility with all databases
- Signatures are part of exported PDF

## Benefits

### 🌱 **Environmental**
- Eliminates printed paper logbooks
- Digital signatures replace handwritten forms
- PDF export replaces physical printing

### 📋 **Administrative**
- Complete digital audit trail
- Easy to search and retrieve checks
- No lost or damaged physical records
- Timestamp accuracy (system-recorded, not manual)

### 🔒 **Compliance**
- Two-level approval authority
- Clear responsibility chain
- Immutable approval records
- Tamper-evident digital signatures

### ⚡ **Efficiency**
- Quick digital signature capture
- Fast approval process (no printing/scanning)
- Immediate PDF export (no delays)
- Automatic timestamp (no manual entry)

## Configuration & Customization

### Role Configuration
```javascript
// In frontend/src/config/constants.js
export const ROLES = [
  'Supervisor',
  'Technical Manager',
  'Operator',
  'Maintenance'
];

export const APPROVAL_ROLES = {
  SUPERVISOR: 'Supervisor',
  TECHNICAL_MANAGER: 'Technical Manager'
};
```

### Approval Messages
Can be customized in `ApprovalChecklist.jsx` component

### Signature Canvas Size
```javascript
// Current: 400px width × 150px height
// Can be adjusted in ApprovalChecklist.jsx
<canvas width={400} height={150} />
```

## Troubleshooting

### Signature Not Captured
- Ensure mouse/touch input is working
- Canvas area should have dashed border indicating active drawing area
- Use "Clear" button to reset and retry

### Technical Manager Button Still Locked
- Check if Supervisor approval is actually saved (look for ✓ badge)
- Try refreshing the page to sync latest data
- Verify Supervisor name and signature are both visible

### PDF Export Still Shows "Locked"
- Verify both approvals show ✓ badges
- Check browser console for any API errors
- Try refreshing the page

## Support & Maintenance

For questions or issues:
1. Check browser console for error messages
2. Review database for approval records
3. Verify API endpoints are returning expected data
4. Check component logs in React Developer Tools

---

**Version**: 1.0  
**Last Updated**: 2026-08-28  
**System**: JATSC Inspection System - Digital Logbook
