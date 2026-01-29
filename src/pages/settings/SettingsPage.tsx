import { Typography, Box, Paper } from '@mui/material'

const SettingsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Settings content coming soon...
        </Typography>
      </Paper>
    </Box>
  )
}

export default SettingsPage
