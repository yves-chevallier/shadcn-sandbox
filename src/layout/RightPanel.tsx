import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useSheet } from "@/hooks/useSheet";

export function RightPanel() {
  const { open, setOpen, content, title, description } = useSheet();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-[400px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="p-4">{content}</div>
      </SheetContent>
    </Sheet>
  );
}
