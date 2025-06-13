import { useContext } from "react"
import { SheetContext } from "@/contexts"

export function useSheet() {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error("useSheet must be used within a SheetProvider")
  }
  return context
}
