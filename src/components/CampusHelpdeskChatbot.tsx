import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ChevronDown,
  Minimize2,
  Maximize2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { UserRole } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

interface CampusHelpdeskChatbotProps {
  userRole: UserRole;
  userName?: string;
  onNavigateTab?: (tab: string) => void;
}

export const CampusHelpdeskChatbot: React.FC<CampusHelpdeskChatbotProps> = ({
  userRole,
  userName = 'Student',
  onNavigateTab
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `Hello ${userName}! 👋 I am your 24/7 CAMPUSLINK Placement & Career Helpdesk Copilot. Ask me anything about upcoming corporate drives, eligibility criteria, APAAR National Academic Depository credits, or interview prep!`,
      timestamp: 'Just now',
      suggestedActions: [
        'Check my drive eligibility status',
        'How to verify APAAR ABC credits in DigiLocker',
        'Prepare with AI Technical Mock Interview',
        'View placement drive calendar'
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        text: m.text
      }));

      const res = await fetch('/api/gemini/campus-helpdesk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history,
          userRole
        })
      });

      const data = await res.json();
      if (data.success) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: data.suggestedActions
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: 'I can assist you directly: All corporate recruitment cutoffs, dual-offer eligibility guidelines, and DigiLocker APAAR verification details can be accessed under the respective navigation sections on your sidebar.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Go to Placement Readiness Hub', 'View Corporate Drives']
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Readiness') || action.includes('Mock Interview')) {
      onNavigateTab?.('placement-ready');
    } else if (action.includes('calendar') || action.includes('drives') || action.includes('eligibility')) {
      onNavigateTab?.('drives');
    } else if (action.includes('APAAR') || action.includes('DigiLocker')) {
      onNavigateTab?.('academic');
    } else {
      handleSendMessage(action);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 mb-3 animate-fade-in animate-modal-pop ${
            isMinimized ? 'h-14' : 'h-[540px]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-xs tracking-tight">CAMPUSLINK AI Helpdesk</h3>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-indigo-100 font-medium">
                  24/7 Placement &amp; Career Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
                aria-label={isMinimized ? 'Maximize' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
                aria-label="Close Helpdesk"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-end space-x-2 max-w-[85%]">
                      {msg.sender === 'bot' && (
                        <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mb-0.5">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>

                    {/* Quick action chips if bot */}
                    {msg.sender === 'bot' && msg.suggestedActions && (
                      <div className="mt-2 ml-8 flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleActionClick(action)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium text-indigo-700 dark:text-indigo-300 transition text-left cursor-pointer"
                          >
                            {action} →
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center space-x-2 text-slate-400 dark:text-slate-500 text-xs py-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <span className="flex space-x-1">
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" />
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 shrink-0">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask placement questions, APAAR ID, cutoffs..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-xs border border-transparent focus:border-indigo-500 focus:outline-hidden transition"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="flex items-center space-x-2 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 group border border-indigo-400/30"
        aria-label="Open 24/7 Campus Placement Helpdesk"
      >
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-tight">AI Placement Helpdesk</span>
        <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-300/40" />
      </button>
    </div>
  );
};
