import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogoHEIG } from "@/layout/Logo";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, Power, PowerOff } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useStore } from "@/hooks/useStore";

export function HeaderBar() {
  const [isDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const { toggleTheme } = useTheme();
  const { setOpenMobile } = useSidebar();
  const { connect, disconnect, connected } = useStore();

  return (
    <header className="w-full h-16 border-b bg-background text-foreground px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <LogoHEIG
          onClick={() => setOpenMobile(true)}
          aria-label="Ouvrir le menu"
        />
        <div className="text-lg font-semibold">Motion UI</div>
      </div>
      <div className="flex items-center gap-4">
        <Input placeholder="Rechercher..." className="w-64 hidden sm:block" />
        <Button
          onClick={connected ? disconnect : connect}
          className={
            connected
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }
        >
          {connected ? (
            <>
              <PowerOff />
              {"Offline"}
            </>
          ) : (
            <>
              <Power />
              {"Online"}
            </>
          )}
        </Button>
        <Avatar>
          <AvatarImage src="/avatar.jpg" />
          <AvatarFallback>YT</AvatarFallback>
        </Avatar>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="rounded-md p-2 transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-foreground" />
          ) : (
            <Moon className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>
    </header>
  );
}
