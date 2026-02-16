'use client'

import MuiLink from '@mui/material/Link'
import type { LinkProps as MuiLinkProps } from '@mui/material/Link'
import NextLink from 'next/link'

const VtesLink = (props: MuiLinkProps<typeof NextLink>) => <MuiLink component={NextLink} {...props} />

export default VtesLink
