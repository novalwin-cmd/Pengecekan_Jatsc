from datetime import datetime
from pathlib import Path
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text, Date, Time, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class ChillerPumpAHU_Record(Base):
    __tablename__ = 'chiller_pump_ahu_records'
    id = Column(Integer, primary_key=True)
    inspection_date = Column(DateTime, default=datetime.now)
    inspection_time = Column(String(10))
    chiller_readings = relationship("ChillerReading", cascade="all, delete-orphan")
    pump_readings = relationship("PumpReading", cascade="all, delete-orphan")
    ahu_readings = relationship("AHUReading", cascade="all, delete-orphan")
    manager_jatsc = Column(String(255))
    notes = Column(Text)

class ChillerReading(Base):
    __tablename__ = 'chiller_readings'
    id = Column(Integer, primary_key=True)
    record_id = Column(Integer, ForeignKey('chiller_pump_ahu_records.id'))
    location = Column(String(50))
    peralatan = Column(String(100))
    R = Column(Float, nullable=True)
    S = Column(Float, nullable=True)
    T = Column(Float, nullable=True)
    in_temp = Column(Float, nullable=True)
    out_temp = Column(Float, nullable=True)
    keterangan = Column(Text)

class PumpReading(Base):
    __tablename__ = 'pump_readings'
    id = Column(Integer, primary_key=True)
    record_id = Column(Integer, ForeignKey('chiller_pump_ahu_records.id'))
    location = Column(String(50))
    peralatan = Column(String(100))
    R = Column(Float, nullable=True)
    S = Column(Float, nullable=True)
    T = Column(Float, nullable=True)
    keterangan = Column(Text)

class AHUReading(Base):
    __tablename__ = 'ahu_readings'
    id = Column(Integer, primary_key=True)
    record_id = Column(Integer, ForeignKey('chiller_pump_ahu_records.id'))
    location = Column(String(50))
    peralatan = Column(String(100))
    R = Column(Float, nullable=True)
    S = Column(Float, nullable=True)
    T = Column(Float, nullable=True)
    keterangan = Column(Text)

class MDS_NoBreak_Record(Base):
    __tablename__ = 'mds_nobreak_records'
    id = Column(Integer, primary_key=True)
    inspection_date = Column(DateTime, default=datetime.now)

class MDS_GedungTS_Reading(Base):
    __tablename__ = 'mds_gedung_ts_readings'
    id = Column(Integer, primary_key=True)
    record_id = Column(Integer, ForeignKey('mds_nobreak_records.id'))

class UPS_BebanUtama_Record(Base):
    __tablename__ = 'ups_beban_utama_records'
    id = Column(Integer, primary_key=True)
    inspection_date = Column(DateTime, default=datetime.now)

class UPS_Reading(Base):
    __tablename__ = 'ups_readings'
    id = Column(Integer, primary_key=True)
    record_id = Column(Integer, ForeignKey('ups_beban_utama_records.id'))

# ==================== DAILY CHECK SYSTEM ====================

class DailyCheck(Base):
    __tablename__ = 'daily_checks'
    id = Column(Integer, primary_key=True)
    date = Column(Date, default=datetime.now)
    shift = Column(String(20))  # Morning, Afternoon, Night
    start_time = Column(Time)
    stop_time = Column(Time, nullable=True)
    status = Column(String(20), default='active')  # active, completed, edited
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    personnel = relationship("DailyCheckPersonnel", cascade="all, delete-orphan")
    readings = relationship("DailyCheckReading", cascade="all, delete-orphan")

class DailyCheckPersonnel(Base):
    __tablename__ = 'daily_check_personnel'
    id = Column(Integer, primary_key=True)
    daily_check_id = Column(Integer, ForeignKey('daily_checks.id'))
    name = Column(String(255))
    role = Column(String(100))  # Operator, Supervisor, etc.
    sequence = Column(Integer)  # Order added
    added_at = Column(DateTime, default=datetime.now)

class DailyCheckReading(Base):
    __tablename__ = 'daily_check_readings'
    id = Column(Integer, primary_key=True)
    daily_check_id = Column(Integer, ForeignKey('daily_checks.id'))
    equipment_type = Column(String(20))  # chiller, pump, ahu
    location = Column(String(100))
    peralatan = Column(String(100))
    R = Column(Float, nullable=True)
    S = Column(Float, nullable=True)
    T = Column(Float, nullable=True)
    in_temp = Column(Float, nullable=True)  # For chiller only
    out_temp = Column(Float, nullable=True)  # For chiller only
    keterangan = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.now)
    anomaly_detected = Column(Boolean, default=False)
    anomaly_reason = Column(String(100), nullable=True)  # exceeds_threshold, below_threshold

class Threshold(Base):
    __tablename__ = 'thresholds'
    id = Column(Integer, primary_key=True)
    equipment_type = Column(String(20))  # chiller, pump, ahu
    parameter = Column(String(50))  # voltage_max, voltage_min, temp_in_max, etc.
    min_value = Column(Float, nullable=True)
    max_value = Column(Float, nullable=True)
    alert_level = Column(String(20))  # warning, critical
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

def init_database(db_path='jatsc_inspections.db'):
    db_file = Path(__file__).parent / db_path
    engine = create_engine(f'sqlite:///{db_file}')
    Base.metadata.create_all(engine)
    return engine

if __name__ == '__main__':
    init_database()
    print("✅ Database ready!")
