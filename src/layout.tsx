import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HeaderBar } from "@/components/HeaderBar";
import { Dockview } from "@/components/Dockview";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "dockview/dist/styles/dockview.css";
import { SheetProvider } from "@/providers/SheetProvider"
import { GlobalSheet } from "@/components/GlobalSheet"


export default function Layout() {
  return (
    <SheetProvider>
      <ThemeProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="relative flex-1 overflow-auto transition-all duration-200 ease-in-out h-screen">
            <HeaderBar />
          <Dockview />
        </main>
      </SidebarProvider>
      <GlobalSheet />
    </ThemeProvider>
    </SheetProvider>
  );
}
