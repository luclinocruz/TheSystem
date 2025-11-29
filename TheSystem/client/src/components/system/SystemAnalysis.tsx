import { AlertCircle, CheckCircle2, Info, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalysisItem {
  type: "success" | "warning" | "info" | "goal";
  message: string;
}

interface SystemAnalysisProps {
  items: AnalysisItem[];
  title?: string;
}

const typeConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/5",
    border: "border-l-green-500",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/5",
    border: "border-l-yellow-500",
  },
  info: {
    icon: Info,
    color: "text-cyan-400",
    bg: "bg-cyan-500/5",
    border: "border-l-cyan-500",
  },
  goal: {
    icon: Target,
    color: "text-purple-400",
    bg: "bg-purple-500/5",
    border: "border-l-purple-500",
  },
};

export function SystemAnalysis({ items, title = "Análise do Sistema" }: SystemAnalysisProps) {
  return (
    <Card
      className="bg-slate-900/50 border-slate-800/50 p-4"
      data-testid="system-analysis"
    >
      <h4 className="text-cyan-400 font-bold text-xs mb-3 uppercase tracking-widest font-system flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        {title}
      </h4>

      <div className="space-y-2">
        {items.map((item, index) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-2.5 rounded-r border-l-2 transition-colors",
                config.bg,
                config.border
              )}
            >
              <Icon size={14} className={cn("mt-0.5 flex-shrink-0", config.color)} />
              <p className="text-sm text-slate-300 leading-relaxed">
                {item.message}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
