import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/layout/AppSidebar";
import { HeaderBar } from "@/layout/HeaderBar";
import { Dockview } from "@/components/Dockview";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "dockview/dist/styles/dockview.css";
import { SheetProvider } from "@/providers/SheetProvider"
import { GlobalSheet } from "@/layout/GlobalSheet"


export default function Layout() {
  return (
    <SheetProvider>
      <ThemeProvider>
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
          <GlobalSheet />
        </SidebarProvider>
      </ThemeProvider>
    </SheetProvider>
  );
}
