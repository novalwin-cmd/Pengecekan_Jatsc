/**
 * JATSC Inspection System - Application Constants
 * Comprehensive configuration for all 4 logsheets with complete parameter definitions
 */

// Local development - connect to backend on port 3002
export const API_BASE_URL = 'http://localhost:3002/api';

// ============================================================================
// LEGACY CONSTANTS (Keep for backward compatibility)
// ============================================================================

export const EQUIPMENT_TYPES = {
  CHILLER: 'chiller',
  PUMP: 'pump',
  AHU: 'ahu',
};

export const EQUIPMENT_LABELS = {
  chiller: '❄️ CHILLER (180 TR)',
  pump: '💧 POMPA',
  ahu: '🌬️ AHU',
};

export const EQUIPMENT_FIELDS = {
  chiller: [
    { name: 'location', label: 'Lokasi', type: 'text', required: true },
    { name: 'peralatan', label: 'Peralatan', type: 'text', required: true },
    { name: 'R', label: 'R (V)', type: 'number', step: '0.1' },
    { name: 'S', label: 'S (V)', type: 'number', step: '0.1' },
    { name: 'T', label: 'T (V)', type: 'number', step: '0.1' },
    { name: 'in_temp', label: 'Temp In (°C)', type: 'number', step: '0.1' },
    { name: 'out_temp', label: 'Temp Out (°C)', type: 'number', step: '0.1' },
    { name: 'keterangan', label: 'Keterangan', type: 'text' },
  ],
  pump: [
    { name: 'location', label: 'Lokasi', type: 'text', required: true },
    { name: 'peralatan', label: 'Peralatan', type: 'text', required: true },
    { name: 'R', label: 'R (V)', type: 'number', step: '0.1' },
    { name: 'S', label: 'S (V)', type: 'number', step: '0.1' },
    { name: 'T', label: 'T (V)', type: 'number', step: '0.1' },
    { name: 'keterangan', label: 'Keterangan', type: 'text' },
  ],
  ahu: [
    { name: 'location', label: 'Lokasi', type: 'text', required: true },
    { name: 'peralatan', label: 'Peralatan', type: 'text', required: true },
    { name: 'R', label: 'R (V)', type: 'number', step: '0.1' },
    { name: 'S', label: 'S (V)', type: 'number', step: '0.1' },
    { name: 'T', label: 'T (V)', type: 'number', step: '0.1' },
    { name: 'keterangan', label: 'Keterangan', type: 'text' },
  ],
};

export const DEFAULT_READING = {
  chiller: {
    location: '',
    peralatan: '',
    R: '',
    S: '',
    T: '',
    in_temp: '',
    out_temp: '',
    keterangan: '',
  },
  pump: {
    location: '',
    peralatan: '',
    R: '',
    S: '',
    T: '',
    keterangan: '',
  },
  ahu: {
    location: '',
    peralatan: '',
    R: '',
    S: '',
    T: '',
    keterangan: '',
  },
};

// ============================================================================
// NEW: COMPREHENSIVE LOGSHEET DEFINITIONS (All 4 Logsheets)
// ============================================================================

export const LOGSHEET_CATEGORIES = {
  BEBAN_LISTRIK: 'beban_listrik',
  STS: 'sts',
  UPS: 'ups',
  MDS: 'mds',
};

// Category metadata
export const CATEGORY_INFO = {
  beban_listrik: {
    id: 'beban_listrik',
    name: '⚡ Pengecekan Harian Beban Listrik Tower JATSC',
    icon: '⚡',
    description: 'Monitoring beban listrik dan distribusi daya',
    color: '#FFA500',
  },
  sts: {
    id: 'sts',
    name: '🔄 Pengecekan Harian STS Tower JATSC',
    icon: '🔄',
    description: 'Pemeriksaan Static Transfer Switch dan switching',
    color: '#4169E1',
  },
  ups: {
    id: 'ups',
    name: '🔋 Pengecekan Harian UPS 200 KVA & 20 KVA JATSC',
    icon: '🔋',
    description: 'Monitoring Uninterruptible Power Supply dan battery',
    color: '#228B22',
  },
  mds: {
    id: 'mds',
    name: '📊 Pengecekan Harian MDS Tower JATSC',
    icon: '📊',
    description: 'Pemeriksaan Main Distribution Switchboard',
    color: '#DC143C',
  },
};

