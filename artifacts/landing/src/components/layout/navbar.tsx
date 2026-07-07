import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-background" />
        </div>
        <span className="text-xl font-medium tracking-tight">Globe</span>
      </div>
      <div className="pointer-events-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}
