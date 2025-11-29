import { useState } from "react";
import { User, Target, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { name: string; job: string; mainGoal: string }) => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [mainGoal, setMainGoal] = useState("");

  const steps = [
    {
      title: "Inicialização do Sistema",
      description: "O Sistema está sincronizando com o novo usuário...",
      icon: Sparkles,
    },
    {
      title: "Identificação",
      description: "Insira seus dados para calibração do Sistema",
      icon: User,
    },
    {
      title: "Objetivo Principal",
      description: "Defina sua meta para ativar o protocolo de evolução",
      icon: Target,
    },
  ];

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1 && name.trim() && job.trim()) {
      setStep(2);
    } else if (step === 2 && mainGoal.trim()) {
      onComplete({ name: name.trim(), job: job.trim(), mainGoal: mainGoal.trim() });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return name.trim().length > 0 && job.trim().length > 0;
    if (step === 2) return mainGoal.trim().length > 0;
    return false;
  };

  if (!isOpen) return null;

  const CurrentIcon = steps[step].icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
      data-testid="onboarding-modal"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg w-full mx-4">
        <div className="flex justify-center mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full mx-1.5 transition-all duration-300",
                i === step
                  ? "bg-cyan-400 scale-125"
                  : i < step
                  ? "bg-cyan-600"
                  : "bg-slate-700"
              )}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-900/80 rounded-xl border border-cyan-500/30 flex items-center justify-center shadow-neon-cyan">
            <CurrentIcon size={36} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-widest uppercase mb-2">
            {steps[step].title}
          </h1>
          <p className="text-slate-400 text-sm font-system">
            {steps[step].description}
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6">
          {step === 0 && (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="space-y-3 text-left max-w-xs mx-auto">
                {[
                  "Conexão neural estabelecida...",
                  "Protocolos de evolução carregados...",
                  "Sistema de missões ativo...",
                  "Aguardando dados do jogador...",
                ].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm font-system text-slate-400"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <Label
                  htmlFor="name"
                  className="text-xs font-system text-slate-400 uppercase tracking-wider"
                >
                  Nome do Jogador
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como deseja ser chamado?"
                  className="mt-1.5 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                  data-testid="onboarding-name"
                />
              </div>
              <div>
                <Label
                  htmlFor="job"
                  className="text-xs font-system text-slate-400 uppercase tracking-wider"
                >
                  Classe Atual
                </Label>
                <Input
                  id="job"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="Ex: Estudante, Desenvolvedor, Artista..."
                  className="mt-1.5 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                  data-testid="onboarding-job"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <Label
                  htmlFor="goal"
                  className="text-xs font-system text-slate-400 uppercase tracking-wider"
                >
                  Objetivo Principal
                </Label>
                <Textarea
                  id="goal"
                  value={mainGoal}
                  onChange={(e) => setMainGoal(e.target.value)}
                  placeholder="Qual é a sua meta? Ex: Correr uma maratona, aprender programação, perder 10kg..."
                  className="mt-1.5 min-h-[100px] bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500/50"
                  data-testid="onboarding-goal"
                />
              </div>
              <p className="text-xs text-slate-500 font-system">
                O Sistema irá gerar missões personalizadas baseadas no seu objetivo.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="text-slate-400 hover:text-white disabled:opacity-0"
            data-testid="onboarding-back"
          >
            <ChevronLeft size={18} className="mr-1" />
            Voltar
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/50 shadow-neon-cyan disabled:opacity-50"
            data-testid="onboarding-next"
          >
            {step === 2 ? "Ativar Sistema" : "Continuar"}
            <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
