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
  Card,
  CardContent,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { TransactionForm } from '@/components/forms/TransactionForm'
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
} from '@/hooks/useTransactions'
import { useAccounts } from '@/hooks/useAccounts'
import { useAuth } from '@/hooks/useAuth'
import type { CreateTransactionInput, Transaction } from '@/types'

const typeColorMap: Record<string, 'success' | 'error' | 'info' | 'warning' | 'default'> = {
  buy: 'success',
  sell: 'error',
  dividend: 'info',
  initial_position: 'warning',
  split_forward: 'default',
  split_reverse: 'default',
}

const TransactionsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: transactions, isLoading, error } = useTransactions()
  const { data: accounts } = useAccounts()
  const createMutation = useCreateTransaction()
  const deleteMutation = useDeleteTransaction()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

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
    return format(d, 'MMM d, yyyy')
  }

  const formatDateShort = (date: Date | { toDate: () => Date }) => {
    const d = date instanceof Date ? date : date.toDate()
    return format(d, 'yyyy-MM-dd')
  }

  const formatTotal = (transaction: Transaction) => {
    if (transaction.totalAmount) {
      return `$${transaction.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    if (transaction.quantity && transaction.unitPrice) {
      return `$${(transaction.quantity * transaction.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        mb={3}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h4'}
          noWrap
          sx={isMobile ? { fontSize: '1.5rem' } : undefined}
        >
          Transactions
        </Typography>
        <Box display="flex" gap={1} flexShrink={0}>
          {isMobile ? (
            <>
              <IconButton
                color="primary"
                onClick={() => navigate('/transactions/import')}
                sx={{ width: 40, height: 40 }}
              >
                <UploadIcon />
              </IconButton>
              <IconButton
                color="primary"
                onClick={() => setDialogOpen(true)}
                sx={{ width: 40, height: 40 }}
              >
                <AddIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadIcon />}
                onClick={() => navigate('/transactions/import')}
              >
                Import CSV
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
              >
                Add Transaction
              </Button>
            </>
          )}
        </Box>
      </Box>

      {formError && (
        <Alert severity="error" onClose={() => setFormError('')} sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      {isLoading ? (
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={isMobile ? 88 : 60} />
          ))}
        </Stack>
      ) : isMobile ? (
        /* Mobile: Card layout */
        <Stack spacing={1.5}>
          {transactions?.map((transaction) => (
            <Card key={transaction.id} variant="outlined">
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                {/* Row 1: Symbol + Type chip | Amount + Delete */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {transaction.symbol}
                    </Typography>
                    <Chip
                      label={transaction.type.replace('_', ' ')}
                      size="small"
                      color={typeColorMap[transaction.type] || 'default'}
                      sx={{ textTransform: 'capitalize', height: 22 }}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{
                        color:
                          transaction.type === 'sell'
                            ? 'error.main'
                            : transaction.type === 'dividend'
                              ? 'info.main'
                              : 'text.primary',
                      }}
                    >
                      {formatTotal(transaction)}
                    </Typography>
                    <IconButton size="small" onClick={() => handleDelete(transaction.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Row 2: Date, Account, Currency */}
                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mt={0.25}>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(transaction.date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getAccountName(transaction.accountId)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.currency}
                  </Typography>
                </Box>

                {/* Row 3: Qty × Price, Commission, MER */}
                {(transaction.quantity || transaction.commission || transaction.mer) && (
                  <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mt={0.25}>
                    {transaction.quantity && transaction.unitPrice ? (
                      <Typography variant="body2" color="text.secondary">
                        {transaction.quantity} × ${transaction.unitPrice.toFixed(2)}
                      </Typography>
                    ) : null}
                    {transaction.commission ? (
                      <Typography variant="body2" color="text.secondary">
                        Comm: ${transaction.commission.toFixed(2)}
                      </Typography>
                    ) : null}
                    {transaction.mer ? (
                      <Typography variant="body2" color="text.secondary">
                        MER: {transaction.mer.toFixed(2)}%
                      </Typography>
                    ) : null}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        /* Desktop: Table layout */
        <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Commission</TableCell>
              <TableCell align="right">MER</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDateShort(transaction.date)}</TableCell>
                <TableCell>{getAccountName(transaction.accountId)}</TableCell>
                <TableCell>{transaction.symbol}</TableCell>
                <TableCell>
                  <Chip
                    label={transaction.type.replace('_', ' ')}
                    size="small"
                    color={typeColorMap[transaction.type] || 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>{transaction.currency}</TableCell>
                <TableCell align="right">{transaction.quantity || '-'}</TableCell>
                <TableCell align="right">
                  {transaction.unitPrice ? `$${transaction.unitPrice.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell align="right">{formatTotal(transaction)}</TableCell>
                <TableCell align="right">
                  {transaction.commission ? `$${transaction.commission.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell align="right">
                  {transaction.mer ? `${transaction.mer.toFixed(2)}%` : '-'}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleDelete(transaction.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Box>
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
