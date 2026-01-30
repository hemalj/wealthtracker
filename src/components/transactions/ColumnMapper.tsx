import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material'

interface ColumnMapperProps {
  csvData: Record<string, string>[]
  onMappingComplete: (mapping: Record<string, string>) => void
  onCancel: () => void
}

const MAPPABLE_FIELDS = [
  { key: 'date', label: 'Date', required: true },
  { key: 'symbol', label: 'Symbol', required: true },
  { key: 'type', label: 'Type', required: true },
  { key: 'quantity', label: 'Quantity', required: false },
  { key: 'unitPrice', label: 'Unit Price', required: false },
  { key: 'totalAmount', label: 'Total Amount', required: false },
  { key: 'currency', label: 'Currency', required: true },
  { key: 'fees', label: 'Fees', required: false },
  { key: 'commission', label: 'Commission', required: false },
  { key: 'mer', label: 'MER', required: false },
  { key: 'notes', label: 'Notes', required: false },
]

// Auto-detect aliases for common CSV column names
const FIELD_ALIASES: Record<string, string[]> = {
  date: ['date', 'trade date', 'transaction date'],
  symbol: ['symbol', 'ticker', 'stock', 'code'],
  type: ['type', 'transaction type', 'action', 'side'],
  quantity: ['quantity', 'qty', 'shares', 'units', 'amount'],
  unitPrice: ['unit price', 'price', 'price per share', 'unitprice'],
  totalAmount: ['total amount', 'total', 'amount', 'totalamount', 'dividend'],
  currency: ['currency', 'cur', 'ccy'],
  fees: ['fees', 'fee', 'other fees'],
  commission: ['commission', 'comm', 'brokerage'],
  mer: ['mer', 'management expense', 'expense ratio'],
  notes: ['notes', 'note', 'memo', 'description', 'comment'],
}

export function ColumnMapper({
  csvData,
  onMappingComplete,
  onCancel,
}: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const csvColumns = useMemo(() => Object.keys(csvData[0] || {}), [csvData])

  useEffect(() => {
    const autoMapping: Record<string, string> = {}

    MAPPABLE_FIELDS.forEach((field) => {
      const aliases = FIELD_ALIASES[field.key] || [field.key]
      const match = csvColumns.find((col) =>
        aliases.some(
          (alias) => col.toLowerCase().trim() === alias.toLowerCase()
        )
      )
      if (match) {
        autoMapping[field.key] = match
      }
    })

    // Fallback: try substring matching for unmatched fields
    MAPPABLE_FIELDS.forEach((field) => {
      if (autoMapping[field.key]) return
      const match = csvColumns.find((col) =>
        col.toLowerCase().includes(field.key.toLowerCase())
      )
      if (match && !Object.values(autoMapping).includes(match)) {
        autoMapping[field.key] = match
      }
    })

    setMapping(autoMapping)
  }, [csvColumns])

  const handleMappingChange = (fieldKey: string, csvColumn: string) => {
    setMapping((prev) => {
      const updated = { ...prev }
      if (csvColumn === '') {
        delete updated[fieldKey]
      } else {
        updated[fieldKey] = csvColumn
      }
      return updated
    })
  }

  const canProceed = () => {
    return MAPPABLE_FIELDS.filter((f) => f.required).every(
      (field) => mapping[field.key]
    )
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Map CSV Columns
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={3}>
        Map your CSV columns to transaction fields. Required fields are marked
        with *. Preview of first 5 rows shown below.
      </Typography>

      <Box mb={3}>
        {MAPPABLE_FIELDS.map((field) => (
          <FormControl
            fullWidth
            margin="normal"
            key={field.key}
            required={field.required}
          >
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={mapping[field.key] || ''}
              onChange={(e) =>
                handleMappingChange(field.key, e.target.value as string)
              }
              label={field.label}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {csvColumns.map((col) => (
                <MenuItem key={col} value={col}>
                  {col}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Preview (First 5 Rows)
      </Typography>
      <Box sx={{ overflowX: 'auto', mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {csvColumns.map((col) => (
                <TableCell key={col}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {csvData.slice(0, 5).map((row, idx) => (
              <TableRow key={idx}>
                {csvColumns.map((col) => (
                  <TableCell key={col}>{row[col]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={() => onMappingComplete(mapping)}
          disabled={!canProceed()}
        >
          Continue to Validation
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  )
}
