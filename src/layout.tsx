import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { Dockview } from "@/components/Dockview";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "dockview/dist/styles/dockview.css";
import { Button } from "./components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";


export default function Layout() {
  return (
    <Sheet>
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="relative flex-1 overflow-auto transition-all duration-200 ease-in-out h-screen">
          <HeaderBar />
          <Dockview />
        </main>
      </SidebarProvider>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-name">Name</Label>
            <Input id="sheet-demo-name" defaultValue="Pedro Duarte" />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-demo-username">Username</Label>
            <Input id="sheet-demo-username" defaultValue="@peduarte" />
          </div>
        </div>
        <SheetFooter>
          <Button variant="secondary" type="submit">
            Save changes
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </ThemeProvider>
    </Sheet>
  );
}
