import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Toolbar } from '@mui/material'
import Header from './Header'
import Sidebar, { DRAWER_WIDTH } from './Sidebar'

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default MainLayout
