import { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { CSVUpload } from '@/components/transactions/CSVUpload'
import { ColumnMapper } from '@/components/transactions/ColumnMapper'
import { ValidationPreview } from '@/components/transactions/ValidationPreview'
import { useBulkCreateTransactions } from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import type { CreateTransactionInput, TransactionType } from '@/types'
import type { CSVRow } from '@/utils/csvParser'
import { parseCurrencyNumber } from '@/utils/csvValidator'

const steps = ['Upload CSV', 'Map Columns', 'Validate & Preview', 'Import']

const ImportPage = () => {
  const navigate = useNavigate()
  const bulkCreateMutation = useBulkCreateTransactions()
  const { data: accounts } = useAccounts()

  const [activeStep, setActiveStep] = useState(0)
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [error, setError] = useState('')
  const [importProgress, setImportProgress] = useState(0)

  const handleFileUploaded = (data: CSVRow[]) => {
    setCsvData(data)
    setActiveStep(1)
  }

  const handleMappingComplete = (newMapping: Record<string, string>) => {
    setMapping(newMapping)
    setActiveStep(2)
  }

  const handleImport = async (validRows: Record<string, string>[]) => {
    setActiveStep(3)
    setError('')
    setImportProgress(0)

    try {
      const transactions: CreateTransactionInput[] = validRows.map((row) => {
        const type = row[mapping.type].toLowerCase() as TransactionType

        const input: CreateTransactionInput = {
          accountId: selectedAccountId,
          symbol: row[mapping.symbol].toUpperCase(),
          type,
          date: new Date(row[mapping.date]),
          currency: row[mapping.currency].toUpperCase(),
        }

        // Numeric fields — strip currency formatting, use absolute values
        // System stores all quantities as positive; type field determines direction
        const hasQty = mapping.quantity && row[mapping.quantity]?.trim()
        const hasPrice = mapping.unitPrice && row[mapping.unitPrice]?.trim()

        if (hasQty) {
          input.quantity = Math.abs(parseCurrencyNumber(row[mapping.quantity]))
        }
        if (hasPrice) {
          input.unitPrice = Math.abs(parseCurrencyNumber(row[mapping.unitPrice]))
        }

        // totalAmount: only used for dividends, and only when qty+unitPrice are not provided
        if (type === 'dividend') {
          if (hasQty && hasPrice) {
            // Dividend with qty × unitPrice — ignore totalAmount
          } else if (mapping.totalAmount && row[mapping.totalAmount]?.trim()) {
            input.totalAmount = Math.abs(parseCurrencyNumber(row[mapping.totalAmount]))
          }
        }
        // Non-dividend transactions: never use totalAmount

        if (mapping.fees && row[mapping.fees]?.trim()) {
          input.fees = parseCurrencyNumber(row[mapping.fees])
        } else {
          input.fees = 0
        }
        if (mapping.commission && row[mapping.commission]?.trim()) {
          input.commission = parseCurrencyNumber(row[mapping.commission])
        } else {
          input.commission = 0
        }
        if (mapping.mer && row[mapping.mer]?.trim()) {
          input.mer = parseCurrencyNumber(row[mapping.mer])
        }
        if (mapping.notes && row[mapping.notes]) {
          input.notes = row[mapping.notes].slice(0, 500)
        }

        return input
      })

      if (transactions.length === 0) {
        setError('No valid transactions to import')
        return
      }

      // Import in batches with progress
      const batchSize = 100
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize)
        await bulkCreateMutation.mutateAsync(batch)
        setImportProgress(
          Math.min(100, Math.round(((i + batch.length) / transactions.length) * 100))
        )
      }

      navigate('/transactions')
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Import failed. Please try again.'
      )
    }
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Import Transactions from CSV
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }} required disabled={activeStep === 3}>
        <InputLabel>Account</InputLabel>
        <Select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value as string)}
          label="Account"
        >
          {accounts?.map((account) => (
            <MenuItem key={account.id} value={account.id}>
              {account.name} ({account.type})
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption" color="textSecondary" mt={0.5}>
          All imported transactions will be added to this account.
        </Typography>
      </FormControl>

      {!selectedAccountId && activeStep < 3 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select an account above before importing.
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && selectedAccountId && (
        <CSVUpload onFileUploaded={handleFileUploaded} />
      )}

      {activeStep === 1 && (
        <ColumnMapper
          csvData={csvData}
          onMappingComplete={handleMappingComplete}
          onCancel={() => setActiveStep(0)}
        />
      )}

      {activeStep === 2 && (
        <ValidationPreview
          csvData={csvData}
          mapping={mapping}
          onProceed={handleImport}
          onBack={() => setActiveStep(1)}
        />
      )}

      {activeStep === 3 && (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" gutterBottom>
            Importing transactions...
          </Typography>
          <LinearProgress
            variant="determinate"
            value={importProgress}
            sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}
          />
          <Typography variant="body2" color="textSecondary">
            {importProgress}% complete
          </Typography>
        </Box>
      )}
    </Container>
  )
}

export default ImportPage
