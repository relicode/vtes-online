import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import ThemeRegistry from '$/app/ThemeRegistry'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'VTES Online',
  description: 'Play VTES - Online',
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => (
  <html lang="en" suppressHydrationWarning>
    <body className={inter.variable}>
      <InitColorSchemeScript attribute="class" />
      <ThemeRegistry>{children}</ThemeRegistry>
    </body>
  </html>
)

export default RootLayout
