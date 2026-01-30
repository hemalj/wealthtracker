import Papa from 'papaparse'

export interface CSVRow {
  [key: string]: string
}

export async function parseCSV(file: File): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as CSVRow[])
      },
      error: (error: Error) => {
        reject(error)
      },
    })
  })
}

export function generateCSVTemplate(): string {
  const headers = [
    'Date',
    'Symbol',
    'Type',
    'Quantity',
    'Unit Price',
    'Total Amount',
    'Currency',
    'Fees',
    'Commission',
    'MER',
    'Notes',
  ]

  const exampleRows = [
    [
      '2026-01-15',
      'AAPL',
      'buy',
      '100',
      '150.50',
      '',
      'USD',
      '0',
      '9.99',
      '',
      'Initial purchase',
    ],
    [
      '2026-01-20',
      'AAPL',
      'sell',
      '50',
      '155.25',
      '',
      'USD',
      '0',
      '9.99',
      '',
      'Partial sell',
    ],
    [
      '2026-02-01',
      'RY',
      'dividend',
      '',
      '',
      '125.50',
      'CAD',
      '',
      '',
      '',
      'Q1 dividend',
    ],
  ]

  return Papa.unparse([headers, ...exampleRows])
}
