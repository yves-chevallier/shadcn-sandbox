import React, { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type SheetContextType = {
  open: boolean
  setOpen: (open: boolean) => void
  closeSheet: () => void
  content: React.ReactNode
  title: string
  description: string
  openSheet: (params: {
    content: ReactNode
    title: string
    description: string
  }) => void
}

const SheetContext = createContext<SheetContextType | undefined>(undefined)

export const SheetProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState<ReactNode>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const openSheet = ({
    content,
    title,
    description,
  }: {
    content: ReactNode
    title: string
    description: string
  }) => {
    setContent(content)
    setTitle(title)
    setDescription(description)
    setOpen(true)
    console.log("Sheet opened with title:", title)
  }

  const closeSheet = () => {
    setOpen(false)
    setContent(null)
    setTitle("")
    setDescription("")
    console.log("Sheet closed")
  }

  return (
    <SheetContext.Provider
      value={{
        open,
        setOpen,
        closeSheet,
        content,
        title,
        description,
        openSheet,
      }}
    >
      {children}
    </SheetContext.Provider>
  )
}

export function useSheet() {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error("useSheet must be used within a SheetProvider")
  }
  return context
}
