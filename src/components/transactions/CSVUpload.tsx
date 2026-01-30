import { useState, useRef } from 'react'
import { Box, Button, Typography, LinearProgress, Alert } from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from '@mui/icons-material'
import { parseCSV, generateCSVTemplate } from '@/utils/csvParser'
import type { CSVRow } from '@/utils/csvParser'

interface CSVUploadProps {
  onFileUploaded: (data: CSVRow[]) => void
}

export function CSVUpload({ onFileUploaded }: CSVUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')
    setLoading(true)

    try {
      const data = await parseCSV(file)

      if (data.length === 0) {
        setError('CSV file is empty')
        return
      }

      if (data.length > 10000) {
        setError('CSV file contains more than 10,000 rows')
        return
      }

      onFileUploaded(data)
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to parse CSV file'
      )
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownloadTemplate = () => {
    const csv = generateCSVTemplate()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transaction_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box>
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          disabled={loading}
        >
          Upload CSV
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept=".csv"
            onChange={handleFileSelect}
          />
        </Button>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTemplate}
        >
          Download Template
        </Button>
      </Box>

      {loading && (
        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            Parsing CSV...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="textSecondary">
        Upload a CSV file with your transaction history. Max 10MB, 10,000
        rows. Download the template for the expected format.
      </Typography>
    </Box>
  )
}
