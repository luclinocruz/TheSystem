import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatRowProps {
  icon: LucideIcon;
  label: string;
  value: number;
  onIncrease?: () => void;
  pointsAvailable?: number;
  color?: "cyan" | "red" | "green" | "yellow" | "purple" | "blue";
}

const iconColorClasses = {
  cyan: "text-cyan-400",
  red: "text-red-400",
  green: "text-green-400",
  yellow: "text-yellow-400",
  purple: "text-purple-400",
  blue: "text-blue-400",
};

export function StatRow({
  icon: Icon,
  label,
  value,
  onIncrease,
  pointsAvailable = 0,
  color = "cyan",
}: StatRowProps) {
  return (
    <div
      className="flex items-center justify-between p-2.5 hover-elevate rounded-md transition-colors border-b border-slate-800/50 last:border-b-0 group"
      data-testid={`stat-row-${label.toLowerCase()}`}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 bg-slate-800/80 rounded-md border border-slate-700/50",
          iconColorClasses[color]
        )}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-slate-300 tracking-wider text-sm uppercase font-system">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-xl font-system font-bold tabular-nums",
            iconColorClasses[color]
          )}
          data-testid={`stat-value-${label.toLowerCase()}`}
        >
          {value}
        </span>
        {pointsAvailable > 0 && onIncrease && (
          <Button
            size="sm"
            onClick={onIncrease}
            className="h-7 w-7 p-0 bg-cyan-600/80 hover:bg-cyan-500 text-white border border-cyan-500/50 shadow-neon-cyan"
            data-testid={`stat-increase-${label.toLowerCase()}`}
          >
            +
          </Button>
        )}
      </div>
    </div>
  );
}
