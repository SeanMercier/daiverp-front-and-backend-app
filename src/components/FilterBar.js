// src/components/FilterBar.js
import React from 'react';

function FilterBar({ filter, setFilter }) {
  // Example structure for a filter bar
  const handleProductChange = (e) => {
    setFilter({ ...filter, product: e.target.value });
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>
        Product:
        <input
          type="text"
          value={filter.product}
          onChange={handleProductChange}
          placeholder="e.g., Apache"
        />
      </label>
      {/* Add other filtering inputs (range sliders, checkboxes, etc.) as needed */}
    </div>
  );
}

export default FilterBar;
