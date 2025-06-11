import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
export function HeaderBar() {
  return (
    <header className="w-full h-16 border-b bg-gray-500 px-4 flex items-center justify-between">
      <SidebarTrigger className="flex items-start"/>
      <div className="text-lg font-semibold">Mon Application</div>
      <div className="flex items-center gap-4">
        <Input placeholder="Rechercher..." className="w-64" />
        <Button variant="outline">Connexion</Button>
        <Avatar>
          <AvatarImage src="/avatar.jpg" />
          <AvatarFallback>YT</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
