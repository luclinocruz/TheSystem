import { CheckCircle, Clock, AlertTriangle, Star, Skull, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Quest, QuestDifficulty, QuestType } from "@shared/schema";

interface QuestCardProps {
  quest: Quest;
  onComplete?: (questId: string) => void;
  isLoading?: boolean;
}

const typeConfig: Record<QuestType, { color: string; icon: typeof Clock; label: string }> = {
  "DIÁRIA": { color: "border-green-500 bg-green-500/5", icon: Clock, label: "DIÁRIA" },
  "URGENTE": { color: "border-red-500 bg-red-500/5", icon: AlertTriangle, label: "URGENTE" },
  "MAIN": { color: "border-yellow-500 bg-yellow-500/5", icon: Star, label: "PRINCIPAL" },
  "OCULTA": { color: "border-purple-500 bg-purple-500/5", icon: Eye, label: "OCULTA" },
  "PENALIDADE": { color: "border-red-600 bg-red-600/10", icon: Skull, label: "PENALIDADE" },
};

const difficultyColors: Record<QuestDifficulty, string> = {
  "E": "text-slate-400",
  "D": "text-green-400",
  "C": "text-blue-400",
  "B": "text-yellow-400",
  "A": "text-orange-400",
  "S": "text-red-400 animate-pulse",
};

export function QuestCard({ quest, onComplete, isLoading }: QuestCardProps) {
  const config = typeConfig[quest.type as QuestType] || typeConfig["DIÁRIA"];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "p-4 border-l-4 rounded-r-md relative overflow-hidden group transition-all duration-300",
        config.color,
        quest.completed
          ? "opacity-60 bg-slate-800/30"
          : "bg-slate-800/60 hover-elevate"
      )}
      data-testid={`quest-card-${quest.id}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/20 pointer-events-none" />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Icon size={12} className="text-slate-400" />
            <span className="text-xs font-system tracking-widest text-slate-400 uppercase">
              {config.label}
            </span>
            <span
              className={cn(
                "text-xs font-system font-bold tracking-wider",
                difficultyColors[quest.difficulty as QuestDifficulty]
              )}
              data-testid={`quest-difficulty-${quest.id}`}
            >
              RANK {quest.difficulty}
            </span>
          </div>

          <h3
            className={cn(
              "text-white font-medium text-base mb-1",
              quest.completed && "line-through text-slate-500"
            )}
            data-testid={`quest-title-${quest.id}`}
          >
            {quest.title}
          </h3>

          <p className="text-slate-400 text-sm leading-relaxed">
            {quest.description}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs font-system">
            <span className="text-yellow-400 tabular-nums">
              +{quest.xp} XP
            </span>
            {quest.statReward && (
              <span className="text-cyan-400 uppercase tracking-wider">
                +1 {quest.statReward}
              </span>
            )}
          </div>
        </div>

        {!quest.completed && onComplete && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onComplete(quest.id)}
            disabled={isLoading}
            className="ml-4 border-slate-600/50 bg-transparent hover:bg-green-500/10 hover:border-green-500 hover:text-green-400 text-slate-400 transition-all duration-300"
            data-testid={`quest-complete-${quest.id}`}
          >
            <CheckCircle size={20} />
          </Button>
        )}
      </div>

      {quest.completed && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-green-500 font-system text-xs font-bold tracking-wider">
          <CheckCircle size={14} />
          CONCLUÍDO
        </div>
      )}
    </div>
  );
}
