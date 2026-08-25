from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker
from datetime import datetime, date, time
from models import (
    init_database, ChillerPumpAHU_Record, ChillerReading, PumpReading, AHUReading,
    DailyCheck, DailyCheckPersonnel, DailyCheckReading, Threshold
)

app = Flask(__name__)
CORS(app)
engine = init_database()
Session = sessionmaker(bind=engine)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'JATSC Backend Running'})

@app.route('/api/chiller-pump-ahu', methods=['GET'])
def list_inspections():
    session = Session()
    records = session.query(ChillerPumpAHU_Record).all()
    data = []
    for r in records:
        data.append({
            'id': r.id,
            'inspection_date': r.inspection_date.isoformat() if r.inspection_date else None,
            'inspection_time': r.inspection_time,
            'manager_jatsc': r.manager_jatsc,
            'notes': r.notes,
            'chiller_readings': [
                {
                    'id': cr.id,
                    'location': cr.location,
                    'peralatan': cr.peralatan,
                    'R': cr.R,
                    'S': cr.S,
                    'T': cr.T,
                    'in_temp': cr.in_temp,
                    'out_temp': cr.out_temp,
                    'keterangan': cr.keterangan
                } for cr in r.chiller_readings
            ],
            'pump_readings': [
                {
                    'id': pr.id,
                    'location': pr.location,
                    'peralatan': pr.peralatan,
                    'R': pr.R,
                    'S': pr.S,
                    'T': pr.T,
                    'keterangan': pr.keterangan
                } for pr in r.pump_readings
            ],
            'ahu_readings': [
                {
                    'id': ar.id,
                    'location': ar.location,
                    'peralatan': ar.peralatan,
                    'R': ar.R,
                    'S': ar.S,
                    'T': ar.T,
                    'keterangan': ar.keterangan
                } for ar in r.ahu_readings
            ]
        })
    session.close()
    return jsonify({'success': True, 'data': data})

