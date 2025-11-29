import { TrendingUp, TrendingDown, Target, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface HabitData {
  date: string;
  productivity: number;
  discipline: number;
}

interface MappingPanelProps {
  habitData: HabitData[];
  strength: string;
  weakness: string;
  currentStreak: number;
  longestStreak: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-cyan-500/30 rounded-md p-3 shadow-neon-cyan">
        <p className="text-xs text-slate-400 font-system mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={index}
            className="text-sm font-system font-bold"
            style={{ color: entry.color }}
          >
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function MappingPanel({
  habitData,
  strength,
  weakness,
  currentStreak,
  longestStreak,
}: MappingPanelProps) {
  return (
    <div className="space-y-4" data-testid="mapping-panel">
      <Card className="bg-slate-900/50 border-slate-800/50 p-4">
        <h3 className="text-xs text-slate-400 font-system uppercase tracking-widest mb-4 flex items-center gap-2">
          <Target size={14} className="text-cyan-400" />
          Consistência de Hábitos (7 Dias)
        </h3>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={habitData}>
              <defs>
                <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="disciplineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="productivity"
                name="Produtividade"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#productivityGradient)"
                dot={{ fill: "#22d3ee", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#22d3ee" }}
              />
              <Area
                type="monotone"
                dataKey="discipline"
                name="Disciplina"
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#disciplineGradient)"
                dot={{ fill: "#a855f7", strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#a855f7" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-900/50 border-slate-800/50 p-3 border-l-2 border-l-green-500">
          <div className="flex items-start gap-2">
            <TrendingUp size={16} className="text-green-500 mt-0.5" />
            <div>
              <div className="text-xs text-slate-400 font-system uppercase tracking-wider">
                Maior Força
              </div>
              <div
                className="font-bold text-white text-sm mt-1"
                data-testid="strength-value"
              >
                {strength}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/50 p-3 border-l-2 border-l-red-500">
          <div className="flex items-start gap-2">
            <TrendingDown size={16} className="text-red-500 mt-0.5" />
            <div>
              <div className="text-xs text-slate-400 font-system uppercase tracking-wider">
                Ponto Fraco
              </div>
              <div
                className="font-bold text-white text-sm mt-1"
                data-testid="weakness-value"
              >
                {weakness}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-800/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-md border border-orange-500/30">
              <Flame size={20} className="text-orange-500" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-system uppercase tracking-wider">
                Sequência Atual
              </div>
              <div className="text-2xl font-display font-bold text-orange-400" data-testid="current-streak">
                {currentStreak} dias
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-system uppercase tracking-wider">
              Recorde
            </div>
            <div className="text-lg font-system font-bold text-slate-300" data-testid="longest-streak">
              {longestStreak} dias
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
