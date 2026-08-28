import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'jatsc_inspections.db');

// Initialize database
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
});

// ============================================================================
// MODELS
// ============================================================================

// Daily Check Model
export const DailyCheck = sequelize.define('DailyCheck', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  shift: {
    type: DataTypes.ENUM('Morning', 'Night'),
    allowNull: false,
    defaultValue: 'Morning'
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  stop_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'completed'),
    defaultValue: 'active'
  },
  // NEW: Concept type for this session
  concept_type: {
    type: DataTypes.ENUM('Inspection', 'Preventive', 'Corrective'),
    allowNull: false,
    defaultValue: 'Inspection'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  approved_by: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // ===== SUPERVISOR APPROVAL =====
  supervisor_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  supervisor_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  supervisor_signature: {
    type: DataTypes.TEXT, // Base64 encoded signature image
    allowNull: true
  },
  supervisor_approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // ===== TECHNICAL MANAGER APPROVAL =====
  technical_manager_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  technical_manager_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  technical_manager_signature: {
    type: DataTypes.TEXT, // Base64 encoded signature image
    allowNull: true
  },
  technical_manager_approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'daily_checks',
  timestamps: true,
  underscored: true
});

// Daily Check Personnel Model
export const DailyCheckPersonnel = sequelize.define('DailyCheckPersonnel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  daily_check_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'daily_checks', key: 'id' }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'Operator'
  },
  sequence: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'daily_check_personnels',
  timestamps: true,
  underscored: true
});

// Daily Check Reading Model
// Supports all 4 logsheet categories with complete parameters
export const DailyCheckReading = sequelize.define('DailyCheckReading', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  daily_check_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'daily_checks', key: 'id' }
  },
  // ===== BASIC INFO =====
  equipment_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Category: beban_listrik, sts, ups, mds'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  peralatan: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Equipment name'
  },
  // ===== CONCEPT TYPE =====
  concept_type: {
    type: DataTypes.ENUM('Inspection', 'Preventive', 'Corrective'),
    allowNull: false,
    defaultValue: 'Inspection'
  },
  // ===== STATUS =====
  status: {
    type: DataTypes.ENUM('NORMAL', 'U/S', 'GANGGUAN', 'PERBAIKAN'),
    allowNull: true
  },
  switch_status: {
    type: DataTypes.ENUM('ON', 'STANDBY', 'OFF'),
    allowNull: true
  },

  // ========== BEBAN LISTRIK PARAMETERS ==========
  // Tegangan
  tegangan_r: { type: DataTypes.FLOAT, allowNull: true },
  tegangan_s: { type: DataTypes.FLOAT, allowNull: true },
  tegangan_t: { type: DataTypes.FLOAT, allowNull: true },
  // Arus
  arus_r: { type: DataTypes.FLOAT, allowNull: true },
  arus_s: { type: DataTypes.FLOAT, allowNull: true },
  arus_t: { type: DataTypes.FLOAT, allowNull: true },
  // Lainnya
  cos_phi: { type: DataTypes.FLOAT, allowNull: true },
  kwh: { type: DataTypes.FLOAT, allowNull: true },
  suhu: { type: DataTypes.FLOAT, allowNull: true },

  // ========== STS PARAMETERS ==========
  frekuensi: { type: DataTypes.FLOAT, allowNull: true },

  // ========== UPS PARAMETERS ==========
  // Rectifier
  rectifier_i_in: { type: DataTypes.STRING, allowNull: true },
  rectifier_v_in: { type: DataTypes.STRING, allowNull: true },
  arus_rectifier: { type: DataTypes.FLOAT, allowNull: true },
  // Inverter
  inverter_v_out: { type: DataTypes.STRING, allowNull: true },
  inverter_i_out: { type: DataTypes.STRING, allowNull: true },
  arus_inverter: { type: DataTypes.FLOAT, allowNull: true },
  // Bypass
  tegangan_bypass: { type: DataTypes.FLOAT, allowNull: true },
  // Thermal
  temp_power: { type: DataTypes.FLOAT, allowNull: true },
  temp_room: { type: DataTypes.FLOAT, allowNull: true },
  temp_battery: { type: DataTypes.FLOAT, allowNull: true },
  // Battery
  floating_voltage: { type: DataTypes.FLOAT, allowNull: true },
  arus_battery: { type: DataTypes.FLOAT, allowNull: true },
  kapasitas_battery: { type: DataTypes.FLOAT, allowNull: true },

  // ========== MDS PARAMETERS ==========
  // Temperature per phase (separate from general suhu)
  suhu_r: { type: DataTypes.FLOAT, allowNull: true },
  suhu_s: { type: DataTypes.FLOAT, allowNull: true },
  suhu_t: { type: DataTypes.FLOAT, allowNull: true },

  // ========== LEGACY PARAMETERS (Keep for backward compatibility) ==========
  R: { type: DataTypes.FLOAT, allowNull: true },
  S: { type: DataTypes.FLOAT, allowNull: true },
  T: { type: DataTypes.FLOAT, allowNull: true },
  in_temp: { type: DataTypes.FLOAT, allowNull: true },
  out_temp: { type: DataTypes.FLOAT, allowNull: true },
  keterangan: { type: DataTypes.TEXT, allowNull: true },

  // ===== CONCEPT-SPECIFIC DESCRIPTION FIELDS =====
  // Preventive
  maintenance_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Corrective
  issue_before_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  result_after_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // ===== ANOMALY DETECTION =====
  anomaly_detected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  anomaly_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // ===== GOOGLE SHEETS SYNC =====
  google_sheet_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  synced_to_sheet: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sheet_sync_error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'daily_check_readings',
  timestamps: true,
  underscored: true
});

