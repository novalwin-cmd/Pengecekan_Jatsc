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
    type: DataTypes.STRING,
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
  notes: {
    type: DataTypes.TEXT,
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
  equipment_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  peralatan: {
    type: DataTypes.STRING,
    allowNull: true
  },
  R: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  S: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  T: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  in_temp: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  out_temp: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  anomaly_detected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  anomaly_reason: {
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
    // Force sync to recreate all tables fresh
    await sequelize.sync({ force: true });
    console.log('✅ Database initialized');

    // Seed default thresholds if empty
    const thresholdCount = await Threshold.count();
    if (thresholdCount === 0) {
      await seedThresholds();
    }
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
