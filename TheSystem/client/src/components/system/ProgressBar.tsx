import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  max: number;
  color?: "red" | "blue" | "yellow" | "cyan" | "green" | "purple";
  label: string;
  showValues?: boolean;
  animate?: boolean;
  size?: "sm" | "md" | "lg";
}

const colorClasses = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  yellow: "bg-yellow-400",
  cyan: "bg-cyan-400",
  green: "bg-green-500",
  purple: "bg-purple-500",
};

const glowClasses = {
  red: "shadow-neon-red",
  blue: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
  yellow: "shadow-neon-yellow",
  cyan: "shadow-neon-cyan",
  green: "shadow-neon-green",
  purple: "shadow-neon-purple",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  current,
  max,
  color = "cyan",
  label,
  showValues = true,
  animate = true,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full" data-testid={`progress-bar-${label.toLowerCase()}`}>
      <div className="flex justify-between text-xs mb-1 font-system text-cyan-200/70">
        <span className="uppercase tracking-wider">{label}</span>
        {showValues && (
          <span className="tabular-nums">
            {current.toLocaleString()}/{max.toLocaleString()}
          </span>
        )}
      </div>
      <div
        className={cn(
          "bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 relative",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full relative overflow-hidden",
            colorClasses[color],
            animate && "transition-all duration-500 ease-out"
          )}
          style={{ width: `${percentage}%` }}
        >
          <div
            className={cn(
              "absolute inset-0 opacity-60",
              glowClasses[color]
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
