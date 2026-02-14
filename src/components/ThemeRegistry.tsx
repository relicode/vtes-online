'use client'

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ThemeProvider } from '@mui/material/styles'

import theme from '$/theme'

type ThemeRegistryProps = {
  children: React.ReactNode
}

const ThemeRegistry = ({ children }: ThemeRegistryProps) => (
  <AppRouterCacheProvider options={{ enableCssLayer: true }}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{ html: { height: '100%' }, body: { height: '100%', display: 'flex' } }} />
      {children}
    </ThemeProvider>
  </AppRouterCacheProvider>
)

export default ThemeRegistry
