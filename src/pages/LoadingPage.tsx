import { Box, CircularProgress, Typography } from '@mui/material'

const LoadingPage = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="body1" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  )
}

export default LoadingPage
