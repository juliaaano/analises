import { useState } from 'react';
import { BiomarkerTable } from './components/BiomarkerTable';
import { JsonPasteModal } from './components/JsonPasteModal';

function App() {
  const [data, setData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleJsonSubmit = (newData) => {
    setData(newData);
  };

  const openImportModal = () => setIsModalOpen(true);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-full mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Health Biomarker Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            View and compare laboratory results across multiple reports
          </p>
        </header>

        <main>
          {data && data.reports ? (
            <BiomarkerTable
              reports={data.reports}
              onImportClick={openImportModal}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                No data loaded
              </h2>
              <p className="text-gray-500 mb-4">
                Import your health data JSON to view biomarker results.
              </p>
              <button
                onClick={openImportModal}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
              >
                Import Data
              </button>
            </div>
          )}
        </main>
      </div>

      <JsonPasteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleJsonSubmit}
      />
    </div>
  );
}

export default App;
