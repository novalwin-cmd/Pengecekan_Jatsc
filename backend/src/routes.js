import { DailyCheck, DailyCheckPersonnel, DailyCheckReading, Threshold } from './models.js';
import { Op } from 'sequelize';

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
      const { date, shift, start_time, notes } = req.body;

      const check = await DailyCheck.create({
        date: date || new Date().toISOString().split('T')[0],
        shift: shift || 'Morning',
        start_time: start_time || new Date().toTimeString().slice(0, 8),
        status: 'active',
        notes: notes || ''
      });

      res.json({ data: { id: check.id }, success: true });
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
      const { equipment_type, location, peralatan, R, S, T, in_temp, out_temp, keterangan } = req.body;

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

      const reading = await DailyCheckReading.create({
        daily_check_id: req.params.id,
        equipment_type,
        location,
        peralatan,
        R: parseFloat(R) || null,
        S: parseFloat(S) || null,
        T: parseFloat(T) || null,
        in_temp: parseFloat(in_temp) || null,
        out_temp: parseFloat(out_temp) || null,
        keterangan,
        anomaly_detected,
        anomaly_reason
      });

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
        attributes: [
          'id', 'equipment_type', 'location', 'peralatan',
          'R', 'S', 'T', 'in_temp', 'out_temp', 'createdAt',
          'anomaly_detected'
        ],
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
