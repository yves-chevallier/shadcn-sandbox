import { useState } from "react"
import type { ReactNode } from "react"
import { SheetContext } from "@/contexts"

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
  }

  const closeSheet = () => {
    setOpen(false)
    setContent(null)
    setTitle("")
    setDescription("")
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
