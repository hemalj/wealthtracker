import { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { format } from 'date-fns'
import { TransactionForm } from '@/components/forms/TransactionForm'
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useAuth } from '@/hooks/useAuth'
import type { CreateTransactionInput, Transaction } from '@/types'

const TransactionsPage = () => {
  const { user } = useAuth()
  const { data: transactions, isLoading, error } = useTransactions()
  const { data: accounts } = useAccounts()
  const createMutation = useCreateTransaction()
  const deleteMutation = useDeleteTransaction()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formError, setFormError] = useState('')

  const handleCreate = async (input: CreateTransactionInput) => {
    if (!user) return
    setFormError('')
    try {
      await createMutation.mutateAsync(input)
      setDialogOpen(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create transaction')
    }
  }

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await deleteMutation.mutateAsync(transactionId)
    } catch (err) {
      console.error(err)
    }
  }

  const getAccountName = (accountId: string) => {
    const account = accounts?.find((a) => a.id === accountId)
    return account?.name || accountId
  }

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate()
    return format(d, 'yyyy-MM-dd')
  }

  const formatTotal = (transaction: Transaction) => {
    if (transaction.totalAmount) {
      return `$${transaction.totalAmount.toFixed(2)}`
    }
    if (transaction.quantity && transaction.unitPrice) {
      return `$${(transaction.quantity * transaction.unitPrice).toFixed(2)}`
    }
    return '-'
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Failed to load transactions. Please try again.</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Transaction
        </Button>
      </Box>

      {formError && (
        <Alert severity="error" onClose={() => setFormError('')} sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      {isLoading ? (
        <Box>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
          ))}
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.date)}</TableCell>
                <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                <TableCell>{transaction.symbol}</TableCell>
                <TableCell>
                  <Chip label={transaction.type} size="small" />
                </TableCell>
                <TableCell align="right">{transaction.quantity || '-'}</TableCell>
                <TableCell align="right">
                  {transaction.unitPrice ? `$${transaction.unitPrice.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell align="right">{formatTotal(transaction)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleDelete(transaction.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {transactions?.length === 0 && !isLoading && (
        <Box textAlign="center" py={5}>
          <Typography color="textSecondary">
            No transactions yet. Add your first transaction to get started.
          </Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <TransactionForm
            accounts={accounts || []}
            onSubmit={handleCreate}
            onCancel={() => setDialogOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default TransactionsPage
