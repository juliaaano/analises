import { useState } from 'react';

/**
 * Modal for pasting raw JSON health data
 */
export function JsonPasteModal({ isOpen, onClose, onSubmit }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError('');
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.reports || !Array.isArray(parsed.reports)) {
        setError('Invalid format: JSON must have a "reports" array');
        return;
      }
      onSubmit(parsed);
      setJsonText('');
      onClose();
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleCancel = () => {
    setJsonText('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Paste JSON Data</h2>
          <p className="text-sm text-gray-500 mt-1">
            Paste your health data JSON to replace the current data
          </p>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          <textarea
            className="w-full flex-1 min-h-[300px] p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder='{"reports": [...]}'
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Load Data
          </button>
        </div>
      </div>
    </div>
  );
}
