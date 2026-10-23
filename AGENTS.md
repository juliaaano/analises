# Health Biomarker Dashboard

## Project Overview
A React SPA that displays health biomarker data from laboratory reports in a matrix/table format with filtering, column visibility controls, and resizable columns.

## Tech Stack
- **React 19** with Vite
- **TanStack Table** (React Table v8) for table with filtering, column visibility, and resizing
- **Tailwind CSS v4** for styling (uses @tailwindcss/vite plugin)

## Data Source
- The app itself has no built-in data loading — data is imported at runtime via the paste modal, and held in React state (not persisted between sessions)
- JSON format with a `reports` array, validated against `data/health_data_schema.json`
- `data/` holds the source PDFs, the JSON schema, and the JSON produced from each import (see PDF Import Workflow below) — these are repo-tracked reference data, not loaded by the app automatically

## Biomarker Registry
- `biomarkers.txt` at project root defines the display order of biomarkers
- Plain text file, one biomarker name per line — line position determines sort order
- A trailing `*` or `**` on a line sets an attention level (1 = amber, 2 = red) used to highlight that biomarker's row regardless of its value; the asterisks are stripped from the displayed/matched name
- Imported at build time via Vite `?raw` import (inlined into bundle, no runtime fetch)
- Parsed by `src/utils/biomarkerRegistry.js`
- Biomarkers in imported data that are **not** in the registry appear last (sorted alphabetically) with visual warnings: amber-tinted row, warning icon, and tooltip

## PDF Import Workflow

This is the repeatable process for turning a new lab report PDF into a JSON file matching `data/health_data_schema.json`.

