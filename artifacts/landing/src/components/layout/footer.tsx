import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-10 flex flex-col items-center gap-3 text-sm text-muted-foreground relative z-10">
      <a
        href="https://github.com/mncoleman/globe"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5 hover:text-foreground hover:border-foreground/40 transition-colors"
        data-testid="link-github"
      >
        <Github className="h-4 w-4" />
        View source on GitHub
      </a>
      <p>© {new Date().getFullYear()} Globe · Everything runs in your browser — nothing is stored.</p>
    </footer>
  );
}
