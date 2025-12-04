import { useState } from 'react';
import '../css/SearchFilter.css';

function SearchFilter({ placeholder = 'Search...', onSearch, onFilter, filterOptions = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch?.(term);
  };

  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setSelectedFilter(filter);
    onFilter?.(filter);
  };

  return (
    <div className="search-filter-container">
      <div className="search-box">
        <svg
          className="search-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleSearchChange}
          aria-label="Search"
        />
      </div>

      {filterOptions.length > 0 && (
        <select
          className="filter-select"
          value={selectedFilter}
          onChange={handleFilterChange}
          aria-label="Filter results"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default SearchFilter;
