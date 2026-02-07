import React, { useState, useEffect, useRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  staticOption?: Option;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, staticOption }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOptionLabel = value === staticOption?.value 
    ? staticOption.label 
    : options.find(opt => opt.value === value)?.label || '';

  useEffect(() => {
    // Sync input text with the selected value from props
    if (value) {
      setSearchTerm(selectedOptionLabel);
    } else {
      setSearchTerm('');
    }
  }, [value, selectedOptionLabel]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allOptions = staticOption ? [staticOption, ...filteredOptions] : filteredOptions;

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(selectedOptionLabel || ''); // Revert to selected or empty
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef, selectedOptionLabel]);

  // Handle selecting an option
  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearchTerm(option.label);
    setIsOpen(false);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < allOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && allOptions[highlightedIndex]) {
        handleSelect(allOptions[highlightedIndex]);
      } else {
        setIsOpen(true); // Open dropdown on Enter if closed
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm(selectedOptionLabel || ''); // Revert
    }
  };
  
  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      wrapperRef.current?.querySelector(`[data-index='${highlightedIndex}']`)?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (!isOpen) setIsOpen(true);
          setHighlightedIndex(-1); // Reset highlight on search term change
        }}
        onFocus={() => {
          setIsOpen(true);
          // Clear the search term on focus if it matches the selected value, to encourage new search
          if (searchTerm === selectedOptionLabel) {
            setSearchTerm('');
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-3 bg-input-bg rounded-lg border border-border focus:ring-2 focus:ring-accent focus:border-accent outline-none"
        autoComplete="off"
      />
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {allOptions.length > 0 ? (
            allOptions.map((option, index) => (
              <li key={option.value} data-index={index}>
                <button
                  type="button"
                  className={`w-full text-start px-4 py-2 text-sm text-text-primary transition-colors ${
                    highlightedIndex === index ? 'bg-card-secondary' : 'hover:bg-card-secondary'
                  }`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </button>
              </li>
            ))
          ) : (
             <li className="px-4 py-2 text-sm text-text-secondary">لم يتم العثور على نتائج</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelect;
