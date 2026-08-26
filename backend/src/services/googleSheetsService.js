/**
 * Google Sheets Integration Service
 * Handles automatic syncing of inspection records to Google Sheets
 * Supports 5 different logsheets + master report
 */

import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load credentials
const credentialsPath = path.join(__dirname, '..', '..', 'jatsc-inspection-credentials.json');
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8'));

// Spreadsheet IDs from the provided links
const SPREADSHEET_IDS = {
  beban_listrik: '1J4liwDYRVWdQa08waxW7iHHj2VQQvtfjsaU_6j03G5s',
  sts: '1UqydOazhXeM4e4wdv0SKxCXdWwv1HK3QDPGZeDJqQWM',
  ups: '1yW9ai8oWg0yuUc1TJJ9S0bwGI2sNE4j0cXfQflquQl4',
  mds: '1yW9ai8oWg0yuUc1TJJ9S0bwGI2sNE4j0cXfQflquQl4',
  master_report: '1syQMjKp7lNI52B3m0_YRV1_XQejJRWv7Odrow32Sh1w'
};

// Sheet names within each spreadsheet
const SHEET_NAMES = {
  beban_listrik: 'Logsheet Beban Listrik',
  sts: 'Logsheet STS',
  ups: 'Logsheet UPS',
  mds: 'Logsheet MDS',
  master_report: 'Master Report'
};

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheetsApi = google.sheets({ version: 'v4', auth });

/**
 * Get appropriate spreadsheet ID based on equipment type/category
 * @param {string} category - Equipment category (beban_listrik, sts, ups, mds)
 * @returns {string} Spreadsheet ID
 */
export function getSpreadsheetId(category) {
  return SPREADSHEET_IDS[category] || SPREADSHEET_IDS.master_report;
}

/**
 * Get sheet name based on category and date
 * Format: DD/MM/YYYY [M|N] - e.g., "26/08/2026 M"
 * @param {string} category - Equipment category
 * @param {Date} date - Check date
 * @param {string} shift - Shift (Morning or Night)
 * @returns {string} Sheet name
 */
export function getSheetName(date, shift) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const shiftCode = shift === 'Morning' ? 'M' : 'N';

  return `${day}/${month}/${year} ${shiftCode}`;
}

/**
 * Convert reading object to row format for Google Sheets
 * Based on SPESIFIKASI_DATA_PENGECEKAN_JATSC.md column definitions
 * @param {Object} reading - DailyCheckReading object
 * @param {Object} dailyCheck - DailyCheck session object
 * @returns {Array} Row data for insertion
 */
export function convertReadingToSheetRow(reading, dailyCheck) {
  const checkDate = new Date(dailyCheck.date);
  const day = String(checkDate.getDate()).padStart(2, '0');
  const month = String(checkDate.getMonth() + 1).padStart(2, '0');
  const year = checkDate.getFullYear();
  const sheetName = `${day}/${month}/${year} ${dailyCheck.shift === 'Morning' ? 'M' : 'N'}`;

  const updateTime = new Date(reading.updated_at || reading.createdAt);
  const updateTimeStr = `${day}/${month}/${year} ${String(updateTime.getHours()).padStart(2, '0')}:${String(updateTime.getMinutes()).padStart(2, '0')}:${String(updateTime.getSeconds()).padStart(2, '0')}`;

  // Base row data (common for all concepts)
  const baseRow = [
    sheetName,
    `${day}/${month}/${year}`,
    dailyCheck.shift,
    'JATSC',
    reading.peralatan || reading.location || '',
    reading.concept_type || 'Inspection',
    reading.cos_phi || '',
    reading.tegangan_r || reading.R || '',
    reading.tegangan_s || reading.S || '',
    reading.tegangan_t || reading.T || '',
    reading.arus_r || '',
    reading.arus_s || '',
    reading.arus_t || '',
    reading.kwh || '',
    reading.suhu || reading.in_temp || '',
    reading.status || '',
    reading.switch_status || '',
    reading.frekuensi || '',
  ];

  // Add concept-specific fields
  if (reading.concept_type === 'Preventive') {
    baseRow.push(reading.maintenance_description || '');
    baseRow.push('');
    baseRow.push('');
  } else if (reading.concept_type === 'Corrective') {
    baseRow.push('');
    baseRow.push(reading.issue_before_description || '');
    baseRow.push(reading.result_after_description || '');
  } else {
    baseRow.push('');
    baseRow.push('');
    baseRow.push('');
  }

  baseRow.push(updateTimeStr);

  return baseRow;
}

