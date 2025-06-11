import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { HeaderBar } from "@/components/HeaderBar"
import { Dockview } from "@/components/Dockview"
import 'dockview/dist/styles/dockview.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
          <AppSidebar />


          <main className="relative flex-1 overflow-auto transition-all duration-200 ease-in-out  bg-amber-600">
          <HeaderBar />

          <Dockview />
            {/* <div className="p-3">

              {children}
              <div>prout</div>
            </div> */}
          </main>


    </SidebarProvider>
  )
}
