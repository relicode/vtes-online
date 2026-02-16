import Stack from '@mui/material/Stack'
import type { ReactNode } from 'react'

const GameLayout = ({ children }: { children: ReactNode }) => <Stack sx={{ flex: 1, minHeight: 0 }}>{children}</Stack>

export default GameLayout
