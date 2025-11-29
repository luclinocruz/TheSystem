import { useEffect, useState } from "react";
import { X, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  pointsGained: number;
}

export function LevelUpModal({ isOpen, onClose, newLevel, pointsGained }: LevelUpModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="level-up-modal"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative bg-slate-900 border-2 border-cyan-500/50 rounded-lg p-8 max-w-md w-full mx-4 shadow-neon-cyan-lg transition-all duration-500",
          showContent ? "scale-100 opacity-100" : "scale-90 opacity-0"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
          data-testid="level-up-close"
        >
          <X size={20} />
        </Button>

        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10 rounded-lg pointer-events-none" />

        <div className="text-center relative z-10">
          <div className="mb-6 relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-cyan-500/50 animate-pulse-glow">
              <TrendingUp size={40} className="text-cyan-400" />
            </div>
            <div className="absolute -top-2 -right-2 -left-2 -bottom-2 animate-spin-slow">
              <Sparkles
                size={20}
                className="absolute top-0 left-1/4 text-yellow-400"
              />
              <Sparkles
                size={16}
                className="absolute bottom-0 right-1/4 text-purple-400"
              />
              <Sparkles
                size={18}
                className="absolute top-1/2 right-0 text-cyan-400"
              />
            </div>
          </div>

          <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-widest uppercase mb-2">
            LEVEL UP!
          </h2>

          <p className="text-slate-400 text-sm font-system mb-6">
            O Sistema detectou crescimento significativo
          </p>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20 mb-6">
            <div className="text-6xl font-display font-bold text-cyan-400 animate-level-up">
              {newLevel}
            </div>
            <div className="text-xs text-slate-500 font-system uppercase tracking-wider mt-2">
              Novo Nível Alcançado
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-yellow-400 font-system mb-6">
            <Sparkles size={16} />
            <span>+{pointsGained} Pontos de Atributo</span>
            <Sparkles size={16} />
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold tracking-wider uppercase border-0"
            data-testid="level-up-confirm"
          >
            Continuar Evolução
          </Button>
        </div>
      </div>
    </div>
  );
}
