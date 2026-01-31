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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { AccountForm } from '@/components/forms/AccountForm'
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '@/hooks/useAccounts'
import { useAuth } from '@/hooks/useAuth'
import type { Account, CreateAccountInput } from '@/types'

const accountTypeLabels: Record<string, string> = {
  taxable: 'Taxable',
  ira: 'IRA',
  roth_ira: 'Roth IRA',
  '401k': '401(k)',
  tfsa: 'TFSA',
  rrsp: 'RRSP',
  other: 'Other',
}

const AccountsPage = () => {
  const { user } = useAuth()
  const { data: accounts, isLoading, error } = useAccounts()
  const createMutation = useCreateAccount()
  const updateMutation = useUpdateAccount()
  const deleteMutation = useDeleteAccount()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formError, setFormError] = useState('')

  const handleCreate = async (input: CreateAccountInput) => {
    if (!user) return
    setFormError('')
    try {
      await createMutation.mutateAsync(input)
      setDialogOpen(false)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create account')
    }
  }

  const handleEdit = async (input: CreateAccountInput) => {
    if (!editingAccount) return
    setFormError('')
    try {
      await updateMutation.mutateAsync({
        accountId: editingAccount.id,
        input,
      })
      setDialogOpen(false)
      setEditingAccount(null)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to update account')
    }
  }

  const handleDelete = async (accountId: string) => {
    if (!confirm('Delete this account? This action cannot be undone.')) return
    try {
      await deleteMutation.mutateAsync(accountId)
    } catch (err: unknown) {
      console.error('Failed to delete account:', err)
    }
  }

  const openCreateDialog = () => {
    setEditingAccount(null)
    setFormError('')
    setDialogOpen(true)
  }

  const openEditDialog = (account: Account) => {
    setEditingAccount(account)
    setFormError('')
    setDialogOpen(true)
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Failed to load accounts. Please try again.</Alert>
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
          Accounts
        </Typography>
        <Box flexShrink={0}>
          {isMobile ? (
            <IconButton
              color="primary"
              onClick={openCreateDialog}
              sx={{ width: 40, height: 40 }}
            >
              <AddIcon />
            </IconButton>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
            >
              Add Account
            </Button>
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
            <Skeleton key={i} variant="rounded" height={isMobile ? 72 : 60} />
          ))}
        </Stack>
      ) : isMobile ? (
        /* Mobile: Card layout */
        <Stack spacing={1.5}>
          {accounts?.map((account) => (
            <Card key={account.id} variant="outlined">
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                {/* Row 1: Name + Type chip | Edit + Delete actions */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="subtitle1" fontWeight={600}>
                      {account.name}
                    </Typography>
                    <Chip
                      label={accountTypeLabels[account.type] || account.type}
                      size="small"
                      sx={{ height: 22 }}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                    <IconButton size="small" onClick={() => openEditDialog(account)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(account.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Row 2: Currency, Description */}
                <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" mt={0.25}>
                  <Typography variant="body2" color="text.secondary">
                    {account.currency}
                  </Typography>
                  {account.description && (
                    <Typography variant="body2" color="text.secondary">
                      {account.description}
                    </Typography>
                  )}
                </Box>
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
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts?.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>
                  <Chip label={accountTypeLabels[account.type] || account.type} size="small" />
                </TableCell>
                <TableCell>{account.currency}</TableCell>
                <TableCell>{account.description || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEditDialog(account)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(account.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </Box>
      )}

      {accounts?.length === 0 && !isLoading && (
        <Box textAlign="center" py={5}>
          <Typography color="textSecondary">
            No accounts yet. Create your first account to get started.
          </Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAccount ? 'Edit Account' : 'Create Account'}</DialogTitle>
        <DialogContent>
          <AccountForm
            initialValues={
              editingAccount
                ? {
                    name: editingAccount.name,
                    type: editingAccount.type,
                    currency: editingAccount.currency,
                    description: editingAccount.description,
                  }
                : undefined
            }
            onSubmit={editingAccount ? handleEdit : handleCreate}
            onCancel={() => setDialogOpen(false)}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
}

export default AccountsPage
