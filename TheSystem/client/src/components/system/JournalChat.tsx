import { useState, useRef, useEffect } from "react";
import { Send, Bot, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  sender: "system" | "user";
  content: string;
  timestamp?: Date;
}

interface JournalChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function JournalChat({ messages, onSendMessage, isLoading }: JournalChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-slate-900/30 rounded-lg border border-slate-800/50 overflow-hidden"
      data-testid="journal-chat"
    >
      <div className="p-3 border-b border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-system text-cyan-400 uppercase tracking-widest">
            O Sistema - Journaling
          </span>
        </div>
      </div>

      <ScrollArea
        className="flex-1 p-4"
        ref={scrollRef}
        data-testid="journal-messages"
      >
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-fade-in-up",
                message.sender === "user" ? "flex-row-reverse" : "flex-row"
              )}
              data-testid={`message-${message.id}`}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
                  message.sender === "system"
                    ? "bg-cyan-500/20 border border-cyan-500/30"
                    : "bg-slate-700/50 border border-slate-600/30"
                )}
              >
                {message.sender === "system" ? (
                  <Bot size={16} className="text-cyan-400" />
                ) : (
                  <UserIcon size={16} className="text-slate-400" />
                )}
              </div>

              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-lg",
                  message.sender === "system"
                    ? "bg-slate-800/60 border border-cyan-500/20 text-slate-200"
                    : "bg-slate-700/50 border border-slate-600/30 text-white"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                {message.timestamp && (
                  <span className="text-[10px] text-slate-500 font-system mt-2 block">
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-cyan-500/20 border border-cyan-500/30">
                <Bot size={16} className="text-cyan-400" />
              </div>
              <div className="bg-slate-800/60 border border-cyan-500/20 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                  <span className="text-sm text-cyan-400 font-system">
                    Analisando...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-slate-800/50 bg-slate-900/50"
      >
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva seu dia, seus desafios e conquistas..."
            disabled={isLoading}
            className="min-h-[60px] max-h-[120px] resize-none bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 font-system text-sm"
            data-testid="journal-input"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="self-end bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/50 shadow-neon-cyan disabled:opacity-50"
            data-testid="journal-send"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-system">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </form>
    </div>
  );
}
