import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { transformToMatrix, getColumnKey, getAllBiomarkers } from '../utils/transformData';
import { isRegistered } from '../utils/biomarkerRegistry';
import { ResultCell } from './ResultCell';
import { BiomarkerFilter } from './BiomarkerFilter';
import { ColumnToggle } from './ColumnToggle';

const DEFAULT_COLUMN_SIZE = 140;

/**
 * Main table component displaying biomarker data
 */
export function BiomarkerTable({ reports, onImportClick }) {
  const [columnVisibility, setColumnVisibility] = useState({});
  const [selectedBiomarkers, setSelectedBiomarkers] = useState([]);
  const [columnSizing, setColumnSizing] = useState({});
  const [hideUnits, setHideUnits] = useState(false);
  const [hideReferences, setHideReferences] = useState(false);

  // Transform data to matrix format
  const { columns: reportColumns, rows } = useMemo(
    () => transformToMatrix(reports),
    [reports]
  );

  // Get all biomarker names for filter
  const allBiomarkers = useMemo(
    () => getAllBiomarkers(reports),
    [reports]
  );

  // Calculate biomarker column width based on longest name
  const biomarkerColumnSize = useMemo(() => {
    const longestName = allBiomarkers.reduce(
      (longest, name) => (name.length > longest.length ? name : longest),
      ''
    );
    // Approximate: 7px per character + 16px padding
    return Math.max(150, Math.min(350, longestName.length * 7 + 16));
  }, [allBiomarkers]);

  // Filter rows based on selected biomarkers and add registration status
  const filteredRows = useMemo(() => {
    const base = selectedBiomarkers.length === 0
      ? rows
      : rows.filter(row => selectedBiomarkers.includes(row.biomarker));
    return base.map(row => ({
      ...row,
      _isRegistered: isRegistered(row.biomarker),
    }));
  }, [rows, selectedBiomarkers]);

  // Define table columns
  const columns = useMemo(() => {
    const cols = [
      {
        id: 'biomarker',
        accessorKey: 'biomarker',
        header: 'Biomarker',
        size: biomarkerColumnSize,
        minSize: 100,
        maxSize: 400,
        meta: { isBiomarkerColumn: true },
        cell: info => {
          const registered = info.row.original._isRegistered;
          return (
            <span className="font-medium whitespace-nowrap inline-flex items-center gap-1">
              {!registered && (
                <span className="relative group">
                  <svg
                    className="w-4 h-4 text-amber-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">
                    Biomarker not found in registry
                  </span>
                </span>
              )}
              <span className={registered ? 'text-gray-900' : 'text-gray-400'}>
                {info.getValue()}
              </span>
            </span>
          );
        },
        enableHiding: false,
      },
    ];

    // Add a column for each report
    reportColumns.forEach(report => {
      const key = getColumnKey(report);
      cols.push({
        id: key,
        accessorKey: key,
        size: DEFAULT_COLUMN_SIZE,
        minSize: 50,
        maxSize: 400,
        header: () => (
          <div className="text-center">
            <div className="font-semibold">{report.date}</div>
            <div className="text-xs text-gray-500 font-normal">{report.lab_name}</div>
          </div>
        ),
        cell: info => <ResultCell value={info.getValue()} hideUnit={hideUnits} hideReference={hideReferences} />,
      });
    });

    return cols;
  }, [reportColumns, biomarkerColumnSize, hideUnits, hideReferences]);

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: {
      columnVisibility,
      columnSizing,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <BiomarkerFilter
          biomarkers={allBiomarkers}
          selectedBiomarkers={selectedBiomarkers}
          onSelectionChange={setSelectedBiomarkers}
        />
        <ColumnToggle table={table} />
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setHideUnits(!hideUnits)}
            className={`relative group w-10 h-10 border rounded-lg shadow-sm flex items-center justify-center ${
              hideUnits
                ? 'bg-gray-200 border-gray-400 shadow-inner'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            title="Hide units"
          >
            <span className="w-4 h-4 text-gray-600 font-semibold text-sm leading-4 text-center">U</span>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">
              {hideUnits ? 'Show units' : 'Hide units'}
            </span>
          </button>
          <button
            onClick={() => setHideReferences(!hideReferences)}
            className={`relative group w-10 h-10 border rounded-lg shadow-sm flex items-center justify-center ${
              hideReferences
                ? 'bg-gray-200 border-gray-400 shadow-inner'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
            title="Hide references"
          >
            <span className="w-4 h-4 text-gray-600 font-semibold text-sm leading-4 text-center">R</span>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">
              {hideReferences ? 'Show references' : 'Hide references'}
            </span>
          </button>
        </div>
        <button
          onClick={onImportClick}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Data
        </button>
        <div className="flex-1" />
        <span className="text-sm text-gray-500 self-center">
          Showing {filteredRows.length} of {rows.length} biomarkers
        </span>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-8rem)] border border-gray-200 rounded-lg">
        <table
          className="divide-y divide-gray-200"
          style={{ width: table.getTotalSize(), tableLayout: 'fixed' }}
        >
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const isBiomarker = header.column.columnDef.meta?.isBiomarkerColumn;
                  return (
                    <th
                      key={header.id}
                      className={`relative px-2 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 overflow-hidden ${
                        isBiomarker ? 'text-left' : ''
                      }`}
                      style={{ width: header.getSize() }}
                    >
                      <div className={isBiomarker ? 'whitespace-nowrap' : 'break-words'}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                      {/* Resize handle */}
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => header.column.resetSize()}
                        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-blue-500 ${
                          header.column.getIsResizing() ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        style={{ userSelect: 'none' }}
                      />
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className={
                  row.original._isRegistered
                    ? 'hover:bg-gray-50'
                    : 'bg-amber-50/50 hover:bg-amber-50'
                }
                title={row.original._isRegistered ? undefined : 'Biomarker not found in registry'}
              >
                {row.getVisibleCells().map(cell => {
                  const isBiomarker = cell.column.columnDef.meta?.isBiomarkerColumn;
                  return (
                    <td
                      key={cell.id}
                      className={`px-2 py-1.5 text-sm overflow-hidden ${
                        isBiomarker ? 'text-left' : 'text-center'
                      }`}
                      style={{ width: cell.column.getSize() }}
                    >
                      <div className={isBiomarker ? '' : 'break-words'}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
