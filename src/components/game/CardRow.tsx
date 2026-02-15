import Box, { BoxProps } from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type CardRowProps = BoxProps & {
  title: string
  actions?: React.ReactNode
}

const CardRow = ({ title, actions, children, ...rest }: CardRowProps) => (
  <Box {...rest}>
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
      <Typography variant="h5" textAlign="center">
        {title}
      </Typography>
      {actions}
    </Stack>
    <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {children}
    </Stack>
  </Box>
)

export default CardRow
