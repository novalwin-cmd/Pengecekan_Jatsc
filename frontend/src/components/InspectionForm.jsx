/**
 * InspectionForm Component - Main Inspection Entry Form
 * Supports all 3 equipment types: Chiller, Pump, AHU
 * Uses EquipmentTable for flexible row management
 * Features: loading states, toast notifications, form validation
 */

import { useState } from 'react';
import { useApiPost } from '../hooks/useApi';
import { EQUIPMENT_LABELS, EQUIPMENT_FIELDS, DEFAULT_READING, VIEWS } from '../config/constants';
import EquipmentTable from './InspectionForm/EquipmentTable';
import Toast from './Toast';
import './InspectionForm.css';

export default function InspectionForm({ onSuccess }) {
  // Form metadata
  const [inspection_date, setInspection_date] = useState(new Date().toISOString().split('T')[0]);
  const [inspection_time, setInspection_time] = useState('01:30');
  const [manager_jatsc, setManager_jatsc] = useState('');
  const [notes, setNotes] = useState('');

  // Equipment readings
  const [chiller_readings, setChiller_readings] = useState([{ ...DEFAULT_READING.chiller }]);
  const [pump_readings, setPump_readings] = useState([]);
  const [ahu_readings, setAhu_readings] = useState([]);

  // Toast notification
  const [toast, setToast] = useState(null);

  // API call hook
  const { loading, error: apiError, post } = useApiPost();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!manager_jatsc.trim()) {
      setToast({ type: 'error', message: 'Manager name is required' });
      return;
    }

    if (
      chiller_readings.every(r => !r.location && !r.peralatan) &&
      pump_readings.every(r => !r.location && !r.peralatan) &&
      ahu_readings.every(r => !r.location && !r.peralatan)
    ) {
      setToast({ type: 'error', message: 'At least one reading is required' });
      return;
    }

    try {
      // Convert numeric fields to actual numbers
      const payload = {
        inspection_date,
        inspection_time,
        manager_jatsc,
        notes,
        chiller_readings: chiller_readings
          .filter(r => r.location || r.peralatan) // Filter out empty rows
          .map(r => ({
            ...r,
            R: r.R ? parseFloat(r.R) : null,
            S: r.S ? parseFloat(r.S) : null,
            T: r.T ? parseFloat(r.T) : null,
            in_temp: r.in_temp ? parseFloat(r.in_temp) : null,
            out_temp: r.out_temp ? parseFloat(r.out_temp) : null,
          })),
        pump_readings: pump_readings
          .filter(r => r.location || r.peralatan)
          .map(r => ({
            ...r,
            R: r.R ? parseFloat(r.R) : null,
            S: r.S ? parseFloat(r.S) : null,
            T: r.T ? parseFloat(r.T) : null,
          })),
        ahu_readings: ahu_readings
          .filter(r => r.location || r.peralatan)
          .map(r => ({
            ...r,
            R: r.R ? parseFloat(r.R) : null,
            S: r.S ? parseFloat(r.S) : null,
            T: r.T ? parseFloat(r.T) : null,
          })),
      };

      // Submit
      const response = await post('/chiller-pump-ahu', payload);

      // Success
      setToast({
        type: 'success',
        message: `✅ Inspeksi disimpan! ID: ${response.record_id}`,
      });

      // Reset form
      setTimeout(() => {
        setInspection_date(new Date().toISOString().split('T')[0]);
        setInspection_time('01:30');
        setManager_jatsc('');
        setNotes('');
        setChiller_readings([{ ...DEFAULT_READING.chiller }]);
        setPump_readings([]);
        setAhu_readings([]);

        // Call optional callback
        if (onSuccess) {
          onSuccess(response.record_id);
        }
      }, 1000);
    } catch (err) {
      setToast({
        type: 'error',
        message: `❌ ${apiError || err.message || 'Gagal menyimpan inspeksi'}`,
      });
    }
  };

  return (
    <div className="inspection-form-container">
      <div className="inspection-form-header">
        <h2 className="inspection-form-title">PENGECEKAN CHILLER, POMPA, DAN AHU</h2>
        <p className="inspection-form-subtitle">Masukkan data pembacaan untuk semua peralatan</p>
      </div>

      <form onSubmit={handleSubmit} className="inspection-form">
        {/* Meta Information Section */}
        <div className="form-section">
          <div className="form-meta-grid">
            <div className="form-group">
              <label htmlFor="date">Tanggal</label>
              <input
                id="date"
                type="date"
                value={inspection_date}
                onChange={(e) => setInspection_date(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Waktu</label>
              <input
                id="time"
                type="time"
                value={inspection_time}
                onChange={(e) => setInspection_time(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="manager">Manager <span className="required-indicator">*</span></label>
              <input
                id="manager"
                type="text"
                placeholder="Nama Manager"
                value={manager_jatsc}
                onChange={(e) => setManager_jatsc(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Catatan</label>
            <textarea
              id="notes"
              placeholder="Catatan tambahan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Equipment Tables */}
        <div className="form-section">
          <EquipmentTable
            title={EQUIPMENT_LABELS.chiller}
            rows={chiller_readings}
            onRowsChange={setChiller_readings}
            fields={EQUIPMENT_FIELDS.chiller}
          />

          <EquipmentTable
            title={EQUIPMENT_LABELS.pump}
            rows={pump_readings}
            onRowsChange={setPump_readings}
            fields={EQUIPMENT_FIELDS.pump}
          />

          <EquipmentTable
            title={EQUIPMENT_LABELS.ahu}
            rows={ahu_readings}
            onRowsChange={setAhu_readings}
            fields={EQUIPMENT_FIELDS.ahu}
          />
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Menyimpan...
              </>
            ) : (
              <>💾 Simpan Inspeksi</>
            )}
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
