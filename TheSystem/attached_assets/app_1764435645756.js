import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Zap, Brain, Activity, Target, User, 
  ChevronRight, CheckCircle, Lock, Book, LayoutDashboard,
  Swords, TrendingUp, MessageSquare
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- CONFIGURAÇÃO E UTILITÁRIOS ---

const SYSTEM_COLOR = "text-cyan-400";
const SYSTEM_BORDER = "border-cyan-500/30";
const SYSTEM_BG = "bg-slate-900";
const SYSTEM_GLOW = "shadow-[0_0_15px_rgba(34,211,238,0.2)]";

// Simulação de resposta da IA (O "Sistema")
const mockSystemAI = (input, context) => {
  const responses = [
    "Análise completa. A sua disciplina aumentou em 0.5%.",
    "Nova Missão Oculta detectada baseada na sua entrada de diário.",
    "Aviso: Os seus níveis de procrastinação estão a afetar o stat 'Vontade'.",
    "Calculando rota otimizada para o objetivo B...",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
};

// --- COMPONENTES ---

const ProgressBar = ({ current, max, color = "bg-cyan-500", label }) => (
  <div className="w-full mb-2">
    <div className="flex justify-between text-xs mb-1 font-mono text-cyan-200/70">
      <span>{label}</span>
      <span>{current}/{max}</span>
    </div>
    <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
      <div 
        className={`h-full ${color} transition-all duration-500 ease-out`} 
        style={{ width: `${Math.min((current / max) * 100, 100)}%` }}
      />
    </div>
  </div>
);

const StatRow = ({ icon: Icon, label, value, onIncrease, pointsAvailable }) => (
  <div className="flex items-center justify-between p-2 hover:bg-cyan-900/10 rounded transition-colors border-b border-slate-800">
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-slate-800 rounded text-cyan-400">
        <Icon size={16} />
      </div>
      <span className="font-bold text-slate-300 tracking-wider text-sm">{label}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xl font-mono text-white">{value}</span>
      {pointsAvailable > 0 && (
        <button 
          onClick={onIncrease}
          className="p-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs"
        >
          +
        </button>
      )}
    </div>
  </div>
);

const QuestCard = ({ quest, onComplete }) => (
  <div className={`p-4 border-l-4 ${quest.completed ? 'border-green-500 bg-slate-800/50' : 'border-red-500 bg-slate-800'} mb-3 rounded-r relative overflow-hidden group transition-all`}>
    <div className="flex justify-between items-start">
      <div>
        <h4 className={`font-bold ${quest.type === 'DAILY' ? 'text-green-400' : 'text-yellow-400'} text-xs tracking-widest mb-1`}>
          [{quest.type}] {quest.difficulty}
        </h4>
        <h3 className={`text-white font-medium ${quest.completed ? 'line-through text-slate-500' : ''}`}>
          {quest.title}
        </h3>
        <p className="text-slate-400 text-xs mt-1">{quest.description}</p>
      </div>
      {!quest.completed && (
        <button 
          onClick={() => onComplete(quest.id, quest.xp, quest.statReward)}
          className="p-2 border border-slate-600 rounded hover:bg-green-600/20 hover:border-green-500 hover:text-green-400 text-slate-500 transition-all"
        >
          <CheckCircle size={20} />
        </button>
      )}
    </div>
    {quest.completed && (
      <div className="absolute top-0 right-0 p-2 text-green-500 font-mono text-xs font-bold">
        CONCLUÍDO
      </div>
    )}
  </div>
);

export default function TheSystemApp() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('status');
  const [player, setPlayer] = useState({
    name: "Jin-Woo",
    title: "O Desperto",
    level: 1,
    currentXp: 450,
    maxXp: 1000,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    job: "Estudante",
    stats: {
      forca: 10,
      inteligencia: 12,
      agilidade: 8,
      vitalidade: 10,
      sentidos: 9
    },
    pointsAvailable: 3,
    gold: 0
  });

  const [quests, setQuests] = useState([
    { id: 1, type: 'DIÁRIA', difficulty: 'E', title: "Disciplina de Aço", description: "Acordar às 06:00 e arrumar a cama.", xp: 100, statReward: 'vitalidade', completed: false },
    { id: 2, type: 'URGENTE', difficulty: 'C', title: "Estudo Profundo", description: "Ler 20 páginas de um livro técnico.", xp: 300, statReward: 'inteligencia', completed: false },
    { id: 3, type: 'MAIN', difficulty: 'B', title: "Protocolo Físico", description: "Realizar 100 flexões, 100 abdominais e 100 agachamentos.", xp: 500, statReward: 'forca', completed: false },
  ]);

  const [journalInput, setJournalInput] = useState("");
  const [journalLog, setJournalLog] = useState([
    { id: 1, type: 'system', text: "Bem-vindo, Jogador. O Sistema está online." },
    { id: 2, type: 'system', text: "Missão Diária gerada com base no seu padrão de sono recente." }
  ]);

  const chatEndRef = useRef(null);

  // --- LOGIC ---

  const levelUp = () => {
    setPlayer(prev => ({
      ...prev,
      level: prev.level + 1,
      currentXp: prev.currentXp - prev.maxXp,
      maxXp: Math.floor(prev.maxXp * 1.5),
      pointsAvailable: prev.pointsAvailable + 3,
      hp: prev.maxHp + 20,
      maxHp: prev.maxHp + 20
    }));
    addLog("SISTEMA", "LEVEL UP! Você subiu para o nível " + (player.level + 1));
  };

  const completeQuest = (id, xp, statReward) => {
    setQuests(quests.map(q => q.id === id ? { ...q, completed: true } : q));
    
    // Animação de ganho de XP
    let newXp = player.currentXp + xp;
    if (newXp >= player.maxXp) {
      setPlayer(prev => ({ ...prev, currentXp: newXp }));
      setTimeout(levelUp, 500);
    } else {
      setPlayer(prev => ({ ...prev, currentXp: newXp }));
    }
    
    addLog("QUEST", `Missão concluída. +${xp} XP recebido.`);
  };

  const increaseStat = (statName) => {
    if (player.pointsAvailable > 0) {
      setPlayer(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          [statName]: prev.stats[statName] + 1
        },
        pointsAvailable: prev.pointsAvailable - 1
      }));
    }
  };

  const addLog = (sender, text) => {
    setJournalLog(prev => [...prev, { id: Date.now(), type: sender.toLowerCase(), text }]);
  };

  const handleJournalSubmit = (e) => {
    e.preventDefault();
    if (!journalInput.trim()) return;

    addLog("user", journalInput);
    
    // Simular processamento da IA
    setTimeout(() => {
      const aiResponse = mockSystemAI(journalInput, "mapping");
      addLog("system", aiResponse);
    }, 1500);

    setJournalInput("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [journalLog]);

  // --- UI SECTIONS ---

  const renderStatus = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 bg-slate-800 rounded border border-cyan-500/50 flex items-center justify-center relative overflow-hidden">
          <User size={40} className="text-cyan-600" />
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent"></div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white tracking-widest uppercase">{player.name}</h2>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            {player.title}
          </span>
          <div className="mt-2 text-sm text-slate-400">
            Job: <span className="text-white">{player.job}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block">LEVEL</span>
          <span className="text-4xl font-mono text-cyan-400 font-bold leading-none">{player.level}</span>
        </div>
      </div>

      <div className="space-y-1">
        <ProgressBar current={player.hp} max={player.maxHp} color="bg-red-500" label="HP" />
        <ProgressBar current={player.mp} max={player.maxMp} color="bg-blue-600" label="MP" />
        <ProgressBar current={player.currentXp} max={player.maxXp} color="bg-yellow-400" label="EXP" />
      </div>

      <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-4 relative overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Atributos</h3>
          <span className="text-xs font-mono text-yellow-500">Pts: {player.pointsAvailable}</span>
        </div>
        <div className="space-y-1">
          <StatRow icon={Swords} label="FORÇA" value={player.stats.forca} onIncrease={() => increaseStat('forca')} pointsAvailable={player.pointsAvailable} />
          <StatRow icon={Brain} label="INTELIGÊNCIA" value={player.stats.inteligencia} onIncrease={() => increaseStat('inteligencia')} pointsAvailable={player.pointsAvailable} />
          <StatRow icon={Zap} label="AGILIDADE" value={player.stats.agilidade} onIncrease={() => increaseStat('agilidade')} pointsAvailable={player.pointsAvailable} />
          <StatRow icon={Shield} label="VITALIDADE" value={player.stats.vitalidade} onIncrease={() => increaseStat('vitalidade')} pointsAvailable={player.pointsAvailable} />
          <StatRow icon={Activity} label="SENTIDOS" value={player.stats.sentidos} onIncrease={() => increaseStat('sentidos')} pointsAvailable={player.pointsAvailable} />
        </div>
      </div>
    </div>
  );

  const renderQuests = () => ( // ACTING
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="text-red-500" />
          ACTING
        </h2>
        <span className="text-xs font-mono text-slate-500">Updated: 14:32</span>
      </div>
      
      {quests.map(quest => (
        <QuestCard key={quest.id} quest={quest} onComplete={completeQuest} />
      ))}
      
      <div className="mt-8 p-4 bg-slate-900/80 border border-dashed border-slate-700 rounded text-center">
        <p className="text-slate-500 text-sm">Aguardando geração de novas missões pela IA...</p>
      </div>
    </div>
  );

  const renderMapping = () => ( // MAPPING
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-purple-500" />
          MAPPING
        </h2>
      </div>

      <div className="h-64 bg-slate-900/50 rounded-lg p-2 border border-slate-800">
        <h3 className="text-xs text-slate-400 mb-4 text-center">Consistência de Hábitos (7 Dias)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[
            { name: 'Seg', val: 30 }, { name: 'Ter', val: 45 }, { name: 'Qua', val: 40 }, 
            { name: 'Qui', val: 70 }, { name: 'Sex', val: 50 }, { name: 'Sab', val: 80 }, { name: 'Dom', val: 85 }
          ]}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
            <Line type="monotone" dataKey="val" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-800 rounded border-l-2 border-green-500">
          <div className="text-xs text-slate-400">Maior Força</div>
          <div className="font-bold text-white">Consistência</div>
        </div>
        <div className="p-3 bg-slate-800 rounded border-l-2 border-red-500">
          <div className="text-xs text-slate-400">Ponto Fraco</div>
          <div className="font-bold text-white">Sono Irregular</div>
        </div>
      </div>

      <div className="p-4 bg-slate-800/60 rounded border border-slate-700 text-sm text-slate-300">
        <h4 className="text-cyan-400 font-bold text-xs mb-2 uppercase tracking-wide">Análise do Sistema</h4>
        <p>"Jogador, a sua curva de produtividade aumenta significativamente após as 14h. Recomenda-se mover as missões de Rank A para este horário."</p>
      </div>
    </div>
  );

  const renderJournal = () => ( // JOURNALING
    <div className="flex flex-col h-[calc(100vh-180px)] animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
        {journalLog.map(log => (
          <div key={log.id} className={`flex ${log.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
              log.type === 'user' 
                ? 'bg-cyan-900/30 border border-cyan-800 text-cyan-100 rounded-tr-none' 
                : log.type === 'system'
                  ? 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none font-mono text-xs shadow-lg shadow-blue-900/10'
                  : 'bg-green-900/20 border border-green-900/50 text-green-400 text-xs font-mono'
            }`}>
              {log.type === 'system' && <span className="block text-cyan-500 font-bold mb-1">[SISTEMA]</span>}
              {log.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleJournalSubmit} className="relative">
        <input
          type="text"
          value={journalInput}
          onChange={(e) => setJournalInput(e.target.value)}
          placeholder="Registar atividade ou comando..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cyan-500 hover:text-cyan-300">
          <ChevronRight size={20} />
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-cyan-900 selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-cyan-500 animate-pulse"><LayoutDashboard size={20} /></span>
          <h1 className="font-bold text-white tracking-widest text-lg">SYSTEM<span className="text-cyan-500">.OS</span></h1>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-yellow-500">LVL.{player.level}</span>
          <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500" style={{ width: `${(player.currentXp/player.maxXp)*100}%` }}></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-md mx-auto">
        {activeTab === 'status' && renderStatus()}
        {activeTab === 'acting' && renderQuests()}
        {activeTab === 'mapping' && renderMapping()}
        {activeTab === 'journal' && renderJournal()}
      </main>

      {/* Navigation (Bottom Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-2 safe-area-pb">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('status')}
            className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === 'status' ? 'text-cyan-400 bg-cyan-950/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <User size={20} />
            <span className="text-[10px] font-bold tracking-wider">STATUS</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('acting')}
            className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === 'acting' ? 'text-red-400 bg-red-950/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Swords size={20} />
            <span className="text-[10px] font-bold tracking-wider">ACTING</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('mapping')}
            className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === 'mapping' ? 'text-purple-400 bg-purple-950/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Activity size={20} />
            <span className="text-[10px] font-bold tracking-wider">MAP</span>
          </button>

          <button 
            onClick={() => setActiveTab('journal')}
            className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === 'journal' ? 'text-green-400 bg-green-950/30' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Book size={20} />
            <span className="text-[10px] font-bold tracking-wider">LOGS</span>
          </button>
        </div>
      </nav>

      {/* CSS Global Effects injected here for single-file portability */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
      `}</style>
    </div>
  );
}