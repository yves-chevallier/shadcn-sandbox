import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layout/Sidebar";
import { HeaderBar } from "@/layout/Header";
import { Dockview } from "@/components/Dockview";
import { SheetProvider } from "@/providers/SheetProvider";
import { RightPanel } from "@/layout/RightPanel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster, type ToasterProps } from "sonner";
import { useTheme } from "@/hooks/useTheme";

import "dockview/dist/styles/dockview.css";

export default function Layout() {
  const { theme } = useTheme();

  return (
    <TooltipProvider>
      <SheetProvider>
        <SidebarProvider>
          <div className="flex h-screen w-screen overflow-hidden">
            <AppSidebar />
            <div className="relative overflow-auto flex flex-col flex-1">
              <HeaderBar />
              <main className="flex-1 overflow-auto">
                <Dockview />
              </main>
            </div>
          </div>
          <RightPanel />
          <Toaster richColors theme={theme as ToasterProps["theme"]} />
        </SidebarProvider>
      </SheetProvider>
    </TooltipProvider>
  );
}
