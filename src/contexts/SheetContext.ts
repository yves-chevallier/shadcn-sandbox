import type { ReactNode } from "react"

export type SheetContextType = {
  open: boolean
  setOpen: (open: boolean) => void
  closeSheet: () => void
  content: ReactNode
  title: string
  description: string
  openSheet: (params: {
    content: ReactNode
    title: string
    description: string
  }) => void
}

import { createContext } from "react"

export const SheetContext = createContext<SheetContextType | undefined>(undefined)
