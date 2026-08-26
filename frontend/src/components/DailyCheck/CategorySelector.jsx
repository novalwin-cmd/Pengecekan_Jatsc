/**
 * CategorySelector Component
 * Allows user to select which logsheet category to inspect in the current session
 * Displays organized category tabs with descriptions
 */

import { CATEGORY_INFO, LOGSHEET_CATEGORIES } from '../../config/constants';
import './CategorySelector.css';

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
  const categories = Object.values(LOGSHEET_CATEGORIES);

  return (
    <div className="category-selector-container">
      <div className="category-selector-header">
        <h2>📂 Pilih Jenis Pengecekan</h2>
        <p>Pilih kategori logsheet yang akan diinspeksi pada sesi ini</p>
      </div>

      <div className="category-buttons">
        {categories.map((categoryId) => {
          const info = CATEGORY_INFO[categoryId];
          const isSelected = selectedCategory === categoryId;

          return (
            <button
              key={categoryId}
              className={`category-button ${isSelected ? 'active' : ''}`}
              onClick={() => onCategoryChange(categoryId)}
              style={{
                borderColor: isSelected ? info.color : '#E5E7EB',
                backgroundColor: isSelected ? `${info.color}15` : 'white',
              }}
            >
              <div className="category-button-icon">{info.icon}</div>
              <div className="category-button-content">
                <h3>{info.name}</h3>
                <p>{info.description}</p>
              </div>
              {isSelected && <div className="category-button-check">✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;