1. **Place the PDF** in `data/pdf/` (keep the lab's original filename, e.g. `Rel8143105_10_10_2026.pdf`).
2. **Extract with the `pdf` skill.** Use `pdfplumber` (install via `pip3 install pdfplumber` if missing — there's no `pdftotext` CLI in this environment) to pull text per page:
   ```python
   import pdfplumber
   with pdfplumber.open("data/pdf/<file>.pdf") as pdf:
       for page in pdf.pages:
           print(page.extract_text())
   ```
   For anything ambiguous (merged columns, odd units, superscript/subscript glyphs, a logo-only lab name with no text layer), render the page to an image (`page.to_image(resolution=200).save(...)`) and read it visually — text extraction alone can misalign columns (e.g. a unit from one row bleeding into the row above/below).
3. **Map every test name to the canonical name in `biomarkers.txt`.** Strip trailing `*`/`**` from registry lines (those are attention-level markers, not part of the name — see `src/utils/biomarkerRegistry.js`). Match on meaning, not literal PDF wording — labs abbreviate inconsistently across reports (e.g. PDF's "V.G.M." → registry's "Vol. Glob. Médio (VGM)", "Siderémia" → "Ferro Sérico / Siderémia", "Hemoglobina Glicada (A1c) [NGSP]" → "HbA1c (NGSP/DCCT)"). Preserve the registry's exact spelling even when it contains a typo (e.g. registry has "Cortisol **Plamático** Basal", missing the 's' — use that exact string so the row matches the registry and isn't flagged as unregistered).
4. **Pending/in-progress tests**: labs often list tests still being processed in a section like "Análises em curso" with no result yet. Add one entry per pending test with `result`, `unit`, and `reference` all set to `""` (empty string), using just the canonical biomarker name. When a follow-up PDF arrives with the completed results, update those same entries in place rather than duplicating them.
5. **New biomarkers not yet in the registry**: if a test has no match in `biomarkers.txt` (even approximately), ask the user whether to add it (and where it should sort) before inventing a mapping. Don't silently rename it to fit an existing entry.
6. **Flag anything uncertain before writing the JSON** — don't guess silently. In practice this has included: a unit that's physically implausible for the test (e.g. a creatinine result printed with a flow-rate unit, clearly a copy-paste template bug in the lab's own PDF), a reference range given as categorical bands instead of a simple range (e.g. Vitamin D's Deficiência/Insuficiência/Suficiência/Toxicidade bands), and a lab name only present as a logo image (crop + view the image to read it, then confirm the naming convention against prior imports, e.g. "Germano de Sousa" → `lab_name: "CUF / Germano"`).
7. **Units: don't silently change them.** Write each unit as the PDF prints it. If a unit would differ from the PDF (casing, symbols, spacing, anything) or from the unit already used for that biomarker in the existing `data/health_data*.json` files, highlight the difference and ask the user what to do before writing it.
   - **Accepted deviations** (approved by the user; no need to flag again, and the verification agent should not report them):
     - Vitamin D reference: only the Suficiência band (`30 - 100`), not the full band text.
     - Superscript exponents written as `^` with no space after "x": `x10^6/μl`, `x10^3/μl`.
     - Micro sign written as Greek `μ` (U+03BC), not the PDF's `µ` (U+00B5).
     - TFGe decimal comma written as a point: `ml/min/1.73 m2`.
     - Urine Hemoglobina unit left `""` even when the PDF prints `mg/dL`.
8. **Validate before finishing**:
   - `python3 -c "import json, jsonschema; jsonschema.validate(json.load(open('data/<new>.json')), json.load(open('data/health_data_schema.json')))"`
   - Check every `name` in the new JSON appears in `biomarkers.txt` (after stripping trailing asterisks) so nothing shows the amber "unregistered" warning unexpectedly.
   - Check for duplicate names within the same report.
9. **Independent verification.** Dispatch a separate agent with no access to the extraction work's context to re-derive the PDF's values from scratch (its own script/tooling pass) and diff them against the finished JSON, including the schema check and registry-name check. Have it report findings only — do not auto-apply fixes; review discrepancies yourself and present them to the user.

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
- Each cell shows: result, unit, and reference range (centered); unit and reference range are each independently toggleable (reference range is hidden by default)
- Rows for biomarkers with a registry attention level are tinted amber (level 1) or red (level 2); unregistered biomarkers are tinted amber separately with a warning icon

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
- Unit and reference range toggle buttons ("U" / "R") in the toolbar to hide/show those parts of each cell
- Row counter in the toolbar shows how many biomarkers are visible out of the total

## Documentation
Use Context7 MCP tools (`resolve-library-id` and `query-docs`) to fetch up-to-date documentation for libraries.

## Commands
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

## Deployment
- Deployed to GitHub Pages via GitHub Actions
- Workflow: `.github/workflows/deploy.yml`
- Triggers on push to `main` branch or manual dispatch
- Deploys to `https://<username>.github.io/analises/`
- Base path configured in `vite.config.js` as `/analises/`

## File Structure
```
.github/
  workflows/
    deploy.yml            # GitHub Actions workflow for GitHub Pages
biomarkers.txt              # Biomarker registry (display order, attention levels)
data/
  pdf/                   # Source lab report PDFs
  health_data_schema.json # JSON schema for imported report data
  health_data_*.json      # JSON produced by the PDF Import Workflow, one per import
src/
  components/           # React components
    BiomarkerTable.jsx  # Main table with TanStack Table (resizing, visibility)
    BiomarkerFilter.jsx # Multi-select biomarker filter with search
    ColumnToggle.jsx    # Column visibility dropdown
    JsonPasteModal.jsx  # Modal for pasting JSON data
    ResultCell.jsx      # Cell renderer (result, unit, reference - centered)
  utils/
    biomarkerRegistry.js # Parses biomarkers.txt, exports isRegistered(), getAttentionLevel(), sortBiomarkers()
    transformData.js    # Data transformation (sorting, matrix conversion)
  App.jsx               # Main app layout with data state and empty state
  index.css             # Tailwind CSS import
```

Row-level annotations (`_isRegistered`, `_attentionLevel`) are computed in `BiomarkerTable.jsx` from `biomarkerRegistry.js` lookups and drive the row tinting described above — this wiring spans both files, so it's worth knowing before changing either.