/**
 * Sync reading to appropriate Google Sheet
 * @param {Object} reading - DailyCheckReading with associations
 * @param {Object} dailyCheck - Associated DailyCheck session
 * @param {string} category - Equipment category
 * @returns {Promise<Object>} Sync result
 */
export async function syncReadingToSheet(reading, dailyCheck, category) {
  try {
    // Get appropriate spreadsheet and sheet
    const spreadsheetId = getSpreadsheetId(category);
    const sheetName = getSheetName(new Date(dailyCheck.date), dailyCheck.shift);

    // Convert reading to sheet row format
    const rowData = convertReadingToSheetRow(reading, dailyCheck);

    console.log(`📊 [Google Sheets] Syncing to ${category}:${sheetName}`);

    // Append row to sheet
    const response = await sheetsApi.spreadsheets.values.append({
      spreadsheetId,
      range: `'${sheetName}'!A:Z`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [rowData]
      }
    });

    console.log(`✅ [Google Sheets] Synced! Rows updated: ${response.data.updates?.updatedRows || 1}`);

    return {
      success: true,
      spreadsheet_id: spreadsheetId,
      sheet_name: sheetName,
      updated_rows: response.data.updates?.updatedRows || 1,
      message: `Data synced to ${category} sheet`
    };
  } catch (error) {
    console.error('❌ [Google Sheets] Sync error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all readings for a specific date/shift and sync to master report
 * @param {Array<Object>} readings - Array of DailyCheckReading objects
 * @param {Object} dailyCheck - Associated DailyCheck session
 * @returns {Promise<Object>} Master sync result
 */
export async function syncToMasterReport(readings, dailyCheck) {
  try {
    const spreadsheetId = SPREADSHEET_IDS.master_report;
    const sheetName = SHEET_NAMES.master_report;

    console.log(`📊 [Google Sheets] Syncing ${readings.length} readings to Master Report`);

    // Prepare rows for all readings
    const rows = readings.map(reading => convertReadingToSheetRow(reading, dailyCheck));

    // Batch append to master report
    const response = await sheetsApi.spreadsheets.values.append({
      spreadsheetId,
      range: `'${sheetName}'!A:Z`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: rows
      }
    });

    console.log(`✅ [Google Sheets] Master Report updated! Rows: ${response.data.updates?.updatedRows || rows.length}`);

    return {
      success: true,
      spreadsheet_id: spreadsheetId,
      sheet_name: sheetName,
      records_synced: readings.length,
      updated_rows: response.data.updates?.updatedRows || rows.length,
      message: 'All readings synced to master report'
    };
  } catch (error) {
    console.error('❌ [Google Sheets] Master report error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate reading based on concept type
 * Ensures all required fields are present
 * @param {Object} reading - Reading to validate
 * @returns {Object} Validation result
 */
export function validateReadingByConceptType(reading) {
  const errors = [];

  // Common validations
  if (!reading.equipment_type) {
    errors.push('Equipment type is required');
  }

  // Concept-specific validations
  switch (reading.concept_type) {
    case 'Preventive':
      if (!reading.maintenance_description || reading.maintenance_description.trim().length === 0) {
        errors.push('Penjelasan Kegiatan Pemeliharaan is required for Preventive concept');
      }
      if (reading.maintenance_description && (reading.maintenance_description.length < 10 || reading.maintenance_description.length > 500)) {
        errors.push('Penjelasan Kegiatan Pemeliharaan must be between 10 and 500 characters');
      }
      break;

    case 'Corrective':
      if (!reading.issue_before_description || reading.issue_before_description.trim().length === 0) {
        errors.push('Penjelasan Perbaikan Sebelum is required for Corrective concept');
      }
      if (!reading.result_after_description || reading.result_after_description.trim().length === 0) {
        errors.push('Penjelasan Hasil Sesudah is required for Corrective concept');
      }
      if (reading.issue_before_description && (reading.issue_before_description.length < 20 || reading.issue_before_description.length > 1000)) {
        errors.push('Penjelasan Perbaikan Sebelum must be between 20 and 1000 characters');
      }
      if (reading.result_after_description && (reading.result_after_description.length < 20 || reading.result_after_description.length > 1000)) {
        errors.push('Penjelasan Hasil Sesudah must be between 20 and 1000 characters');
      }
      break;

    case 'Inspection':
    default:
      // Inspection: no required description fields
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  getSpreadsheetId,
  getSheetName,
  convertReadingToSheetRow,
  syncReadingToSheet,
  syncToMasterReport,
  validateReadingByConceptType
};
