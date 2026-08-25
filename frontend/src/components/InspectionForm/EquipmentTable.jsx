/**
 * EquipmentTable Component - Reusable Table for Equipment Readings
 * Parameterized to handle Chiller, Pump, and AHU with different field configurations
 * Supports inline editing, add/remove rows
 */

import React from 'react';

const EquipmentTable = ({ title, rows, onRowsChange, fields }) => {
  /**
   * Handle field change in a row
   */
  const handleFieldChange = (rowIndex, fieldName, value) => {
    const newRows = [...rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [fieldName]: value,
    };
    onRowsChange(newRows);
  };

  /**
   * Remove row
   */
  const handleRemoveRow = (rowIndex) => {
    const newRows = rows.filter((_, idx) => idx !== rowIndex);
    onRowsChange(newRows);
  };

  /**
   * Add new row with default empty values
   */
  const handleAddRow = () => {
    const defaultRow = {};
    fields.forEach((field) => {
      defaultRow[field.name] = '';
    });
    onRowsChange([...rows, defaultRow]);
  };

  return (
    <div className="equipment-table-wrapper">
      <div className="equipment-table-header">
        <h3 className="equipment-table-title">{title}</h3>
        <span className="equipment-row-count">{rows.length} row(s)</span>
      </div>

      <div className="equipment-table-scroll">
        <table className="equipment-table bordered">
          <thead>
            <tr>
              {fields.map((field) => (
                <th key={field.name}>
                  {field.label}
                  {field.required && <span className="required-indicator">*</span>}
                </th>
              ))}
              <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={fields.length + 1} style={{ textAlign: 'center', padding: '2rem' }}>
                  <span className="text-muted">No readings added yet</span>
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {fields.map((field) => (
                    <td key={`${rowIndex}-${field.name}`}>
                      <input
                        type={field.type || 'text'}
                        step={field.step}
                        placeholder={field.label}
                        value={row[field.name] || ''}
                        onChange={(e) =>
                          handleFieldChange(rowIndex, field.name, e.target.value)
                        }
                        className="cell-input"
                        required={field.required}
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-danger btn-small"
                      onClick={() => handleRemoveRow(rowIndex)}
                      title="Remove row"
                      aria-label={`Remove row ${rowIndex + 1}`}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="equipment-table-footer">
        <button
          type="button"
          className="btn btn-success btn-small"
          onClick={handleAddRow}
        >
          + Add Row
        </button>
      </div>
    </div>
  );
};

export default EquipmentTable;
