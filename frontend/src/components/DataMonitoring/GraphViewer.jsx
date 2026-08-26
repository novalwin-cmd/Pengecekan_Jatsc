/**
 * GraphViewer Component - Historical data visualization
 * Displays equipment readings with threshold lines and anomaly markers
 */

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Dot
} from 'recharts';
import { useApiGet } from '../../hooks/useApi';
import './DataMonitoring.css';

const GraphViewer = ({ equipmentType, parameter, timeRange }) => {
  const [data, setData] = useState([]);
  const [threshold, setThreshold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: readingsData, fetch: fetchReadings } = useApiGet(
    `/data-monitoring/readings?equipment_type=${equipmentType}&parameter=${parameter}`
  );

  const { data: thresholdData, fetch: fetchThreshold } = useApiGet(
    `/thresholds?equipment_type=${equipmentType}&parameter=${parameter}`
  );

  // Fetch data when equipment type or parameter changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchReadings();
        await fetchThreshold();
      } catch (err) {
        console.error('Error loading graph data:', err);
        setError('Failed to load graph data');
      }
    };
    loadData();
  }, [equipmentType, parameter, fetchReadings, fetchThreshold]);

  // Process readings data and apply time range filter
  useEffect(() => {
    if (readingsData?.data && Array.isArray(readingsData.data)) {
      const readings = readingsData.data;

      // Filter by time range BEFORE converting dates to strings
      const now = new Date();
      const filteredReadings = filterByTimeRange(readings, timeRange, now);

      // Process data after filtering
      const processedData = filteredReadings.map(r => ({
        timestamp: new Date(r.createdAt).toLocaleDateString('id-ID'),
        rawDate: new Date(r.createdAt),
        value: getValueForParameter(r, parameter),
        anomaly: r.anomaly_detected,
        location: r.location,
        equipment: r.peralatan,
      }));

      setData(processedData);
      setLoading(false);
    }
  }, [readingsData, timeRange]);

  // Process threshold data
  useEffect(() => {
    if (thresholdData?.data && thresholdData.data.length > 0) {
      // Find threshold matching the current parameter
      const matchingThreshold = thresholdData.data.find(t => t.parameter === parameter);
      setThreshold(matchingThreshold || thresholdData.data[0]);
    }
  }, [thresholdData, parameter]);

  const getValueForParameter = (reading, param) => {
    const paramMap = {
      // English names (legacy)
      'voltage_R': reading.R || reading.tegangan_r,
      'voltage_S': reading.S || reading.tegangan_s,
      'voltage_T': reading.T || reading.tegangan_t,
      'temp_in': reading.in_temp || reading.suhu_masuk,
      'temp_out': reading.out_temp || reading.suhu_keluar,
      // Indonesian names (new)
      'tegangan_r': reading.tegangan_r,
      'tegangan_s': reading.tegangan_s,
      'tegangan_t': reading.tegangan_t,
      'arus_r': reading.arus_r,
      'arus_s': reading.arus_s,
      'arus_t': reading.arus_t,
      'cos_phi': reading.cos_phi,
      'kwh': reading.kwh,
      'suhu': reading.suhu,
      'frekuensi': reading.frekuensi,
      'temp_power': reading.temp_power,
      'temp_room': reading.temp_room,
      'temp_battery': reading.temp_battery,
    };
    return paramMap[param] || 0;
  };

  const filterByTimeRange = (data, range, now = new Date()) => {
    let startDate;

    switch(range) {
      case 'month':
        // Last 30 days
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6-month':
        // Last 6 months
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        // Last 12 months
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return data;
    }

    // Filter using createdAt field which is a date string
    return data.filter(d => {
      const readingDate = new Date(d.createdAt);
      return readingDate >= startDate;
    });
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.anomaly) {
      return (
        <circle cx={cx} cy={cy} r={6} fill="#EF4444" stroke="#DC2626" strokeWidth={2} />
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className="graph-empty">
        <p style={{ color: '#EF4444' }}>❌ Error: {error}</p>
        <small style={{ color: 'var(--color-text-muted)' }}>Check browser console for details</small>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="graph-loading">
        <div className="spinner"></div>
        <p>Loading graph data for {equipmentType}...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="graph-empty">
        <p>📭 No data available for {equipmentType}</p>
        <small style={{ color: 'var(--color-text-muted)' }}>
          Try a longer time range or check if readings exist for this equipment
        </small>
      </div>
    );
  }

  return (
    <div className="graph-viewer">
      <h3 style={{ marginTop: 0, marginBottom: '16px', textTransform: 'capitalize' }}>
        {equipmentType === 'chiller' ? '❄️ Chiller' : equipmentType === 'pump' ? '💧 Pump' : '🌬️ AHU'} - {parameter.replace('_', ' ')}
      </h3>
      <div className="graph-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              formatter={(value) => [value?.toFixed(2) || 'N/A', 'Value']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            />
            <Legend />

            {/* Threshold lines */}
            {threshold?.min_value && (
              <ReferenceLine
                y={threshold.min_value}
                stroke="#10B981"
                strokeDasharray="5 5"
                label={{ value: `Min: ${threshold.min_value}`, position: 'right', fill: '#10B981' }}
              />
            )}
            {threshold?.max_value && (
              <ReferenceLine
                y={threshold.max_value}
                stroke="#EF4444"
                strokeDasharray="5 5"
                label={{ value: `Max: ${threshold.max_value}`, position: 'right', fill: '#EF4444' }}
              />
            )}

            {/* Data line with anomaly markers */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0284C7"
              dot={<CustomDot />}
              strokeWidth={2}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#0284C7' }}></div>
          <span>Equipment Reading</span>
        </div>
        {threshold?.min_value && (
          <div className="legend-item">
            <div className="legend-line" style={{ borderTopColor: '#10B981' }}></div>
            <span>Min Threshold: {threshold.min_value}</span>
          </div>
        )}
        {threshold?.max_value && (
          <div className="legend-item">
            <div className="legend-line" style={{ borderTopColor: '#EF4444' }}></div>
            <span>Max Threshold: {threshold.max_value}</span>
          </div>
        )}
        <div className="legend-item">
          <div className="legend-anomaly"></div>
          <span>Anomaly Detected</span>
        </div>
      </div>

      {/* Data Statistics */}
      {data.length > 0 && (
        <div className="graph-stats">
          <div className="stat-item">
            <span className="stat-label">Total Readings</span>
            <span className="stat-value">{data.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">
              {(data.reduce((sum, d) => sum + (d.value || 0), 0) / data.length).toFixed(2)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Min Value</span>
            <span className="stat-value">
              {Math.min(...data.map(d => d.value || 0)).toFixed(2)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max Value</span>
            <span className="stat-value">
              {Math.max(...data.map(d => d.value || 0)).toFixed(2)}
            </span>
          </div>
          <div className="stat-item anomaly">
            <span className="stat-label">Anomalies</span>
            <span className="stat-value">
              {data.filter(d => d.anomaly).length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphViewer;
