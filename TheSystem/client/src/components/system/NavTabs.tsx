import { LayoutDashboard, Target, BookOpen, TrendingUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabType = "status" | "quests" | "journal" | "mapping";

interface NavTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: Array<{ id: TabType; label: string; icon: typeof LayoutDashboard }> = [
  { id: "status", label: "Status", icon: LayoutDashboard },
  { id: "quests", label: "Missões", icon: Target },
  { id: "journal", label: "Diário", icon: BookOpen },
  { id: "mapping", label: "Mapa", icon: TrendingUp },
];

export function NavTabs({ activeTab, onTabChange }: NavTabsProps) {
  return (
    <nav
      className="flex border-b border-slate-800/50 bg-slate-900/50"
      data-testid="nav-tabs"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-system transition-all duration-200 relative",
              isActive
                ? "text-cyan-400"
                : "text-slate-400 hover:text-slate-200"
            )}
            data-testid={`tab-${tab.id}`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline tracking-wider uppercase text-xs">
              {tab.label}
            </span>

            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
