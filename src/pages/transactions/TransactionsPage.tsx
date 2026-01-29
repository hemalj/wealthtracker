import { Typography, Box, Paper } from '@mui/material'

const TransactionsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Transactions
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Transactions content coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}

export default TransactionsPage
