import { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
} from '@mui/material'
import { validateTransactionRow } from '@/utils/csvValidator'

interface ValidationPreviewProps {
  csvData: Record<string, string>[]
  mapping: Record<string, string>
  onProceed: (validRows: Record<string, string>[]) => void
  onBack: () => void
}

export function ValidationPreview({
  csvData,
  mapping,
  onProceed,
  onBack,
}: ValidationPreviewProps) {
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)

  const validatedRows = useMemo(
    () =>
      csvData.map((row, index) => ({
        row,
        index,
        validation: validateTransactionRow(row, mapping),
      })),
    [csvData, mapping]
  )

  const validCount = validatedRows.filter((r) => r.validation.isValid).length
  const errorCount = validatedRows.filter(
    (r) => !r.validation.isValid
  ).length
  const warningCount = validatedRows.filter(
    (r) => r.validation.isValid && r.validation.warnings.length > 0
  ).length

  const displayRows = showErrorsOnly
    ? validatedRows.filter((r) => !r.validation.isValid)
    : validatedRows

  const handleProceed = () => {
    const validRows = validatedRows
      .filter((r) => r.validation.isValid)
      .map((r) => r.row)
    onProceed(validRows)
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Validation Results
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Chip label={`${validCount} Valid`} color="success" />
        {errorCount > 0 && (
          <Chip label={`${errorCount} Errors`} color="error" />
        )}
        {warningCount > 0 && (
          <Chip label={`${warningCount} Warnings`} color="warning" />
        )}
      </Box>

      {errorCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {errorCount} row{errorCount !== 1 ? 's have' : ' has'} errors and
          will be skipped during import.
          <Button
            size="small"
            onClick={() => setShowErrorsOnly(!showErrorsOnly)}
            sx={{ ml: 2 }}
          >
            {showErrorsOnly ? 'Show All' : 'Show Errors Only'}
          </Button>
        </Alert>
      )}

      <Box sx={{ overflowX: 'auto', mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Row</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Issues</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRows.slice(0, 100).map(({ row, index, validation }) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {validation.isValid ? (
                    <Chip label="Valid" color="success" size="small" />
                  ) : (
                    <Chip label="Error" color="error" size="small" />
                  )}
                </TableCell>
                <TableCell>{row[mapping.symbol]}</TableCell>
                <TableCell>{row[mapping.type]}</TableCell>
                <TableCell>{row[mapping.date]}</TableCell>
                <TableCell>{row[mapping.currency]}</TableCell>
                <TableCell>
                  {validation.errors.map((err, i) => (
                    <Typography
                      key={`e${i}`}
                      variant="caption"
                      color="error"
                      display="block"
                    >
                      {err}
                    </Typography>
                  ))}
                  {validation.warnings.map((warn, i) => (
                    <Typography
                      key={`w${i}`}
                      variant="caption"
                      color="warning.main"
                      display="block"
                    >
                      {warn}
                    </Typography>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {displayRows.length > 100 && (
        <Typography variant="body2" color="textSecondary" mb={2}>
          Showing first 100 rows. Total: {displayRows.length}
        </Typography>
      )}

      <Box display="flex" gap={2}>
        <Button
          variant="contained"
          onClick={handleProceed}
          disabled={validCount === 0}
        >
          Import {validCount} Valid Transaction{validCount !== 1 ? 's' : ''}
        </Button>
        <Button variant="outlined" onClick={onBack}>
          Back to Mapping
        </Button>
      </Box>
    </Box>
  )
}