// ============================================================================
// BEBAN LISTRIK - Equipment & Parameters
// ============================================================================

export const BEBAN_LISTRIK_EQUIPMENT = [
  'P713',
  'T705A',
  'CHILLER 1',
  'CHILLER 2',
  'CHILLER 3',
  'MDS T7 LCA',
  'MDS T7 LCB',
  'MDS P7 LCA',
  'MDS P7 LCB',
  'TRAFO T-7A',
  'TRAFO T-7B',
  'TRAFO P-7A',
  'TRAFO P-7B',
];

// Field groups for Beban Listrik
export const BEBAN_LISTRIK_FIELD_GROUPS = [
  {
    name: 'Identifikasi',
    fields: [
      { name: 'peralatan', label: 'Equipment/Peralatan', type: 'select', options: BEBAN_LISTRIK_EQUIPMENT, required: true },
    ],
  },
  {
    name: 'Parameter Elektrikal - Tegangan',
    fields: [
      { name: 'tegangan_r', label: 'Tegangan R (V)', type: 'number', step: '0.01', placeholder: '220' },
      { name: 'tegangan_s', label: 'Tegangan S (V)', type: 'number', step: '0.01', placeholder: '220' },
      { name: 'tegangan_t', label: 'Tegangan T (V)', type: 'number', step: '0.01', placeholder: '220' },
    ],
  },
  {
    name: 'Parameter Elektrikal - Arus',
    fields: [
      { name: 'arus_r', label: 'Arus R (A)', type: 'number', step: '0.1', placeholder: '0' },
      { name: 'arus_s', label: 'Arus S (A)', type: 'number', step: '0.1', placeholder: '0' },
      { name: 'arus_t', label: 'Arus T (A)', type: 'number', step: '0.1', placeholder: '0' },
    ],
  },
  {
    name: 'Parameter Elektrikal - Lainnya',
    fields: [
      { name: 'cos_phi', label: 'COS φ (Power Factor)', type: 'number', step: '0.01', min: '0', max: '1', placeholder: '0.95' },
      { name: 'kwh', label: 'KWH (Stand Meter)', type: 'number', step: '0.1', placeholder: '0' },
    ],
  },
  {
    name: 'Parameter Termal & Status',
    fields: [
      { name: 'suhu', label: 'Suhu (°C)', type: 'number', step: '0.1', placeholder: '25' },
      { name: 'status', label: 'Status Operasional', type: 'select', options: ['NORMAL', 'U/S', 'GANGGUAN', 'PERBAIKAN'], required: true },
    ],
  },
  {
    name: 'Catatan',
    fields: [
      { name: 'keterangan', label: 'Catatan/Keterangan', type: 'textarea', placeholder: 'Catatan tambahan (opsional)' },
    ],
  },
];

// ============================================================================
// STS - Equipment & Parameters
// ============================================================================

export const STS_EQUIPMENT = [
  'ESS',
  'AMSC',
  'MER',
  'PROCESSING ROOM',
  'OPS ROOM 1',
  'MDS',
  'OPS ROOM 2',
  'BILLING SYSTEM',
  'TER',
];

export const STS_FIELD_GROUPS = [
  {
    name: 'Identifikasi',
    fields: [
      { name: 'peralatan', label: 'Unit/Ruangan STS', type: 'select', options: STS_EQUIPMENT, required: true },
    ],
  },
  {
    name: 'Parameter Tegangan (Volt)',
    fields: [
      { name: 'tegangan_r', label: 'TR - Phase R to N (V)', type: 'number', step: '0.1', placeholder: '220' },
      { name: 'tegangan_s', label: 'TS - Phase S to N (V)', type: 'number', step: '0.1', placeholder: '220' },
      { name: 'tegangan_t', label: 'TT - Phase T to N (V)', type: 'number', step: '0.1', placeholder: '220' },
    ],
  },
  {
    name: 'Parameter Arus (Ampere)',
    fields: [
      { name: 'arus_r', label: 'AR - Phase R (A)', type: 'number', step: '0.1', placeholder: '0' },
      { name: 'arus_s', label: 'AS - Phase S (A)', type: 'number', step: '0.1', placeholder: '0' },
      { name: 'arus_t', label: 'AT - Phase T (A)', type: 'number', step: '0.1', placeholder: '0' },
    ],
  },
  {
    name: 'Parameter Sistem',
    fields: [
      { name: 'suhu', label: 'Suhu Operasional (°C)', type: 'number', step: '0.1', placeholder: '25' },
      { name: 'frekuensi', label: 'Frekuensi (Hz)', type: 'number', step: '0.01', placeholder: '50.00' },
    ],
  },
  {
    name: 'Status Saklar/Switch',
    fields: [
      { name: 'switch_status', label: 'Status Switch', type: 'select', options: ['ON', 'STANDBY', 'OFF'], required: true },
    ],
  },
  {
    name: 'Status Operasional',
    fields: [
      { name: 'status', label: 'Status Operasional', type: 'select', options: ['NORMAL', 'U/S', 'GANGGUAN', 'PERBAIKAN'], required: true },
    ],
  },
  {
    name: 'Catatan',
    fields: [
      { name: 'keterangan', label: 'Catatan/Keterangan', type: 'textarea', placeholder: 'Catatan tambahan (opsional)' },
    ],
  },
];

