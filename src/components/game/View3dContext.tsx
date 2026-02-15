'use client'

import { createContext, type ReactNode, use, useState } from 'react'

type View3dContextValue = {
  view3d: boolean
  setView3d: (value: boolean) => void
}

const View3dContext = createContext<View3dContextValue | undefined>(undefined)

const View3dProvider = ({ children }: { children: ReactNode }) => {
  const [view3d, setView3d] = useState(false)
  return <View3dContext value={{ view3d, setView3d }}>{children}</View3dContext>
}

const useView3d = () => {
  const ctx = use(View3dContext)
  if (!ctx) throw new Error('useView3d must be used within a View3dProvider')
  return ctx
}

export { useView3d, View3dProvider }