@app.route('/api/chiller-pump-ahu', methods=['POST'])
def create_inspection():
    try:
        session = Session()
        data = request.json

        # Create main record
        record = ChillerPumpAHU_Record(
            inspection_date=datetime.fromisoformat(data.get('inspection_date', datetime.now().isoformat())),
            inspection_time=data.get('inspection_time'),
            manager_jatsc=data.get('manager_jatsc'),
            notes=data.get('notes')
        )

        # Add chiller readings
        for chiller in data.get('chiller_readings', []):
            reading = ChillerReading(
                location=chiller.get('location'),
                peralatan=chiller.get('peralatan'),
                R=chiller.get('R'),
                S=chiller.get('S'),
                T=chiller.get('T'),
                in_temp=chiller.get('in_temp'),
                out_temp=chiller.get('out_temp'),
                keterangan=chiller.get('keterangan')
            )
            record.chiller_readings.append(reading)

        # Add pump readings
        for pump in data.get('pump_readings', []):
            reading = PumpReading(
                location=pump.get('location'),
                peralatan=pump.get('peralatan'),
                R=pump.get('R'),
                S=pump.get('S'),
                T=pump.get('T'),
                keterangan=pump.get('keterangan')
            )
            record.pump_readings.append(reading)

        # Add AHU readings
        for ahu in data.get('ahu_readings', []):
            reading = AHUReading(
                location=ahu.get('location'),
                peralatan=ahu.get('peralatan'),
                R=ahu.get('R'),
                S=ahu.get('S'),
                T=ahu.get('T'),
                keterangan=ahu.get('keterangan')
            )
            record.ahu_readings.append(reading)

        session.add(record)
        session.commit()
        record_id = record.id
        session.close()

        return jsonify({'success': True, 'record_id': record_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/chiller-pump-ahu/<int:record_id>', methods=['GET'])
def get_inspection(record_id):
    try:
        session = Session()
        record = session.query(ChillerPumpAHU_Record).filter_by(id=record_id).first()

        if not record:
            return jsonify({'success': False, 'error': 'Record not found'}), 404

        data = {
            'id': record.id,
            'inspection_date': record.inspection_date.isoformat() if record.inspection_date else None,
            'inspection_time': record.inspection_time,
            'manager_jatsc': record.manager_jatsc,
            'notes': record.notes,
            'chiller_readings': [{
                'id': r.id,
                'location': r.location,
                'peralatan': r.peralatan,
                'R': r.R,
                'S': r.S,
                'T': r.T,
                'in_temp': r.in_temp,
                'out_temp': r.out_temp,
                'keterangan': r.keterangan
            } for r in record.chiller_readings],
            'pump_readings': [{
                'id': r.id,
                'location': r.location,
                'peralatan': r.peralatan,
                'R': r.R,
                'S': r.S,
                'T': r.T,
                'keterangan': r.keterangan
            } for r in record.pump_readings],
            'ahu_readings': [{
                'id': r.id,
                'location': r.location,
                'peralatan': r.peralatan,
                'R': r.R,
                'S': r.S,
                'T': r.T,
                'keterangan': r.keterangan
            } for r in record.ahu_readings]
        }

        session.close()
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/chiller-pump-ahu/<int:record_id>', methods=['DELETE'])
def delete_inspection(record_id):
    try:
        session = Session()
        record = session.query(ChillerPumpAHU_Record).filter_by(id=record_id).first()

        if not record:
            return jsonify({'success': False, 'error': 'Record not found'}), 404

        session.delete(record)
        session.commit()
        session.close()

        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# ==================== DAILY CHECK SYSTEM ROUTES ====================

@app.route('/api/daily-check/start', methods=['POST'])
def start_daily_check():
    try:
        session = Session()
        data = request.json

        check_date = datetime.fromisoformat(data.get('date', datetime.now().isoformat())).date()
        shift = data.get('shift', 'Morning')
        start_time_str = data.get('start_time', datetime.now().time().isoformat())

        daily_check = DailyCheck(
            date=check_date,
            shift=shift,
            start_time=datetime.fromisoformat(f"{check_date.isoformat()}T{start_time_str}").time()
        )

        session.add(daily_check)
        session.commit()
        check_id = daily_check.id
        session.close()

        return jsonify({
            'success': True,
            'daily_check_id': check_id,
            'timestamp': daily_check.created_at.isoformat()
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/daily-check/<int:check_id>/personnel', methods=['POST'])
def add_personnel(check_id):
    try:
        session = Session()
        data = request.json

        check = session.query(DailyCheck).filter_by(id=check_id).first()
        if not check:
            return jsonify({'success': False, 'error': 'Check not found'}), 404

        # Get max sequence
        max_seq = session.query(DailyCheckPersonnel).filter_by(daily_check_id=check_id).count()

        personnel = DailyCheckPersonnel(
            daily_check_id=check_id,
            name=data.get('name'),
            role=data.get('role', 'Operator'),
            sequence=max_seq + 1
        )

        session.add(personnel)
        session.commit()
        personnel_id = personnel.id
        session.close()

        return jsonify({'success': True, 'personnel_id': personnel_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/daily-check/<int:check_id>/reading', methods=['POST'])
def add_reading(check_id):
    try:
        session = Session()
        data = request.json

        check = session.query(DailyCheck).filter_by(id=check_id).first()
        if not check:
            return jsonify({'success': False, 'error': 'Check not found'}), 404

        # Check for anomalies against thresholds
        anomaly_detected = False
        anomaly_reason = None

        equipment_type = data.get('equipment_type')
        thresholds = session.query(Threshold).filter_by(
            equipment_type=equipment_type,
            is_active=True
        ).all()

        for threshold in thresholds:
            param = threshold.parameter
            value = None

            if param == 'voltage_max' and data.get('R'):
                value = float(data.get('R', 0))
                if value > threshold.max_value:
                    anomaly_detected = True
                    anomaly_reason = 'exceeds_threshold'
            elif param == 'voltage_min' and data.get('R'):
                value = float(data.get('R', 0))
                if value < threshold.min_value:
                    anomaly_detected = True
                    anomaly_reason = 'below_threshold'
            elif param == 'temp_in_max' and data.get('in_temp'):
                value = float(data.get('in_temp', 0))
                if value > threshold.max_value:
                    anomaly_detected = True
                    anomaly_reason = 'exceeds_threshold'

        reading = DailyCheckReading(
            daily_check_id=check_id,
            equipment_type=equipment_type,
            location=data.get('location'),
            peralatan=data.get('peralatan'),
            R=data.get('R'),
            S=data.get('S'),
            T=data.get('T'),
            in_temp=data.get('in_temp'),
            out_temp=data.get('out_temp'),
            keterangan=data.get('keterangan'),
            anomaly_detected=anomaly_detected,
            anomaly_reason=anomaly_reason
        )

        session.add(reading)
        session.commit()
        reading_id = reading.id
        session.close()

        return jsonify({
            'success': True,
            'reading_id': reading_id,
            'anomaly_detected': anomaly_detected,
            'anomaly_reason': anomaly_reason
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/daily-check/<int:check_id>/stop', methods=['POST'])
def stop_daily_check(check_id):
    try:
        session = Session()
        data = request.json

        check = session.query(DailyCheck).filter_by(id=check_id).first()
        if not check:
            return jsonify({'success': False, 'error': 'Check not found'}), 404

        stop_time_str = data.get('stop_time', datetime.now().time().isoformat())
        check.stop_time = datetime.fromisoformat(f"{check.date.isoformat()}T{stop_time_str}").time()
        check.status = 'completed'
        check.notes = data.get('notes')

        session.commit()
        session.close()

        return jsonify({'success': True, 'daily_check_id': check_id}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/daily-check/<int:check_id>', methods=['GET'])
def get_daily_check(check_id):
    try:
        session = Session()
        check = session.query(DailyCheck).filter_by(id=check_id).first()

        if not check:
            return jsonify({'success': False, 'error': 'Check not found'}), 404

        data = {
            'id': check.id,
            'date': check.date.isoformat(),
            'shift': check.shift,
            'start_time': str(check.start_time) if check.start_time else None,
            'stop_time': str(check.stop_time) if check.stop_time else None,
            'status': check.status,
            'notes': check.notes,
            'personnel': [{
                'id': p.id,
                'name': p.name,
                'role': p.role,
                'sequence': p.sequence
            } for p in check.personnel],
            'readings': [{
                'id': r.id,
                'equipment_type': r.equipment_type,
                'location': r.location,
                'peralatan': r.peralatan,
                'R': r.R,
                'S': r.S,
                'T': r.T,
                'in_temp': r.in_temp,
                'out_temp': r.out_temp,
                'keterangan': r.keterangan,
                'timestamp': r.timestamp.isoformat(),
                'anomaly_detected': r.anomaly_detected,
                'anomaly_reason': r.anomaly_reason
            } for r in check.readings]
        }

        session.close()
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/daily-checks', methods=['GET'])
def list_daily_checks():
    try:
        session = Session()
        checks = session.query(DailyCheck).order_by(DailyCheck.date.desc()).all()

        data = [{
            'id': c.id,
            'date': c.date.isoformat(),
            'shift': c.shift,
            'start_time': str(c.start_time) if c.start_time else None,
            'stop_time': str(c.stop_time) if c.stop_time else None,
            'status': c.status,
            'personnel_count': len(c.personnel),
            'readings_count': len(c.readings)
        } for c in checks]

        session.close()
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/thresholds', methods=['GET'])
def get_thresholds():
    try:
        session = Session()
        thresholds = session.query(Threshold).all()

        data = [{
            'id': t.id,
            'equipment_type': t.equipment_type,
            'parameter': t.parameter,
            'min_value': t.min_value,
            'max_value': t.max_value,
            'alert_level': t.alert_level,
            'is_active': t.is_active
        } for t in thresholds]

        session.close()
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/thresholds', methods=['POST'])
def create_threshold():
    try:
        session = Session()
        data = request.json

        threshold = Threshold(
            equipment_type=data.get('equipment_type'),
            parameter=data.get('parameter'),
            min_value=data.get('min_value'),
            max_value=data.get('max_value'),
            alert_level=data.get('alert_level', 'warning'),
            is_active=data.get('is_active', True)
        )

        session.add(threshold)
        session.commit()
        threshold_id = threshold.id
        session.close()

        return jsonify({'success': True, 'threshold_id': threshold_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/thresholds/<int:threshold_id>', methods=['PUT'])
def update_threshold(threshold_id):
    try:
        session = Session()
        data = request.json

        threshold = session.query(Threshold).filter_by(id=threshold_id).first()
        if not threshold:
            return jsonify({'success': False, 'error': 'Threshold not found'}), 404

        threshold.min_value = data.get('min_value', threshold.min_value)
        threshold.max_value = data.get('max_value', threshold.max_value)
        threshold.alert_level = data.get('alert_level', threshold.alert_level)
        threshold.is_active = data.get('is_active', threshold.is_active)

        session.commit()
        session.close()

        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# ==================== DATA MONITORING ROUTES ====================

@app.route('/api/data-monitoring/readings', methods=['GET'])
def get_monitoring_readings():
    try:
        session = Session()

        # Query parameters for filtering
        equipment_type = request.args.get('equipment_type', 'chiller')
        parameter = request.args.get('parameter', 'voltage_R')

        # Get all readings for the equipment type, ordered by timestamp
        readings = session.query(DailyCheckReading).filter_by(
            equipment_type=equipment_type
        ).order_by(DailyCheckReading.timestamp.desc()).all()

        # Format response data
        data = [{
            'id': r.id,
            'daily_check_id': r.daily_check_id,
            'equipment_type': r.equipment_type,
            'location': r.location,
            'peralatan': r.peralatan,
            'R': r.R,
            'S': r.S,
            'T': r.T,
            'in_temp': r.in_temp,
            'out_temp': r.out_temp,
            'keterangan': r.keterangan,
            'timestamp': r.timestamp.isoformat(),
            'anomaly_detected': r.anomaly_detected,
            'anomaly_reason': r.anomaly_reason
        } for r in readings]

        session.close()
        return jsonify({'success': True, 'data': data}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    print("\n🚀 Backend running on http://127.0.0.1:5000\n")
    app.run(debug=True, host='127.0.0.1', port=5000)