// ============================================================================
// UPS - Equipment & Parameters
// ============================================================================

export const UPS_EQUIPMENT = [
  'UPS 1 200 KVA',
  'UPS 2 200 KVA',
  'PDB 200 KVA 1',
  'PDB 200 KVA 2',
  'UPS 20 KVA',
  'PDB 20 KVA',
];

export const UPS_FIELD_GROUPS = [
  {
    name: 'Identifikasi',
    fields: [
      { name: 'peralatan', label: 'Unit UPS/PDB', type: 'select', options: UPS_EQUIPMENT, required: true },
    ],
  },
  {
    name: 'Rectifier - Input',
    fields: [
      { name: 'rectifier_i_in', label: 'Rectifier I-in R/S/T (A)', type: 'text', placeholder: 'Contoh: 45.5/45.2/45.1' },
      { name: 'rectifier_v_in', label: 'Rectifier V-in R/S/T (V)', type: 'text', placeholder: 'Contoh: 380/380/380' },
      { name: 'arus_rectifier', label: 'Arus Rectifier Total/DC (A)', type: 'number', step: '0.1', placeholder: '0' },
    ],
  },
  {
    name: 'Inverter - Output',
    fields: [
      { name: 'inverter_v_out', label: 'Inverter V-out (V)', type: 'text', placeholder: 'Contoh: 220/220/220' },
      { name: 'inverter_i_out', label: 'Inverter I-out (A)', type: 'text', placeholder: 'Contoh: 80/80/80' },
      { name: 'arus_inverter', label: 'Arus Inverter Total (A)', type: 'number', step: '0.1', placeholder: '0' },
    ],
  },
  {
    name: 'Bypass & Voltase',
    fields: [
      { name: 'tegangan_bypass', label: 'Tegangan By-pass (V)', type: 'number', step: '0.1', placeholder: '220' },
    ],
  },
  {
    name: 'Parameter Termal',
    fields: [
      { name: 'temp_power', label: 'Temp Modul Power (°C)', type: 'number', step: '0.1', placeholder: '25' },
      { name: 'temp_room', label: 'Temp Ruangan UPS (°C)', type: 'number', step: '0.1', placeholder: '25' },
      { name: 'temp_battery', label: 'Temp Ruang/Modul Baterai (°C)', type: 'number', step: '0.1', placeholder: '25' },
    ],
  },
  {
    name: 'Battery - Charge',
    fields: [
      { name: 'floating_voltage', label: 'Tegangan Float Charger (VDC)', type: 'number', step: '0.01', placeholder: '110' },
      { name: 'arus_battery', label: 'Arus Charge/Discharge Baterai (A)', type: 'number', step: '0.1', placeholder: '0' },
      { name: 'kapasitas_battery', label: 'Kapasitas Baterai (%)', type: 'number', step: '1', min: '0', max: '100', placeholder: '100' },
    ],
  },
  {
    name: 'Status Operasional',
    fields: [
      { name: 'status', label: 'Status Operasional', type: 'select', options: ['NORMAL', 'U/S', 'GANGGUAN', 'PERBAIKAN'], required: true },
    ],
  },
  {
    name: 'Catatan',
    fields: [
      { name: 'keterangan', label: 'Catatan/Keterangan', type: 'textarea', placeholder: 'Catatan tambahan (opsional)' },
    ],
  },
];

// ============================================================================
// MDS - Equipment & Parameters
// ============================================================================

export const MDS_EQUIPMENT = [
  'MDS',
  'MDS T7 LCA',
  'MDS T7 LCB',
  'MDS P7 LCA',
  'MDS P7 LCB',
];

