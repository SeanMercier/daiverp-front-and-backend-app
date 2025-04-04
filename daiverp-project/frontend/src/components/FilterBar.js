import React from 'react';

function FilterBar({ filter, setFilter }) {
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
      {}
    </div>
  );
}

export default FilterBar;
