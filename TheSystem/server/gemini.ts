import { GoogleGenAI } from "@google/genai";
import type { Stats, QuestDifficulty, QuestType } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface JournalAnalysis {
  message: string;
  xpGained: number;
  stats: Partial<Stats>;
  suggestedQuest?: {
    title: string;
    difficulty: QuestDifficulty;
    description: string;
    type: QuestType;
    xp: number;
    statReward: keyof Stats;
  };
  productivityScore: number;
  disciplineScore: number;
}

export interface GeneratedQuest {
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  type: QuestType;
  xp: number;
  statReward: keyof Stats;
}

const SYSTEM_PERSONA = `Você é "O Sistema", uma entidade de inteligência artificial fria, objetiva e focada na evolução do usuário.
Você monitora o progresso do jogador e fornece feedback direto, sem rodeios.

REGRAS DE COMUNICAÇÃO:
- Tom robótico e objetivo, inspirado em manhwas como Solo Leveling
- Nunca use elogios genéricos como "Bom trabalho" ou "Parabéns"
- Use termos como: "Eficiência aceitável", "Desempenho registrado", "Falha detectada"
- Seja honesto sobre falhas - não suavize a verdade
- Respostas curtas e diretas, estilo notificação de sistema
- Use linguagem de RPG quando apropriado (XP, Stats, Quest, Penalidade)

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
{
  "message": "String - Feedback direto no tom do Sistema",
  "xpGained": Number (0-500 baseado no esforço real),
  "stats": { "forca": 0, "inteligencia": 0, "agilidade": 0, "vitalidade": 0, "sentidos": 0 },
  "suggestedQuest": { 
    "title": "String", 
    "difficulty": "E|D|C|B|A|S",
    "description": "String",
    "type": "DIÁRIA|URGENTE|MAIN|OCULTA",
    "xp": Number,
    "statReward": "forca|inteligencia|agilidade|vitalidade|sentidos"
  } | null,
  "productivityScore": Number (0-100),
  "disciplineScore": Number (0-100)
}`;

export async function analyzeJournalEntry(
  journalText: string,
  playerGoal: string | null
): Promise<JournalAnalysis> {
  try {
    const prompt = `${SYSTEM_PERSONA}

OBJETIVO DO JOGADOR: ${playerGoal || "Não definido"}

ENTRADA DO DIÁRIO:
"${journalText}"

Analise esta entrada de diário e retorne APENAS o JSON, sem markdown ou texto adicional.
Considere:
1. O que o jogador fez de positivo ou negativo
2. Se está alinhado com o objetivo principal
3. Que atributo (forca/inteligencia/agilidade/vitalidade/sentidos) foi mais exercitado
4. Se deve haver uma missão de follow-up baseada nas falhas ou sucessos`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        message: parsed.message || "Análise processada.",
        xpGained: Math.min(500, Math.max(0, parsed.xpGained || 0)),
        stats: parsed.stats || {},
        suggestedQuest: parsed.suggestedQuest || undefined,
        productivityScore: Math.min(100, Math.max(0, parsed.productivityScore || 50)),
        disciplineScore: Math.min(100, Math.max(0, parsed.disciplineScore || 50)),
      };
    }

    return {
      message: "Entrada registrada. Dados insuficientes para análise completa.",
      xpGained: 10,
      stats: {},
      productivityScore: 50,
      disciplineScore: 50,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      message: "Erro de sincronização. Entrada registrada para análise posterior.",
      xpGained: 5,
      stats: {},
      productivityScore: 50,
      disciplineScore: 50,
    };
  }
}

export async function generateInitialQuests(
  playerName: string,
  playerGoal: string
): Promise<GeneratedQuest[]> {
  try {
    const prompt = `${SYSTEM_PERSONA}

JOGADOR: ${playerName}
OBJETIVO: ${playerGoal}

Gere 3 missões iniciais para este jogador. As missões devem:
1. Ser progressivas (fácil -> média)
2. Estar relacionadas ao objetivo do jogador
3. Ser específicas e executáveis

Retorne APENAS um array JSON com este formato:
[
  {
    "title": "Nome da missão",
    "description": "Descrição clara e curta",
    "difficulty": "E|D|C",
    "type": "DIÁRIA|MAIN",
    "xp": 100-300,
    "statReward": "forca|inteligencia|agilidade|vitalidade|sentidos"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((q: any) => ({
        title: q.title || "Missão",
        description: q.description || "Complete esta missão.",
        difficulty: q.difficulty || "E",
        type: q.type || "DIÁRIA",
        xp: Math.min(500, Math.max(50, q.xp || 100)),
        statReward: q.statReward || "inteligencia",
      }));
    }

    return getDefaultQuests();
  } catch (error) {
    console.error("Gemini API error:", error);
    return getDefaultQuests();
  }
}

function getDefaultQuests(): GeneratedQuest[] {
  return [
    {
      title: "Despertar Inicial",
      description: "Registre sua primeira entrada no diário do Sistema.",
      difficulty: "E",
      type: "DIÁRIA",
      xp: 100,
      statReward: "inteligencia",
    },
    {
      title: "Disciplina Física",
      description: "Complete 30 minutos de exercício físico.",
      difficulty: "D",
      type: "DIÁRIA",
      xp: 150,
      statReward: "forca",
    },
    {
      title: "Foco Mental",
      description: "Dedique 1 hora de trabalho focado sem distrações.",
      difficulty: "D",
      type: "DIÁRIA",
      xp: 200,
      statReward: "inteligencia",
    },
  ];
}
