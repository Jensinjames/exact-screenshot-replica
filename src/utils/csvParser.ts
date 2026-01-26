export interface ParsedCSVRow {
  [key: string]: string;
}

export interface CSVParseResult {
  headers: string[];
  rows: ParsedCSVRow[];
  errors: string[];
}

/**
 * Parse a CSV string into structured data
 * Handles quoted values, escaped characters, and various line endings
 */
export function parseCSV(csvText: string): CSVParseResult {
  const errors: string[] = [];
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ['CSV file is empty'] };
  }

  // Parse headers from first line
  const headers = parseCSVLine(lines[0]);
  
  if (headers.length === 0) {
    return { headers: [], rows: [], errors: ['No headers found in CSV'] };
  }

  const rows: ParsedCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      
      // Create row object mapping headers to values
      const row: ParsedCSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    } catch (error) {
      errors.push(`Error parsing row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { headers, rows, errors };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        // End of quoted value
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        // Start of quoted value
        inQuotes = true;
      } else if (char === ',') {
        // End of value
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  
  // Don't forget the last value
  values.push(current.trim());
  
  return values;
}

/**
 * Validate that required columns exist in the CSV
 */
export function validateCSVColumns(
  headers: string[],
  requiredColumns: string[]
): { valid: boolean; missing: string[] } {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const missing = requiredColumns.filter(
    col => !normalizedHeaders.includes(col.toLowerCase().trim())
  );
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Find a column by partial name match (case-insensitive)
 */
export function findColumn(headers: string[], searchTerms: string[]): string | null {
  for (const term of searchTerms) {
    const found = headers.find(h => 
      h.toLowerCase().includes(term.toLowerCase())
    );
    if (found) return found;
  }
  return null;
}

/**
 * Parse a numeric value from a string, returning 0 for empty/invalid
 */
export function parseNumericValue(value: string | undefined): number {
  if (!value || value.trim() === '') return 0;
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Parse a date from M/D/YYYY format to YYYY-MM-DD
 */
export function parseDateValue(value: string): string | null {
  if (!value || value.trim() === '' || value.toUpperCase() === 'OFF') {
    return null;
  }
  
  // Try M/D/YYYY format
  const parts = value.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      const fullYear = year < 100 ? 2000 + year : year;
      return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  // Try ISO format already
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  
  return null;
}
