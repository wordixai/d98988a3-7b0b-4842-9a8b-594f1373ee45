import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">AI 换装</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            功能
          </a>
          <a href="#gallery" className="text-muted-foreground hover:text-foreground transition-colors">
            作品展示
          </a>
          <a href="#try" className="text-muted-foreground hover:text-foreground transition-colors">
            立即体验
          </a>
        </nav>
      </div>
    </header>
  );
}
