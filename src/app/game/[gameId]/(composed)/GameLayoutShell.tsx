'use client'

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useState, type ReactNode } from 'react'

type GameLayoutShellProps = {
  public: ReactNode
  player: ReactNode
  log: ReactNode
}

type CollapsibleHeaderProps = {
  label: string
  collapsed: boolean
  onToggle: () => void
  direction?: 'vertical' | 'horizontal'
  actions?: ReactNode
}

const CollapsibleHeader = ({ label, collapsed, onToggle, direction = 'vertical', actions }: CollapsibleHeaderProps) => {
  const isHorizontal = direction === 'horizontal'
  const Icon = isHorizontal
    ? collapsed
      ? ChevronRightIcon
      : ChevronLeftIcon
    : collapsed
      ? ExpandLessIcon
      : ExpandMoreIcon

  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        py: 0.25,
        minHeight: 30,
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: 'primary.light',
        borderBottom: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {actions}
        <Icon sx={{ fontSize: 18 }} />
      </Box>
    </Box>
  )
}

const GfxToggle = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const is3d = searchParams.get('gfx') === '3d'

  const nextParams = new URLSearchParams(searchParams)
  if (is3d) nextParams.delete('gfx')
  else nextParams.set('gfx', '3d')
  const qs = nextParams.toString()
  const href = qs ? `${pathname}?${qs}` : pathname

  return (
    <Tooltip title={is3d ? 'Switch to 2D view' : 'Switch to 3D view'}>
      <IconButton
        size="small"
        component={Link}
        href={href}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        color={is3d ? 'info' : 'default'}
        sx={{ p: 0.25 }}
      >
        <ViewInArIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Tooltip>
  )
}

const GameLayoutShell = ({ public: publicSlot, player, log }: GameLayoutShellProps) => {
  const params = useParams<{ userId?: string }>()
  const isPlayerView = params.userId !== undefined
  const theme = useTheme()
  const isWide = useMediaQuery(theme.breakpoints.up('md'))

  const [publicCollapsed, setPublicCollapsed] = useState(false)
  const [logCollapsed, setLogCollapsed] = useState(false)

  const gfxToggle = <GfxToggle />

  if (isPlayerView) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: isWide ? 'row' : 'column',
          flex: 1,
          overflow: isWide ? 'hidden' : 'auto',
        }}
      >
        {isWide ? (
          <>
            <Box
              sx={{
                flex: publicCollapsed && logCollapsed ? '0 0 auto' : '1 1 0',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  flex: publicCollapsed ? '0 0 auto' : 2,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <CollapsibleHeader
                  label="Game"
                  collapsed={publicCollapsed}
                  onToggle={() => setPublicCollapsed((prev) => !prev)}
                  actions={gfxToggle}
                />
                {!publicCollapsed && <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{publicSlot}</Box>}
              </Box>
              <Box
                sx={{
                  flex: logCollapsed ? '0 0 auto' : 1,
                  minHeight: 0,
                  overflow: 'auto',
                }}
              >
                <CollapsibleHeader
                  label="Action Log"
                  collapsed={logCollapsed}
                  onToggle={() => setLogCollapsed((prev) => !prev)}
                />
                {!logCollapsed && log}
              </Box>
            </Box>
            <Divider orientation="vertical" flexItem />
          </>
        ) : null}
        <Box
          sx={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: isWide ? 'hidden' : undefined,
          }}
        >
          {player}
        </Box>
        {!isWide && (
          <>
            <Box sx={{ flex: logCollapsed ? '0 0 auto' : undefined, overflow: undefined }}>
              <CollapsibleHeader
                label="Action Log"
                collapsed={logCollapsed}
                onToggle={() => setLogCollapsed((prev) => !prev)}
              />
              {!logCollapsed && log}
            </Box>
            <Box sx={{ flex: publicCollapsed ? '0 0 auto' : undefined, overflow: undefined }}>
              <CollapsibleHeader
                label="Game"
                collapsed={publicCollapsed}
                onToggle={() => setPublicCollapsed((prev) => !prev)}
                actions={gfxToggle}
              />
              {!publicCollapsed && publicSlot}
            </Box>
          </>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <Box
        sx={{
          flex: publicCollapsed ? '0 0 auto' : '1 1 0',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <CollapsibleHeader
          label="Game"
          collapsed={publicCollapsed}
          onToggle={() => setPublicCollapsed((prev) => !prev)}
          direction="horizontal"
          actions={gfxToggle}
        />
        {!publicCollapsed && <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{publicSlot}</Box>}
      </Box>
      <Divider orientation="vertical" flexItem />
      <Box sx={{ flex: logCollapsed ? '0 0 auto' : '1 1 0', minWidth: 0, overflow: 'auto' }}>
        <CollapsibleHeader
          label="Action Log"
          collapsed={logCollapsed}
          onToggle={() => setLogCollapsed((prev) => !prev)}
          direction="horizontal"
        />
        {!logCollapsed && log}
      </Box>
    </Box>
  )
}

export default GameLayoutShell
