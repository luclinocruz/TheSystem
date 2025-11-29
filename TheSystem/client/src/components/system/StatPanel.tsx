import { Swords, Brain, Zap, Shield, Eye } from "lucide-react";
import { StatRow } from "./StatRow";
import { Card } from "@/components/ui/card";
import type { Stats } from "@shared/schema";

interface StatPanelProps {
  stats: Stats;
  pointsAvailable: number;
  onIncreaseStat: (stat: keyof Stats) => void;
}

const statConfig: Array<{
  key: keyof Stats;
  label: string;
  icon: typeof Swords;
  color: "red" | "purple" | "yellow" | "green" | "cyan";
}> = [
  { key: "forca", label: "Força", icon: Swords, color: "red" },
  { key: "inteligencia", label: "Inteligência", icon: Brain, color: "purple" },
  { key: "agilidade", label: "Agilidade", icon: Zap, color: "yellow" },
  { key: "vitalidade", label: "Vitalidade", icon: Shield, color: "green" },
  { key: "sentidos", label: "Sentidos", icon: Eye, color: "cyan" },
];

export function StatPanel({ stats, pointsAvailable, onIncreaseStat }: StatPanelProps) {
  return (
    <Card
      className="bg-slate-900/50 border-slate-800/50 p-4 relative overflow-hidden"
      data-testid="stat-panel"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="flex justify-between items-center mb-4 relative z-10">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest font-system">
          Atributos
        </h3>
        {pointsAvailable > 0 && (
          <span
            className="text-xs font-system font-bold text-yellow-400 tabular-nums bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30 animate-pulse"
            data-testid="points-available"
          >
            {pointsAvailable} PTS
          </span>
        )}
      </div>

      <div className="space-y-1 relative z-10">
        {statConfig.map(({ key, label, icon, color }) => (
          <StatRow
            key={key}
            icon={icon}
            label={label}
            value={stats[key]}
            color={color}
            onIncrease={() => onIncreaseStat(key)}
            pointsAvailable={pointsAvailable}
          />
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/50 relative z-10">
        <div className="flex justify-between text-xs font-system text-slate-500">
          <span>Total de Poder</span>
          <span className="text-cyan-400 font-bold tabular-nums">
            {Object.values(stats).reduce((a, b) => a + b, 0)}
          </span>
        </div>
      </div>
    </Card>
  );
}
