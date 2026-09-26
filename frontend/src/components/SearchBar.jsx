import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onSearch, placeholder = 'Search movies by title, actor, or genre...' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={18}
          color="var(--text-dim)"
          style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '14px 44px 14px 48px',
            background: 'rgba(21, 27, 45, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-full)',
            color: '#ffffff',
            fontSize: '0.95rem',
            outline: 'none',
            backdropFilter: 'blur(10px)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#6366f1';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(99, 102, 241, 0.25)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              if (onSearch) onSearch('');
            }}
            style={{
              position: 'absolute',
              right: '16px',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
