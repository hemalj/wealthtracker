import { Typography, Box, Paper, Grid, Card, CardContent, Skeleton } from '@mui/material'
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
} from '@mui/icons-material'
import { useAuth } from '@/hooks/useAuth'

interface SummaryCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactElement
  loading?: boolean
}

const SummaryCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading = false,
}: SummaryCardProps) => {
  const changeColor =
    changeType === 'positive'
      ? 'success.main'
      : changeType === 'negative'
        ? 'error.main'
        : 'text.secondary'

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Box
            sx={{
              backgroundColor: 'primary.light',
              borderRadius: 1,
              p: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
        {loading ? (
          <>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" />
          </>
        ) : (
          <>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {change && (
              <Typography variant="body2" sx={{ color: changeColor, mt: 1 }}>
                {changeType === 'positive' && '+'}
                {change} from last month
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

const DashboardPage = () => {
  const { user } = useAuth()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {greeting()}, {user?.displayName?.split(' ')[0] || 'there'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your finances
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Net Worth"
            value="$0.00"
            change="$0.00"
            changeType="neutral"
            icon={<AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Total Assets"
            value="$0.00"
            change="0%"
            changeType="neutral"
            icon={<TrendingUpIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Total Liabilities"
            value="$0.00"
            change="0%"
            changeType="neutral"
            icon={<TrendingDownIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            title="Monthly Savings"
            value="$0.00"
            change="0%"
            changeType="neutral"
            icon={<SavingsIcon sx={{ color: 'primary.main', fontSize: 20 }} />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Net Worth Over Time
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100% - 40px)',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                Add accounts to see your net worth chart
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Transactions
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100% - 40px)',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                No transactions yet
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Accounts Summary
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100% - 40px)',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                No accounts added yet
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Spending by Category
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'calc(100% - 40px)',
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                Add transactions to see spending breakdown
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DashboardPage