// Threshold Model
export const Threshold = sequelize.define('Threshold', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  equipment_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parameter: {
    type: DataTypes.STRING,
    allowNull: false
  },
  min_value: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  max_value: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  alert_level: {
    type: DataTypes.ENUM('warning', 'critical'),
    defaultValue: 'warning'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'thresholds',
  timestamps: true,
  underscored: true
});

// ============================================================================
// RELATIONSHIPS
// ============================================================================

DailyCheck.hasMany(DailyCheckPersonnel, {
  foreignKey: 'daily_check_id',
  as: 'personnel',
  onDelete: 'CASCADE'
});

DailyCheckPersonnel.belongsTo(DailyCheck, {
  foreignKey: 'daily_check_id'
});

DailyCheck.hasMany(DailyCheckReading, {
  foreignKey: 'daily_check_id',
  as: 'readings',
  onDelete: 'CASCADE'
});

DailyCheckReading.belongsTo(DailyCheck, {
  foreignKey: 'daily_check_id'
});

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

export async function initializeDatabase() {
  try {
    // Sync models to database
    // Try alter first, fall back to force recreate if needed
    try {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synced (alter mode)');
    } catch (alterError) {
      console.warn('⚠️  Alter mode failed, attempting force mode...');
      // If alter fails (common with SQLite schema changes), force recreate
      await sequelize.sync({ force: true });
      console.log('✅ Database synced (force mode)');
    }

    // Seed default thresholds if empty
    try {
      const thresholdCount = await Threshold.count();
      if (thresholdCount === 0) {
        await seedThresholds();
      }
    } catch (err) {
      console.log('⚠️  Threshold check/seed skipped:', err.message);
    }

    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

async function seedThresholds() {
  const defaultThresholds = [
    // Chiller thresholds
    { equipment_type: 'chiller', parameter: 'voltage_R', min_value: 380, max_value: 420, alert_level: 'warning' },
    { equipment_type: 'chiller', parameter: 'voltage_S', min_value: 380, max_value: 420, alert_level: 'warning' },
    { equipment_type: 'chiller', parameter: 'voltage_T', min_value: 380, max_value: 420, alert_level: 'warning' },
    { equipment_type: 'chiller', parameter: 'temp_in', min_value: 5, max_value: 15, alert_level: 'warning' },
    { equipment_type: 'chiller', parameter: 'temp_out', min_value: 0, max_value: 10, alert_level: 'warning' },
    // Pump thresholds
    { equipment_type: 'pump', parameter: 'voltage_R', min_value: 380, max_value: 420, alert_level: 'warning' },
    { equipment_type: 'pump', parameter: 'voltage_S', min_value: 380, max_value: 420, alert_level: 'warning' },
    { equipment_type: 'pump', parameter: 'voltage_T', min_value: 380, max_value: 420, alert_level: 'warning' },
    // AHU thresholds
    { equipment_type: 'ahu', parameter: 'voltage_R', min_value: 380, max_value: 420, alert_level: 'warning' },
    { equipment_type: 'ahu', parameter: 'voltage_S', min_value: 380, max_value: 420, alert_level: 'warning' },
    { equipment_type: 'ahu', parameter: 'voltage_T', min_value: 380, max_value: 420, alert_level: 'warning' }
  ];

  await Threshold.bulkCreate(defaultThresholds);
  console.log('✅ Default thresholds seeded');
}

export async function closeDatabase() {
  await sequelize.close();
}
