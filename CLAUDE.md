# Health Biomarker Dashboard

## Project Overview
A React SPA that displays health biomarker data from laboratory reports in a matrix/table format with filtering, column visibility controls, and resizable columns.

## Tech Stack
- **React 18** with Vite
- **TanStack Table** (React Table v8) for table with filtering, column visibility, and resizing
- **Tailwind CSS v4** for styling (uses @tailwindcss/vite plugin)

## Data Source
- No static data files - data is imported at runtime via paste modal
- JSON format with `reports` array (schema available at parent directory: `health_data_schema.json`)
- Data is held in React state (not persisted between sessions)

## Key Conventions

### Data Import
- App starts with no data loaded (empty state)
- "Import Data" button in toolbar opens paste modal
- Empty state shows link to import data
- Validates JSON has `reports` array before accepting

### Table Layout
- Reports are sorted **newest to oldest** (most recent on the left)
- All biomarkers from all reports are shown as rows
- Each report (date + lab) is a column
- Each cell shows: result, unit, and reference range (centered)

### Column Behavior
- **Biomarker column** (first column):
  - Left-aligned text
  - No text wrapping (whitespace-nowrap)
  - Size automatically calculated to fit longest biomarker name
  - Resizable with min 100px, max 400px

- **Report columns** (data columns):
  - Centered text
  - Text wraps when column is narrower than content
  - Default size: 140px (all same size)
  - Resizable with min 50px, max 400px
  - Uses `table-layout: fixed` to enforce column widths

### Resizing
- Drag the gray border on the right edge of any column header to resize
- Double-click resize handle to reset to default size
- Visual feedback: handle turns blue when actively resizing

### Filtering
- Multi-select biomarker filter with search
- Column visibility toggle to show/hide report columns

## Documentation
Use Context7 MCP tools (`resolve-library-id` and `query-docs`) to fetch up-to-date documentation for libraries.

## Commands
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## File Structure
```
src/
  components/           # React components
    BiomarkerTable.jsx  # Main table with TanStack Table (resizing, visibility)
    BiomarkerFilter.jsx # Multi-select biomarker filter with search
    ColumnToggle.jsx    # Column visibility dropdown
    JsonPasteModal.jsx  # Modal for pasting JSON data
    ResultCell.jsx      # Cell renderer (result, unit, reference - centered)
  utils/
    transformData.js    # Data transformation (sorting, matrix conversion)
  App.jsx               # Main app layout with data state and empty state
  index.css             # Tailwind CSS import
```

## Key Implementation Details

### App.jsx
- Manages data state with `useState(null)` - starts empty
- Shows empty state when no data loaded with link to import
- Passes `onImportClick` to BiomarkerTable for toolbar button
- Renders JsonPasteModal controlled by `isModalOpen` state

### JsonPasteModal.jsx
- Modal overlay with large textarea for pasting JSON
- Validates JSON structure (must have `reports` array)
- Shows error messages for invalid JSON
- Clears state on close/submit

### transformData.js
- `parseDate(dateStr)`: Parses "D-MMM-YYYY" format dates
- `getColumnKey(report)`: Generates unique column ID from date + lab name
- `transformToMatrix(reports)`: Converts reports array to matrix format, sorted newest first
- `getAllBiomarkers(reports)`: Extracts all unique biomarker names

### BiomarkerTable.jsx
- Uses TanStack Table with `enableColumnResizing: true` and `columnResizeMode: 'onChange'`
- Calculates biomarker column width based on longest name
- Uses `meta.isBiomarkerColumn` to apply different styling to first column
- Table uses `tableLayout: 'fixed'` for predictable column widths
- "Import Data" button in toolbar with upload icon (matches Columns button style)

### ResultCell.jsx
- Renders result value (bold), unit, and reference range
- All content centered with `items-center`
- Shows "-" for missing/empty values
