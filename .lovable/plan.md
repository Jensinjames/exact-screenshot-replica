
## CSV Import Feature for Production Runs

This plan adds a CSV import feature to the Production Runs page, allowing bulk import of historical production data from the uploaded spreadsheet.

---

### Data Mapping Analysis

The uploaded CSV contains production run data with these key columns:

| CSV Column | Database Mapping |
|------------|------------------|
| Date | `production_runs.run_date` |
| Medium Traditional | output: size="medium", variety="traditional" |
| Mini | output: size="mini", variety="traditional" |
| Medium Glazed, CreamCheese, Bavarian, etc. | output: size="medium", variety="filled" (combined) |
| Large Traditional | output: size="large", variety="traditional" |
| Total Dough Eq | `production_runs.doughs_produced` |
| Ordered, Donation, Notes columns | `production_runs.notes` (optional metadata) |

**Note:** The current database only supports two varieties (`traditional`, `filled`), so filled variants (CreamCheese, Bavarian, Glazed, etc.) will be combined into a single "filled" output entry per run.

---

### Implementation Plan

#### 1. Create CSV Parser Utility
**New file:** `src/utils/csvParser.ts`

A reusable CSV parsing utility that:
- Handles quoted values and escaped characters
- Validates required columns
- Returns typed row data

#### 2. Create Import Dialog Component
**New file:** `src/components/production/ImportRunsDialog.tsx`

A dialog component with:
- File upload input (accepts .csv files)
- Preview table showing parsed data
- Validation feedback (skipped rows, errors)
- Import progress indicator
- Success/error summary

#### 3. Create Import Hook
**New file:** `src/hooks/production/useImportProductionRuns.ts`

A mutation hook that:
- Accepts parsed CSV data
- Transforms rows to database format
- Batch inserts production runs and outputs
- Handles duplicate date detection
- Reports progress and errors

#### 4. Update Production Runs Page
**Modified file:** `src/pages/ProductionRuns.tsx`

Add import button next to "New Run" button in the page header.

#### 5. Update Component Exports
**Modified file:** `src/components/production/index.ts`

Export the new `ImportRunsDialog` component.

---

### CSV Row Processing Logic

```text
For each CSV row:
  1. Skip if Date = "OFF" or empty
  2. Parse date from "M/D/YYYY" format to "YYYY-MM-DD"
  3. Calculate doughs_produced from "Total Dough Eq" column
  4. Create outputs array:
     - If "Mini" > 0: add {size: "mini", variety: "traditional", quantity: value}
     - If "Medium Traditional" > 0: add {size: "medium", variety: "traditional", quantity: value}
     - If "Large Traditional" > 0: add {size: "large", variety: "traditional", quantity: value}
     - Sum all filled varieties and if > 0: add {size: "medium", variety: "filled", quantity: sum}
  5. Insert production_run with date and doughs
  6. Insert production_run_outputs linked to run
```

---

### User Interface Flow

```text
+------------------+     +-------------------+     +------------------+
|  Click Import    | --> | Select CSV File   | --> | Preview & Validate |
|  Button          |     | (file picker)     |     | (show parsed rows) |
+------------------+     +-------------------+     +------------------+
                                                           |
                                                           v
+------------------+     +-------------------+     +------------------+
|  View Results    | <-- | Import Progress   | <-- | Confirm Import   |
|  (success count) |     | (progress bar)    |     | (click button)   |
+------------------+     +-------------------+     +------------------+
```

---

### Validation Rules

1. **Required columns**: Date, at least one quantity column
2. **Skip rows**: Where Date = "OFF" or all quantities are empty/zero
3. **Duplicate detection**: Warn if run_date already exists in database
4. **Data validation**: Quantities must be non-negative integers

---

### Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/csvParser.ts` | Create | Generic CSV parsing utility |
| `src/components/production/ImportRunsDialog.tsx` | Create | Import dialog with preview and progress |
| `src/hooks/production/useImportProductionRuns.ts` | Create | Mutation hook for batch import |
| `src/pages/ProductionRuns.tsx` | Update | Add Import button to header |
| `src/components/production/index.ts` | Update | Export ImportRunsDialog |

**Total: 3 new files, 2 updated files**

---

### Sample Imported Data

From the uploaded CSV, these rows would be imported:

| Date | Doughs | Mini Trad | Med Trad | Med Filled | Large Trad |
|------|--------|-----------|----------|------------|------------|
| 2026-01-05 | 1.07 | 38 | 38 | 7 | 0 |
| 2026-01-06 | 1.00 | 64 | 35 | 0 | 0 |
| 2026-01-07 | 1.04 | 43 | 42 | 1 | 0 |
| 2026-01-08 | 1.02 | 126 | 19 | 0 | 0 |
| ... | ... | ... | ... | ... | ... |

Rows with "OFF" dates (1/11, 1/13, 1/16, 1/18, 1/21, 1/22, 1/24) will be skipped.
