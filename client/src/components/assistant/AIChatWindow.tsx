import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { Bot, User, Send, ExternalLink, Loader2, Sparkles } from 'lucide-react';

interface Message {
  sender: 'user' | 'assistant';
  content: string;
  source_references?: { scholarship_id: string; title: string; source_url: string }[];
}

export const AIChatWindow: React.FC<{ initialScholarshipId?: string }> = ({ initialScholarshipId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      content: 'Hello! I am your Scholarship Finder AI assistant. Ask me questions about eligibility rules, required documents, government schemes, or upcoming application deadlines.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Which scholarships are open for undergraduate engineering students?',
    'What documents are required for Central Sector PM-USP scheme?',
    'Explain the eligibility for AICTE Pragati Scholarship.',
    'What is the family income limit for Central Government scholarships?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = { sender: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ sender: m.sender, content: m.content }));
      const response = await api.askAssistant({
        message: textToSend,
        scholarship_id: initialScholarshipId,
        conversation_history: history
      });

      const assistantMsg: Message = {
        sender: 'assistant',
        content: response.answer,
        source_references: response.source_references
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          content: 'I apologize, but I was unable to connect to the advisory service right now. Please browse the verified directory or check the official provider portal directly.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Scholarship Assistant</h3>
            <p className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Grounded in Verified Scholarship Data
            </p>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-teal-700'
            }`}>
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl p-4 leading-relaxed ${
              m.sender === 'user'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-50 border border-slate-200/80 text-slate-800'
            }`}>
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Source References */}
              {m.source_references && m.source_references.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Official References:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.source_references.map((src, i) => (
                      <a
                        key={i}
                        href={src.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-[11px] font-semibold text-indigo-600 hover:bg-slate-100 transition"
                      >
                        <span className="truncate max-w-[150px]">{src.title}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-teal-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Analyzing scholarship records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length < 3 && (
        <div className="px-6 py-2 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-2">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium text-slate-600 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 px-3 py-1 rounded-full transition truncate max-w-xs"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-4 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a scholarship question (e.g. eligibility, requirements, dates)..."
          className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition flex items-center justify-center shadow-xs"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
