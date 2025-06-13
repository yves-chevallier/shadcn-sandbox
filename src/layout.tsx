import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { HeaderBar } from "@/components/HeaderBar"
import { Dockview } from "@/components/Dockview"
import 'dockview/dist/styles/dockview.css';
import { ThemeProvider } from "@/providers/ThemeProvider"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
    <SidebarProvider>
          <AppSidebar />


<main className="relative flex-1 overflow-auto transition-all duration-200 ease-in-out bg-amber-600 h-screen">
  <HeaderBar />
  <Dockview />
</main>



    </SidebarProvider>
    </ThemeProvider>
  )
}
