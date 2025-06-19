import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { widgetRegistry } from "@/components/widgets";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset" className="peer">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Widgets</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[...widgetRegistry.values()].map((widget) => (
                <SidebarMenuItem key={widget.id}>
                  <SidebarMenuButton asChild>
                    <a href={`#${widget.id}`}>
                      <widget.icon />
                      <span>{widget.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto">
          <SidebarTrigger className="flex ml-auto justify-end p-2" />
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
