/**
 * JATSC Inspection System - Application Constants
 * Centralized configuration for API, equipment types, and settings
 */

export const API_BASE_URL = 'http://127.0.0.1:5000/api';

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

export const VIEWS = {
  NEW_INSPECTION: 'new-inspection',
  HISTORY: 'history',
  DAILY_CHECK: 'daily-check',
  DATA_MONITORING: 'data-monitoring',
};

export const SHIFTS = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  NIGHT: 'Night',
};

export const ROLES = [
  'Operator',
  'Supervisor',
  'Technician',
  'Manager',
  'Other'
];
