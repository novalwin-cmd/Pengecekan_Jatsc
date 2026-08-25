/**
 * GraphViewerMulti Component - Display Multiple Equipment on ONE Graph
 * Shows all selected equipment types with different colors on same chart
 */

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useApiGet } from '../../hooks/useApi';

const GraphViewerMulti = ({ selectedEquipment, parameter, timeRange }) => {
  const [data, setData] = useState([]);
  const [thresholds, setThresholds] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch readings for each selected equipment
  const chillerReadings = useApiGet(selectedEquipment.chiller ? `/data-monitoring/readings?equipment_type=chiller&parameter=${parameter}` : null);
  const pumpReadings = useApiGet(selectedEquipment.pump ? `/data-monitoring/readings?equipment_type=pump&parameter=${parameter}` : null);
  const ahuReadings = useApiGet(selectedEquipment.ahu ? `/data-monitoring/readings?equipment_type=ahu&parameter=${parameter}` : null);

  // Fetch thresholds for selected equipment
  useEffect(() => {
    const fetchThresholds = async () => {
      const newThresholds = {};
      if (selectedEquipment.chiller) {
        const res = await fetch(`http://127.0.0.1:5000/api/thresholds?equipment_type=chiller`);
        const json = await res.json();
        newThresholds.chiller = json.data?.find(t => t.parameter === parameter);
      }
      if (selectedEquipment.pump) {
        const res = await fetch(`http://127.0.0.1:5000/api/thresholds?equipment_type=pump`);
        const json = await res.json();
        newThresholds.pump = json.data?.find(t => t.parameter === parameter);
      }
      if (selectedEquipment.ahu) {
        const res = await fetch(`http://127.0.0.1:5000/api/thresholds?equipment_type=ahu`);
        const json = await res.json();
        newThresholds.ahu = json.data?.find(t => t.parameter === parameter);
      }
      setThresholds(newThresholds);
    };
    fetchThresholds();
  }, [selectedEquipment, parameter]);

  useEffect(() => {
    setLoading(true);
    const combinedReadings = [];

    // Aggregate all readings by timestamp
    if (selectedEquipment.chiller && chillerReadings.data?.data) {
      chillerReadings.data.data.forEach(r => {
        combinedReadings.push({ ...r, eqType: 'chiller' });
      });
    }
    if (selectedEquipment.pump && pumpReadings.data?.data) {
      pumpReadings.data.data.forEach(r => {
        combinedReadings.push({ ...r, eqType: 'pump' });
      });
    }
    if (selectedEquipment.ahu && ahuReadings.data?.data) {
      ahuReadings.data.data.forEach(r => {
        combinedReadings.push({ ...r, eqType: 'ahu' });
      });
    }

    // Create graph data by grouping by timestamp
    const timeMap = new Map();
    combinedReadings.forEach(r => {
      const timestamp = new Date(r.timestamp).toLocaleDateString('id-ID');
      if (!timeMap.has(timestamp)) {
        timeMap.set(timestamp, { timestamp });
      }

      const entry = timeMap.get(timestamp);
      const getValueForParam = (reading, param) => {
        const paramMap = {
          'voltage_R': reading.R,
          'voltage_S': reading.S,
          'voltage_T': reading.T,
          'temp_in': reading.in_temp,
          'temp_out': reading.out_temp,
        };
        return paramMap[param] || 0;
      };

      const key = `${r.eqType.toUpperCase()}_${parameter}`;
      entry[key] = getValueForParam(r, parameter);
    });

    let processedData = Array.from(timeMap.values());
    processedData = filterByTimeRange(processedData, timeRange);

    setData(processedData);
    setLoading(false);
  }, [selectedEquipment, chillerReadings.data, pumpReadings.data, ahuReadings.data, parameter, timeRange]);

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

  if (loading) {
    return (
      <div className="graph-loading">
        <div className="spinner"></div>
        <p>Loading equipment data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="graph-empty">
        <p>📭 No data available for selected equipment and time range</p>
      </div>
    );
  }

  return (
    <div className="graph-viewer">
      <h3 style={{ marginTop: 0 }}>📈 Multi-Equipment Comparison</h3>

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
            />
            <Legend />

            {/* Chiller Lines - Blue */}
            {selectedEquipment.chiller && (
              <>
                <Line
                  type="monotone"
                  dataKey={`CHILLER_${parameter}`}
                  stroke="#0284C7"
                  name={`Chiller ${parameter}`}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                {thresholds.chiller?.min_value && (
                  <ReferenceLine
                    y={thresholds.chiller.min_value}
                    stroke="#10B981"
                    strokeDasharray="5 5"
                    label={{ value: `Chiller Min: ${thresholds.chiller.min_value}`, position: 'left', fill: '#10B981', fontSize: 12 }}
                  />
                )}
                {thresholds.chiller?.max_value && (
                  <ReferenceLine
                    y={thresholds.chiller.max_value}
                    stroke="#EF4444"
                    strokeDasharray="5 5"
                    label={{ value: `Chiller Max: ${thresholds.chiller.max_value}`, position: 'left', fill: '#EF4444', fontSize: 12 }}
                  />
                )}
              </>
            )}

            {/* Pump Lines - Green */}
            {selectedEquipment.pump && (
              <>
                <Line
                  type="monotone"
                  dataKey={`PUMP_${parameter}`}
                  stroke="#10B981"
                  name={`Pump ${parameter}`}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                {thresholds.pump?.min_value && (
                  <ReferenceLine
                    y={thresholds.pump.min_value}
                    stroke="#10B981"
                    strokeDasharray="10 5"
                    label={{ value: `Pump Min: ${thresholds.pump.min_value}`, position: 'right', fill: '#10B981', fontSize: 12 }}
                  />
                )}
                {thresholds.pump?.max_value && (
                  <ReferenceLine
                    y={thresholds.pump.max_value}
                    stroke="#EF4444"
                    strokeDasharray="10 5"
                    label={{ value: `Pump Max: ${thresholds.pump.max_value}`, position: 'right', fill: '#EF4444', fontSize: 12 }}
                  />
                )}
              </>
            )}

            {/* AHU Lines - Amber */}
            {selectedEquipment.ahu && (
              <>
                <Line
                  type="monotone"
                  dataKey={`AHU_${parameter}`}
                  stroke="#F59E0B"
                  name={`AHU ${parameter}`}
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                {thresholds.ahu?.min_value && (
                  <ReferenceLine
                    y={thresholds.ahu.min_value}
                    stroke="#10B981"
                    strokeDasharray="5 10"
                    label={{ value: `AHU Min: ${thresholds.ahu.min_value}`, position: 'left', fill: '#10B981', fontSize: 12 }}
                  />
                )}
                {thresholds.ahu?.max_value && (
                  <ReferenceLine
                    y={thresholds.ahu.max_value}
                    stroke="#EF4444"
                    strokeDasharray="5 10"
                    label={{ value: `AHU Max: ${thresholds.ahu.max_value}`, position: 'right', fill: '#EF4444', fontSize: 12 }}
                  />
                )}
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="graph-legend">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {selectedEquipment.chiller && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#0284C7' }}></div>
              <span>❄️ Chiller {parameter}</span>
            </div>
          )}
          {selectedEquipment.pump && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#10B981' }}></div>
              <span>💧 Pump {parameter}</span>
            </div>
          )}
          {selectedEquipment.ahu && (
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#F59E0B' }}></div>
              <span>🌬️ AHU {parameter}</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="graph-stats" style={{ marginTop: '24px' }}>
        <div className="stat-item">
          <span className="stat-label">Total Data Points</span>
          <span className="stat-value">{data.length}</span>
        </div>
      </div>
    </div>
  );
};

export default GraphViewerMulti;
