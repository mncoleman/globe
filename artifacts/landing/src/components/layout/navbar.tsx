import { ThemeToggle } from "@/components/theme-toggle";
import { UnitSettingsMenu } from "@/components/unit-settings";
import type { UnitSettings } from "@/hooks/use-user-data";
import { Github } from "lucide-react";

interface NavbarProps {
  unitSettings: UnitSettings;
  onUnitChange: (changes: Partial<UnitSettings>) => void;
}

export function Navbar({ unitSettings, onUnitChange }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-background" />
        </div>
        <span className="text-xl font-medium tracking-tight">Globe</span>
      </div>
      <div className="pointer-events-auto flex items-center gap-1">
        <a
          href="https://github.com/mncoleman/globe"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 hover:text-foreground hover:bg-foreground/10 transition-colors"
          data-testid="link-github-nav"
        >
          <Github className="h-5 w-5" />
        </a>
        <UnitSettingsMenu settings={unitSettings} onChange={onUnitChange} />
        <ThemeToggle />
      </div>
    </nav>
  );
}
