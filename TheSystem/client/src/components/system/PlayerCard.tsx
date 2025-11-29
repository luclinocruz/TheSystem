import { User, Crown } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@shared/schema";

interface PlayerCardProps {
  player: Player;
  onLevelUp?: () => void;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div
      className="animate-fade-in-up"
      data-testid="player-card"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 bg-slate-800/80 rounded-md border border-cyan-500/30 flex items-center justify-center relative overflow-hidden shadow-neon-cyan">
          <User size={40} className="text-cyan-500/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400/30" />
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className="text-2xl font-bold text-white tracking-widest uppercase font-display truncate"
            data-testid="player-name"
          >
            {player.name}
          </h2>
          <Badge
            variant="outline"
            className="mt-1 text-xs font-system text-cyan-400 bg-cyan-950/50 border-cyan-800/50 tracking-wider"
            data-testid="player-title"
          >
            <Crown size={10} className="mr-1" />
            {player.title}
          </Badge>
          <div className="mt-2 text-sm text-slate-400 font-system">
            Classe:{" "}
            <span className="text-white" data-testid="player-job">
              {player.job}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-xs text-slate-500 block font-system tracking-wider uppercase">
            Level
          </span>
          <span
            className="text-4xl font-display font-bold text-cyan-400 leading-none animate-pulse-glow"
            data-testid="player-level"
          >
            {player.level}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar
          current={player.hp ?? 100}
          max={player.maxHp ?? 100}
          color="red"
          label="HP"
        />
        <ProgressBar
          current={player.mp ?? 50}
          max={player.maxMp ?? 50}
          color="blue"
          label="MP"
        />
        <ProgressBar
          current={player.currentXp ?? 0}
          max={player.maxXp ?? 1000}
          color="yellow"
          label="EXP"
        />
      </div>
    </div>
  );
}
