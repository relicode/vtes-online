import Box, { type BoxProps } from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type CardRowProps = BoxProps & {
  title?: ReactNode
}

const CardRow = ({ title, children, ...rest }: CardRowProps) => (
  <Box {...rest}>
    {title && (
      <Typography variant="h5" textAlign="center" sx={{ mb: 1 }}>
        {title}
      </Typography>
    )}
    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {children}
    </Stack>
  </Box>
)

export default CardRow
