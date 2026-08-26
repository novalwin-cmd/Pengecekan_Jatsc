import React, { useState, useMemo } from 'react';
import './MonitoringGraphs.css';

/**
 * MonitoringGraphs Component
 * Displays ALL recorded parameters organized by category with visual graphs
 * No selection needed - shows everything that was recorded
 */
const MonitoringGraphs = ({ readings = [] }) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  // Organize readings by equipment and parameter
  const organizedData = useMemo(() => {
    const data = {};

    readings.forEach(reading => {
      const { equipment, category = 'Unknown' } = reading;

      if (!data[category]) {
        data[category] = {};
      }

      if (!data[category][equipment]) {
        data[category][equipment] = [];
      }

      // Extract all numeric fields from reading
      const parameters = {};
      Object.entries(reading).forEach(([key, value]) => {
        if (
          key !== 'id' &&
          key !== 'equipment' &&
          key !== 'category' &&
          key !== 'status' &&
          key !== 'createdAt' &&
          key !== 'updatedAt' &&
          !isNaN(value) &&
          value !== null &&
          value !== undefined &&
          value !== ''
        ) {
          parameters[key] = value;
        }
      });

      data[category][equipment].push({
        timestamp: reading.createdAt || new Date().toISOString(),
        status: reading.status,
        parameters,
      });
    });

    return data;
  }, [readings]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Get min, max, average for a parameter across readings
  const getStatistics = (values) => {
    // Convert all values to numbers and filter out non-numeric
    const nums = values
      .map(v => {
        const num = parseFloat(v);
        return !isNaN(num) ? num : null;
      })
      .filter(v => v !== null);

    if (nums.length === 0) return {
      min: '—',
      max: '—',
      avg: '—',
      count: 0
    };

    const minVal = Math.min(...nums);
    const maxVal = Math.max(...nums);
    const avgVal = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);

    return {
      min: minVal.toFixed(2),
      max: maxVal.toFixed(2),
      avg: avgVal,
      count: nums.length,
    };
  };

  // Render sparkline visualization (simple ASCII-style bar)
  const renderSparkline = (values) => {
    if (values.length === 0) return null;

    const nums = values
      .map(v => {
        const num = parseFloat(v);
        return !isNaN(num) ? num : null;
      })
      .filter(v => v !== null);

    if (nums.length === 0) return null;

    const max = Math.max(...nums);
    const min = Math.min(...nums);
    const range = max - min || 1;

    return (
      <div className="sparkline-container">
        <div className="sparkline">
          {nums.map((val, idx) => {
            const height = ((val - min) / range) * 100;
            return (
              <div
                key={idx}
                className="sparkline-bar"
                style={{ height: `${Math.max(5, height)}%` }}
                title={`${val}`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  if (Object.keys(organizedData).length === 0) {
    return (
      <div className="monitoring-empty">
        <p>📊 No data recorded yet. Start recording readings to see graphs.</p>
      </div>
    );
  }

  return (
    <div className="monitoring-graphs-container">
      <div className="monitoring-header">
        <h3>📊 Monitoring & Parameter Graphs</h3>
        <p>All recorded parameters visualized by category and equipment</p>
      </div>

      <div className="monitoring-content">
        {Object.entries(organizedData).map(([category, equipment]) => (
          <div key={category} className="category-section">
            <div
              className="category-header"
              onClick={() => toggleCategory(category)}
            >
              <div className="category-title">
                <span className="toggle-icon">
                  {expandedCategories[category] ? '▼' : '▶'}
                </span>
                <h4>{category}</h4>
              </div>
              <div className="equipment-count">
                {Object.keys(equipment).length} equipment
              </div>
            </div>

            {expandedCategories[category] && (
              <div className="category-content">
                {Object.entries(equipment).map(([equipName, readings]) => (
                  <div key={equipName} className="equipment-card">
                    <div className="equipment-header">
                      <h5>⚙️ {equipName}</h5>
                      <div className="reading-count">
                        {readings.length} readings
                      </div>
                    </div>

                    <div className="parameters-grid">
                      {(() => {
                        // Collect all unique parameters across all readings for this equipment
                        const allParams = {};
                        readings.forEach(reading => {
                          Object.entries(reading.parameters).forEach(
                            ([param, value]) => {
                              if (!allParams[param]) {
                                allParams[param] = [];
                              }
                              allParams[param].push(value);
                            }
                          );
                        });

                        return Object.entries(allParams).map(
                          ([paramName, values]) => {
                            const stats = getStatistics(values);
                            return (
                              <div key={paramName} className="parameter-card">
                                <div className="parameter-name">{paramName}</div>

                                {/* Sparkline Graph */}
                                {renderSparkline(values)}

                                {/* Statistics */}
                                <div className="statistics">
                                  <div className="stat">
                                    <span className="stat-label">Min:</span>
                                    <span className="stat-value">
                                      {stats.min}
                                    </span>
                                  </div>
                                  <div className="stat">
                                    <span className="stat-label">Max:</span>
                                    <span className="stat-value">
                                      {stats.max}
                                    </span>
                                  </div>
                                  <div className="stat">
                                    <span className="stat-label">Avg:</span>
                                    <span className="stat-value">
                                      {stats.avg}
                                    </span>
                                  </div>
                                  <div className="stat">
                                    <span className="stat-label">Count:</span>
                                    <span className="stat-value">
                                      {stats.count}
                                    </span>
                                  </div>
                                </div>

                                {/* Values List */}
                                <div className="values-list">
                                  {values
                                    .map(v => {
                                      const num = parseFloat(v);
                                      return !isNaN(num) ? num : null;
                                    })
                                    .filter(v => v !== null)
                                    .map((val, idx) => (
                                      <div key={idx} className="value-item">
                                        <span className="value-index">
                                          #{idx + 1}
                                        </span>
                                        <span className="value-data">{val.toFixed(2)}</span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            );
                          }
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonitoringGraphs;
