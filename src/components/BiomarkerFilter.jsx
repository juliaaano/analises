import { useState, useRef, useEffect } from 'react';

/**
 * Multi-select dropdown to filter biomarkers
 */
export function BiomarkerFilter({ biomarkers, selectedBiomarkers, onSelectionChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBiomarkers = biomarkers.filter(b =>
    b.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleBiomarker = (biomarker) => {
    if (selectedBiomarkers.includes(biomarker)) {
      onSelectionChange(selectedBiomarkers.filter(b => b !== biomarker));
    } else {
      onSelectionChange([...selectedBiomarkers, biomarker]);
    }
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const selectAll = () => {
    onSelectionChange([...biomarkers]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Biomarkers
        {selectedBiomarkers.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
            {selectedBiomarkers.length}
          </span>
        )}
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search biomarkers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="p-2 border-b border-gray-200 flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {filteredBiomarkers.map(biomarker => (
              <label
                key={biomarker}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedBiomarkers.includes(biomarker)}
                  onChange={() => toggleBiomarker(biomarker)}
                  className="rounded"
                />
                <span className="text-sm">{biomarker}</span>
              </label>
            ))}
            {filteredBiomarkers.length === 0 && (
              <p className="text-sm text-gray-500 p-2">No biomarkers found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
