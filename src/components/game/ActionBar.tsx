import Box from '@mui/material/Box'
import Stack, { type StackProps } from '@mui/material/Stack'

type ActionBarProps = {
  children: StackProps['children']
  sx?: StackProps['sx']
}

const ActionBar = ({ children, sx }: ActionBarProps) => (
  <Box
    sx={{
      flex: 'none',
      bgcolor: 'background.default',
      p: 1,
      borderBottom: 1,
      borderTop: 1,
      borderColor: 'primary.light',
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={sx}>
      {children}
    </Stack>
  </Box>
)

export default ActionBar
