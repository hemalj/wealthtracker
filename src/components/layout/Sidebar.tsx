import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Calculate as CalculateIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'

const DRAWER_WIDTH = 260

interface NavItem {
  label: string
  path: string
  icon: React.ReactElement
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Accounts', path: '/accounts', icon: <AccountBalanceIcon /> },
  { label: 'Transactions', path: '/transactions', icon: <ReceiptIcon /> },
  { label: 'Investments', path: '/investments', icon: <TrendingUpIcon /> },
  { label: 'Calculators', path: '/calculators', icon: <CalculateIcon /> },
]

const bottomNavItems: NavItem[] = [
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleNavigation = (path: string) => {
    navigate(path)
    if (isMobile) {
      onClose()
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: 700, color: 'primary.main' }}
          >
            WealthTracker
          </Typography>
        </Box>
      </Toolbar>
      <Divider />

      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List sx={{ px: 1, py: 2 }}>
        {bottomNavItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive(item.path) ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}

export { DRAWER_WIDTH }
export default Sidebar
