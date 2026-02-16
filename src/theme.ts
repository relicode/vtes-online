'use client'

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: 'var(--font-inter), Roboto, Arial, sans-serif',
  },
  colorSchemes: { light: true, dark: true },
  components: {
    MuiStack: {
      defaultProps: {
        useFlexGap: true,
      },
    },
  },
})

export default theme
