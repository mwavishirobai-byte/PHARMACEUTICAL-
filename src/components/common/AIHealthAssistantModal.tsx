import React, { useState } from 'react';
import { X, Sparkles, Send, PhoneCall, AlertTriangle, MessageSquare, Bot, User as UserIcon, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface AIHealthAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  disclaimer?: string;
  timestamp: string;
}

const SUGGESTED_QUERIES = [
  'What are common side effects of Paracetamol vs Ibuprofen?',
  'How should I safely store insulin in warm weather?',
  'What OTC remedies help with acute acid reflux?',
  'When is a child fever considered a medical emergency?',
  'Can I take antibiotics without a doctor prescription?',
];

export const AIHealthAssistantModal: React.FC<AIHealthAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Hello! I am the virtual medication and health assistant for Gods Favor Pharmacy in Kitale. How may I assist you with medication information, dosage guidance, or general health tips today?',
      disclaimer: 'Notice: This AI assistant provides educational guidance. For prescriptions or diagnosis, speak to our pharmacist on 07417758578 or visit us in Kitale.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.askHealthAssistant(text);
      const botMsg: Message = {
        role: 'assistant',
        text: res.answer,
        disclaimer: res.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Our clinical pharmacists are ready to help you directly. Please contact our Kitale doctor/pharmacist on 07417758578 or visit our branch along Kijana Wamalwa Road.',
          disclaimer: 'Direct pharmacist consultation recommended.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-health-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div
        id="ai-health-modal"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[85vh] max-h-[700px] relative animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Clinical Health Assistant</h3>
                <span className="bg-emerald-500 text-emerald-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-emerald-200">Gods Favor Pharmacy &bull; Kitale Clinical Reference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white rounded-full hover:bg-emerald-800 transition-colors"
            aria-label="Close AI assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Educational guidance only. Not a clinical diagnosis.</span>
          </div>
          <a
            href="tel:07417758578"
            className="font-bold text-emerald-800 hover:underline flex items-center gap-1 shrink-0"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Doctor: 07417758578</span>
          </a>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.disclaimer && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                    {msg.disclaimer}
                  </div>
                )}

                <div className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'} text-right`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 text-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-xs px-4 py-3 text-xs flex items-center gap-2 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>Consulting pharmaceutical reference database...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 self-center">
            <MessageSquare className="w-3 h-3" /> Prompts:
          </span>
          {SUGGESTED_QUERIES.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 px-3 py-1 rounded-full transition-colors shrink-0"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white border-t border-slate-200 flex gap-2 shrink-0"
        >
          <input
            id="ai-assistant-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about medications, OTC remedies, side effects..."
            className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50"
            disabled={loading}
          />
          <button
            id="ai-assistant-send-btn"
            type="submit"
            disabled={!query.trim() || loading}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm text-xs sm:text-sm"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