export const MDS_FIELD_GROUPS = [
  {
    name: 'Identifikasi',
    fields: [
      { name: 'peralatan', label: 'Unit MDS/Panel', type: 'select', options: MDS_EQUIPMENT, required: true },
    ],
  },
  {
    name: 'Parameter Tegangan (Volt)',
    fields: [
      { name: 'tegangan_r', label: 'TR - Phase R (V)', type: 'number', step: '0.1', placeholder: '220' },
      { name: 'tegangan_s', label: 'TS - Phase S (V)', type: 'number', step: '0.1', placeholder: '220' },
      { name: 'tegangan_t', label: 'TT - Phase T (V)', type: 'number', step: '0.1', placeholder: '220' },
    ],
  },
  {
    name: 'Parameter Arus (Ampere)',
    fields: [
      { name: 'arus_r', label: 'AR - Phase R (A)', type: 'number', step: '0.1', placeholder: '0' },
      { name: 'arus_s', label: 'AS - Phase S (A)', type: 'number', step: '0.1', placeholder: '0' },
      { name: 'arus_t', label: 'AT - Phase T (A)', type: 'number', step: '0.1', placeholder: '0' },
    ],
  },
  {
    name: 'Parameter Termal - Busbar/Kabel',
    fields: [
      { name: 'suhu_r', label: 'SR - Suhu Phase R (°C)', type: 'number', step: '0.1', placeholder: '25' },
      { name: 'suhu_s', label: 'SS - Suhu Phase S (°C)', type: 'number', step: '0.1', placeholder: '25' },
      { name: 'suhu_t', label: 'ST - Suhu Phase T (°C)', type: 'number', step: '0.1', placeholder: '25' },
    ],
  },
  {
    name: 'Status Saklar/Switch',
    fields: [
      { name: 'switch_status', label: 'Status Switch', type: 'select', options: ['ON', 'STANDBY', 'OFF'], required: true },
    ],
  },
  {
    name: 'Status Operasional',
    fields: [
      { name: 'status', label: 'Status Operasional', type: 'select', options: ['NORMAL', 'U/S', 'GANGGUAN', 'PERBAIKAN'], required: true },
    ],
  },
  {
    name: 'Catatan',
    fields: [
      { name: 'keterangan', label: 'Catatan/Keterangan', type: 'textarea', placeholder: 'Catatan tambahan (opsional)' },
    ],
  },
];

// ============================================================================
// All categories consolidated
// ============================================================================

export const LOGSHEET_DEFINITIONS = {
  beban_listrik: {
    category: LOGSHEET_CATEGORIES.BEBAN_LISTRIK,
    name: 'Pengecekan Harian Beban Listrik Tower JATSC',
    equipment: BEBAN_LISTRIK_EQUIPMENT,
    fieldGroups: BEBAN_LISTRIK_FIELD_GROUPS,
  },
  sts: {
    category: LOGSHEET_CATEGORIES.STS,
    name: 'Pengecekan Harian STS Tower JATSC',
    equipment: STS_EQUIPMENT,
    fieldGroups: STS_FIELD_GROUPS,
  },
  ups: {
    category: LOGSHEET_CATEGORIES.UPS,
    name: 'Pengecekan Harian UPS 200 KVA & 20 KVA JATSC',
    equipment: UPS_EQUIPMENT,
    fieldGroups: UPS_FIELD_GROUPS,
  },
  mds: {
    category: LOGSHEET_CATEGORIES.MDS,
    name: 'Pengecekan Harian MDS Tower JATSC',
    equipment: MDS_EQUIPMENT,
    fieldGroups: MDS_FIELD_GROUPS,
  },
};

// ============================================================================
// General Constants (Keep existing)
// ============================================================================

export const VIEWS = {
  NEW_INSPECTION: 'new-inspection',
  HISTORY: 'history',
  DAILY_CHECK: 'daily-check',
  DATA_MONITORING: 'data-monitoring',
};

export const SHIFTS = {
  MORNING: 'Morning',
  NIGHT: 'Night',
};

export const ROLES = [
  'Operator',
  'Supervisor',
  'Technician',
  'Manager',
  'Other'
];

export const CONCEPT_TYPES = {
  INSPECTION: 'Inspection',
  PREVENTIVE: 'Preventive',
  CORRECTIVE: 'Corrective',
};
