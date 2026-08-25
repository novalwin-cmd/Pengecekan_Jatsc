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

  const { data: readingsData, fetch: fetchReadings } = useApiGet(
    `/data-monitoring/readings?equipment_type=${equipmentType}&parameter=${parameter}`
  );

  const { data: thresholdData, fetch: fetchThreshold } = useApiGet(
    `/thresholds?equipment_type=${equipmentType}&parameter=${parameter}`
  );

  useEffect(() => {
    setLoading(true);
    fetchReadings();
    fetchThreshold();
  }, [equipmentType, parameter]);

  useEffect(() => {
    if (readingsData?.data) {
      const readings = readingsData.data;

      // Process data based on time range
      let processedData = readings.map(r => ({
        timestamp: new Date(r.timestamp).toLocaleDateString('id-ID'),
        value: getValueForParameter(r, parameter),
        anomaly: r.anomaly_detected,
        location: r.location,
        equipment: r.peralatan,
      }));

      // Filter by time range
      processedData = filterByTimeRange(processedData, timeRange);

      setData(processedData);
      setLoading(false);
    }
  }, [readingsData, timeRange]);

  useEffect(() => {
    if (thresholdData?.data && thresholdData.data.length > 0) {
      setThreshold(thresholdData.data[0]);
    }
  }, [thresholdData]);

  const getValueForParameter = (reading, param) => {
    const paramMap = {
      'voltage_R': reading.R,
      'voltage_S': reading.S,
      'voltage_T': reading.T,
      'temp_in': reading.in_temp,
      'temp_out': reading.out_temp,
    };
    return paramMap[param] || 0;
  };

  const filterByTimeRange = (data, range) => {
    const now = new Date();
    let startDate;

    switch(range) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '6-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return data;
    }

    return data.filter(d => new Date(d.timestamp) >= startDate);
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

  if (loading) {
    return (
      <div className="graph-loading">
        <div className="spinner"></div>
        <p>Loading graph data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="graph-empty">
        <p>📭 No data available for this time range</p>
      </div>
    );
  }

  return (
    <div className="graph-viewer">
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
