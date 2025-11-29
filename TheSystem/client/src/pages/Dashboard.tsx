import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  PlayerCard,
  StatPanel,
  QuestCard,
  JournalChat,
  MappingPanel,
  SystemAnalysis,
  NavTabs,
  LevelUpModal,
  OnboardingModal,
} from "@/components/system";
import type { TabType } from "@/components/system";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import type { Player, Quest, Stats } from "@shared/schema";

interface Message {
  id: string;
  sender: "system" | "user";
  content: string;
  timestamp?: Date;
}

interface HabitData {
  date: string;
  productivity: number;
  discipline: number;
}

interface HabitLog {
  id: string;
  playerId: string;
  date: string;
  productivityScore: number;
  disciplineScore: number;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function getDefaultHabitData(): HabitData[] {
  const data: HabitData[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: dayNames[date.getDay()],
      productivity: 0,
      discipline: 0,
    });
  }
  return data;
}

function processHabitLogs(logs: HabitLog[]): HabitData[] {
  const data = getDefaultHabitData();
  const today = new Date();
  
  logs.forEach((log) => {
    const logDate = new Date(log.date);
    const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays < 7) {
      const index = 6 - diffDays;
      if (data[index]) {
        data[index].productivity = Math.max(data[index].productivity, log.productivityScore ?? 0);
        data[index].discipline = Math.max(data[index].discipline, log.disciplineScore ?? 0);
      }
    }
  });
  
  return data;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("status");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "system",
      content: "Sincronização completa. O Sistema está monitorando seu progresso.",
      timestamp: new Date(),
    },
    {
      id: "2",
      sender: "system",
      content: "Registre suas atividades diárias para receber análise e novas missões.",
      timestamp: new Date(),
    },
  ]);

  const { data: player, isLoading: playerLoading } = useQuery<Player>({
    queryKey: ["/api/player"],
  });

  const { data: quests = [], isLoading: questsLoading } = useQuery<Quest[]>({
    queryKey: ["/api/quests"],
  });

  const { data: habitLogs = [] } = useQuery<HabitLog[]>({
    queryKey: ["/api/habits"],
    enabled: !!player,
  });

  const habitData = processHabitLogs(habitLogs);

  useEffect(() => {
    if (!playerLoading && !player) {
      setShowOnboarding(true);
    }
  }, [player, playerLoading]);

  const createPlayerMutation = useMutation({
    mutationFn: async (data: { name: string; job: string; mainGoal: string }) => {
      const res = await apiRequest("POST", "/api/player", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      setShowOnboarding(false);
      toast({
        title: "Sistema Ativado",
        description: "Bem-vindo ao Sistema. Sua jornada de evolução começa agora.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha na sincronização. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      const res = await apiRequest("POST", `/api/quests/${questId}/complete`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/player"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });

      if (data.leveledUp) {
        setNewLevel(data.newLevel);
        setShowLevelUp(true);
      }

      toast({
        title: "Missão Concluída",
        description: `+${data.xpGained} XP recebido.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao completar missão.",
        variant: "destructive",
      });
    },
  });

  const increaseStatMutation = useMutation({
    mutationFn: async (stat: keyof Stats) => {
      const res = await apiRequest("POST", "/api/player/stat", { stat });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player"] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao aumentar atributo.",
        variant: "destructive",
      });
    },
  });

  const sendJournalMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/journal", { content });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/player"] });
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });

      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          sender: "system",
          content: data.analysis.message,
          timestamp: new Date(),
        },
      ]);

      if (data.analysis.xpGained > 0) {
        toast({
          title: "Análise Completa",
          description: `+${data.analysis.xpGained} XP | Estatísticas atualizadas`,
        });
      }

      if (data.leveledUp) {
        setNewLevel(data.newLevel);
        setShowLevelUp(true);
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha na análise do diário.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: "user",
        content,
        timestamp: new Date(),
      },
    ]);
    sendJournalMutation.mutate(content);
  };

  const handleIncreaseStat = (stat: keyof Stats) => {
    increaseStatMutation.mutate(stat);
  };

  const handleCompleteQuest = (questId: string) => {
    completeQuestMutation.mutate(questId);
  };

  const pendingQuests = quests.filter((q) => !q.completed);
  const completedQuests = quests.filter((q) => q.completed);

  if (playerLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-slate-400 font-system text-sm tracking-wider uppercase">
            Carregando Sistema...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" data-testid="dashboard">
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={(data) => createPlayerMutation.mutate(data)}
      />

      <LevelUpModal
        isOpen={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={newLevel}
        pointsGained={3}
      />

      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-sm font-display font-bold text-cyan-400 tracking-widest uppercase">
                The System
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-system text-slate-500">
              <Wifi size={14} className="text-green-500" />
              <span>Online</span>
            </div>
          </div>

          <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === "status" && player && (
          <div className="space-y-6 animate-fade-in-up">
            <PlayerCard player={player} />
            <StatPanel
              stats={player.stats as Stats}
              pointsAvailable={player.pointsAvailable ?? 0}
              onIncreaseStat={handleIncreaseStat}
            />

            {pendingQuests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-system text-slate-400 uppercase tracking-widest">
                  Missões Ativas ({pendingQuests.length})
                </h3>
                {pendingQuests.slice(0, 2).map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleCompleteQuest}
                    isLoading={completeQuestMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "quests" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-white tracking-wider uppercase">
                Missões
              </h2>
              <span className="text-xs font-system text-slate-500">
                {pendingQuests.length} ativas
              </span>
            </div>

            {questsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-cyan-400" />
              </div>
            ) : (
              <>
                {pendingQuests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingQuests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onComplete={handleCompleteQuest}
                        isLoading={completeQuestMutation.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-dashed border-slate-800">
                    <p className="text-slate-500 text-sm font-system">
                      Nenhuma missão ativa. Use o diário para gerar novas missões.
                    </p>
                  </div>
                )}

                {completedQuests.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xs font-system text-slate-400 uppercase tracking-widest mb-3">
                      Concluídas ({completedQuests.length})
                    </h3>
                    <div className="space-y-2">
                      {completedQuests.slice(0, 5).map((quest) => (
                        <QuestCard key={quest.id} quest={quest} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "journal" && (
          <div className="h-[calc(100vh-180px)] animate-fade-in-up">
            <JournalChat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={sendJournalMutation.isPending}
            />
          </div>
        )}

        {activeTab === "mapping" && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-white tracking-wider uppercase">
                Mapeamento
              </h2>
            </div>

            <MappingPanel
              habitData={habitData}
              strength="Consistência"
              weakness="Sono Irregular"
              currentStreak={habitLogs.length}
              longestStreak={Math.max(habitLogs.length, 7)}
            />

            <SystemAnalysis
              items={[
                {
                  type: "success",
                  message: "Produtividade aumentou 15% esta semana em relação à anterior.",
                },
                {
                  type: "warning",
                  message: "Padrão de sono irregular detectado. Isso pode afetar sua Vitalidade.",
                },
                {
                  type: "info",
                  message: "Continue registrando no diário para análises mais precisas.",
                },
                {
                  type: "goal",
                  message: player?.mainGoal
                    ? `Objetivo: ${player.mainGoal}`
                    : "Defina um objetivo principal para receber missões personalizadas.",
                },
              ]}
            />
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800/50 py-2 text-center">
        <p className="text-[10px] font-system text-slate-600 tracking-wider">
          O SISTEMA ESTÁ SEMPRE OBSERVANDO
        </p>
      </footer>
    </div>
  );
}
