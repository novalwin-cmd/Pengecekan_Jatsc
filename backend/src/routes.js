import { DailyCheck, DailyCheckPersonnel, DailyCheckReading, Threshold } from './models.js';
import { Op } from 'sequelize';
import { validateReadingByConceptType, syncReadingToSheet } from './services/googleSheetsService.js';

export function setupRoutes(app) {
  // ========================================================================
  // DAILY CHECKS
  // ========================================================================

  // Get all daily checks
  app.get('/api/daily-checks', async (req, res) => {
    try {
      const checks = await DailyCheck.findAll({
        attributes: ['id', 'date', 'shift', 'start_time', 'stop_time', 'status'],
        include: [
          {
            model: DailyCheckPersonnel,
            as: 'personnel',
            attributes: ['id']
          },
          {
            model: DailyCheckReading,
            as: 'readings',
            attributes: ['id']
          }
        ],
        order: [['id', 'DESC']]
      });

      const response = checks.map(check => ({
        id: check.id,
        date: check.date,
        shift: check.shift,
        start_time: check.start_time,
        stop_time: check.stop_time,
        status: check.status,
        personnel_count: check.personnel.length,
        readings_count: check.readings.length
      }));

      res.json({ data: response, success: true });
    } catch (error) {
      console.error('Error fetching daily checks:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // Get single daily check
  app.get('/api/daily-check/:id', async (req, res) => {
    try {
      const check = await DailyCheck.findByPk(req.params.id, {
        include: [
          {
            model: DailyCheckPersonnel,
            as: 'personnel',
            attributes: ['id', 'name', 'role']
          },
          {
            model: DailyCheckReading,
            as: 'readings',
            attributes: [
              'id', 'equipment_type', 'location', 'peralatan',
              'R', 'S', 'T', 'in_temp', 'out_temp', 'keterangan',
              'createdAt', 'anomaly_detected', 'anomaly_reason'
            ]
          }
        ]
      });

      if (!check) {
        return res.status(404).json({ error: 'Check not found', success: false });
      }

      res.json({
        data: {
          id: check.id,
          date: check.date,
          shift: check.shift,
          start_time: check.start_time,
          stop_time: check.stop_time,
          status: check.status,
          concept_type: check.concept_type, // NEW
          notes: check.notes,
          personnel: check.personnel,
          readings: check.readings,
          created_at: check.createdAt,
          updated_at: check.updatedAt
        },
        success: true
      });
    } catch (error) {
      console.error('Error fetching daily check:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // Start new daily check
  app.post('/api/daily-check/start', async (req, res) => {
    try {
      const { date, shift, start_time, notes, concept_type } = req.body;

      const check = await DailyCheck.create({
        date: date || new Date().toISOString().split('T')[0],
        shift: shift || 'Morning',
        start_time: start_time || new Date().toTimeString().slice(0, 8),
        status: 'active',
        concept_type: concept_type || 'Inspection', // NEW: Store concept type
        notes: notes || ''
      });

      res.json({ data: { id: check.id, concept_type: check.concept_type }, success: true });
    } catch (error) {
      console.error('Error starting daily check:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // Stop daily check
  app.post('/api/daily-check/:id/stop', async (req, res) => {
    try {
      const { stop_time, notes } = req.body;

      const check = await DailyCheck.findByPk(req.params.id);
      if (!check) {
        return res.status(404).json({ error: 'Check not found', success: false });
      }

      await check.update({
        stop_time: stop_time || new Date().toTimeString().slice(0, 8),
        status: 'completed',
        notes: notes || check.notes
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error stopping daily check:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // ========================================================================
  // PERSONNEL
  // ========================================================================

  // Add personnel to check
  app.post('/api/daily-check/:id/personnel', async (req, res) => {
    try {
      const { name, role } = req.body;

      const personnel = await DailyCheckPersonnel.create({
        daily_check_id: req.params.id,
        name,
        role: role || 'Operator'
      });

      res.json({ data: personnel, success: true });
    } catch (error) {
      console.error('Error adding personnel:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // Remove personnel
  app.delete('/api/personnel/:id', async (req, res) => {
    try {
      await DailyCheckPersonnel.destroy({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing personnel:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // ========================================================================
  // READINGS
  // ========================================================================

  // Add reading
  app.post('/api/daily-check/:id/reading', async (req, res) => {
    try {
      // Handle both Indonesian and English field names
      const {
        equipment_type,
        category,
        peralatan,
        // Concept & descriptions (NEW)
        concept_type = 'Inspection',
        maintenance_description,
        issue_before_description,
        result_after_description,
      } = req.body;

      // Map Indonesian field names to database column names
      let R = req.body.R || parseFloat(req.body.tegangan_r) || null;
      let S = req.body.S || parseFloat(req.body.tegangan_s) || null;
      let T = req.body.T || parseFloat(req.body.tegangan_t) || null;
      let in_temp = req.body.in_temp || parseFloat(req.body.suhu_masuk) || parseFloat(req.body.temp_in) || null;
      let out_temp = req.body.out_temp || parseFloat(req.body.suhu_keluar) || parseFloat(req.body.temp_out) || null;
      let keterangan = req.body.keterangan || req.body.catatan || '';
      let location = req.body.location || '';

      // Validate concept type based on provided descriptions
      const validation = validateReadingByConceptType({
        equipment_type,
        concept_type,
        maintenance_description,
        issue_before_description,
        result_after_description
      });

      if (!validation.valid) {
        return res.status(400).json({
          error: validation.errors.join('; '),
          success: false
        });
      }

      // Check thresholds for anomaly detection
      let anomaly_detected = false;
      let anomaly_reason = null;

      const thresholds = await Threshold.findAll({
        where: { equipment_type, is_active: true }
      });

      for (const threshold of thresholds) {
        if (threshold.parameter === 'voltage_R' && (R < threshold.min_value || R > threshold.max_value)) {
          anomaly_detected = true;
          anomaly_reason = `Voltage R exceeds threshold (${threshold.min_value}-${threshold.max_value})`;
        }
        if (threshold.parameter === 'voltage_S' && (S < threshold.min_value || S > threshold.max_value)) {
          anomaly_detected = true;
          anomaly_reason = `Voltage S exceeds threshold (${threshold.min_value}-${threshold.max_value})`;
        }
        if (threshold.parameter === 'voltage_T' && (T < threshold.min_value || T > threshold.max_value)) {
          anomaly_detected = true;
          anomaly_reason = `Voltage T exceeds threshold (${threshold.min_value}-${threshold.max_value})`;
        }
        if (threshold.parameter === 'temp_in' && in_temp && (in_temp < threshold.min_value || in_temp > threshold.max_value)) {
          anomaly_detected = true;
          anomaly_reason = `Temperature In exceeds threshold (${threshold.min_value}-${threshold.max_value})`;
        }
        if (threshold.parameter === 'temp_out' && out_temp && (out_temp < threshold.min_value || out_temp > threshold.max_value)) {
          anomaly_detected = true;
          anomaly_reason = `Temperature Out exceeds threshold (${threshold.min_value}-${threshold.max_value})`;
        }
      }

      // Create reading with concept type and descriptions
      const readingData = {
        daily_check_id: req.params.id,
        equipment_type: equipment_type || category,
        location,
        peralatan,
        status: req.body.status || null,
        switch_status: req.body.switch_status || null,
        concept_type,
        maintenance_description,
        issue_before_description,
        result_after_description,
        // Legacy fields
        R: parseFloat(R) || null,
        S: parseFloat(S) || null,
        T: parseFloat(T) || null,
        in_temp: parseFloat(in_temp) || null,
        out_temp: parseFloat(out_temp) || null,
        keterangan,
        anomaly_detected,
        anomaly_reason,
        synced_to_sheet: false,

        // BEBAN LISTRIK - Tegangan
        tegangan_r: parseFloat(req.body.tegangan_r) || null,
        tegangan_s: parseFloat(req.body.tegangan_s) || null,
        tegangan_t: parseFloat(req.body.tegangan_t) || null,
        // BEBAN LISTRIK - Arus
        arus_r: parseFloat(req.body.arus_r) || null,
        arus_s: parseFloat(req.body.arus_s) || null,
        arus_t: parseFloat(req.body.arus_t) || null,
        // BEBAN LISTRIK - Lainnya
        cos_phi: parseFloat(req.body.cos_phi) || null,
        kwh: parseFloat(req.body.kwh) || null,
        suhu: parseFloat(req.body.suhu) || parseFloat(req.body.suhu_input) || null,
        suhu_masuk: parseFloat(req.body.suhu_masuk) || null,
        suhu_keluar: parseFloat(req.body.suhu_keluar) || null,

        // STS PARAMETERS
        frekuensi: parseFloat(req.body.frekuensi) || null,

        // UPS PARAMETERS
        rectifier_i_in: req.body.rectifier_i_in || null,
        rectifier_v_in: req.body.rectifier_v_in || null,
        arus_rectifier: parseFloat(req.body.arus_rectifier) || null,
        inverter_v_out: req.body.inverter_v_out || null,
        inverter_i_out: req.body.inverter_i_out || null,
        arus_inverter: parseFloat(req.body.arus_inverter) || null,
        tegangan_bypass: parseFloat(req.body.tegangan_bypass) || null,
        temp_power: parseFloat(req.body.temp_power) || null,
        temp_room: parseFloat(req.body.temp_room) || null,
        temp_battery: parseFloat(req.body.temp_battery) || null,
        floating_voltage: parseFloat(req.body.floating_voltage) || null,
        arus_battery: parseFloat(req.body.arus_battery) || null,
        kapasitas_battery: parseFloat(req.body.kapasitas_battery) || null,

        // MDS PARAMETERS - Temperature per phase
        suhu_r: parseFloat(req.body.suhu_r) || null,
        suhu_s: parseFloat(req.body.suhu_s) || null,
        suhu_t: parseFloat(req.body.suhu_t) || null,
      };

      const reading = await DailyCheckReading.create(readingData);

      // Attempt to sync to Google Sheets (background, non-blocking)
      try {
        const dailyCheck = await DailyCheck.findByPk(req.params.id);
        const syncResult = await syncReadingToSheet(reading, dailyCheck, category);
        if (syncResult.success) {
          await reading.update({
            synced_to_sheet: true,
            google_sheet_url: syncResult.sheet_name
          });
        } else {
          await reading.update({
            sheet_sync_error: syncResult.error
          });
        }
      } catch (sheetError) {
        console.warn('⚠️ Non-blocking Google Sheets sync error:', sheetError.message);
        // Don't fail the reading creation if sheets sync fails
        await reading.update({
          sheet_sync_error: sheetError.message
        });
      }

      res.json({ data: reading, success: true });
    } catch (error) {
      console.error('Error adding reading:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // Delete reading
  app.delete('/api/reading/:id', async (req, res) => {
    try {
      await DailyCheckReading.destroy({ where: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting reading:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // ========================================================================
  // THRESHOLDS
  // ========================================================================

  // Get all thresholds
  app.get('/api/thresholds', async (req, res) => {
    try {
      const { equipment_type, parameter } = req.query;

      const where = {};
      if (equipment_type) where.equipment_type = equipment_type;
      if (parameter) where.parameter = parameter;

      const thresholds = await Threshold.findAll({ where });
      res.json({ data: thresholds, success: true });
    } catch (error) {
      console.error('Error fetching thresholds:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // Create threshold
  app.post('/api/thresholds', async (req, res) => {
    try {
      const { equipment_type, parameter, min_value, max_value, alert_level } = req.body;

      const threshold = await Threshold.create({
        equipment_type,
        parameter,
        min_value: parseFloat(min_value),
        max_value: parseFloat(max_value),
        alert_level: alert_level || 'warning'
      });

      res.json({ data: threshold, success: true });
    } catch (error) {
      console.error('Error creating threshold:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // Update threshold
  app.put('/api/thresholds/:id', async (req, res) => {
    try {
      const { min_value, max_value, alert_level, is_active } = req.body;

      const threshold = await Threshold.findByPk(req.params.id);
      if (!threshold) {
        return res.status(404).json({ error: 'Threshold not found', success: false });
      }

      await threshold.update({
        min_value: min_value !== undefined ? parseFloat(min_value) : threshold.min_value,
        max_value: max_value !== undefined ? parseFloat(max_value) : threshold.max_value,
        alert_level: alert_level || threshold.alert_level,
        is_active: is_active !== undefined ? is_active : threshold.is_active
      });

      res.json({ data: threshold, success: true });
    } catch (error) {
      console.error('Error updating threshold:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });

  // ========================================================================
  // DATA MONITORING
  // ========================================================================

  // Get readings for monitoring
  app.get('/api/data-monitoring/readings', async (req, res) => {
    try {
      const { equipment_type, parameter } = req.query;

      const where = {};
      if (equipment_type) where.equipment_type = equipment_type;

      const readings = await DailyCheckReading.findAll({
        where,
        raw: true,
        order: [['createdAt', 'DESC']],
        limit: 1000
      });

      res.json({ data: readings, success: true });
    } catch (error) {
      console.error('Error fetching monitoring readings:', error);
      res.status(500).json({ error: error.message, success: false });
    }
  });
}
