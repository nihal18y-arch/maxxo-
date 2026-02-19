
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image as ImageIcon, 
  BrainCircuit, 
  Globe, 
  Paperclip,
  Mic,
  ArrowUp,
  X,
  ExternalLink,
  ChevronDown,
  Zap
} from 'lucide-react';
import { Message, Role, Attachment } from '../types';
import Markdown from 'https://esm.sh/react-markdown';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string, attachments: Attachment[], options: any) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() && attachments.length === 0) return;
    onSendMessage(inputText, attachments, { useThinking: isThinkingMode, useSearch: isSearchEnabled });
    setInputText('');
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          url: URL.createObjectURL(file),
          base64,
          name: file.name
        };
        setAttachments([...attachments, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
              <Zap className="text-indigo-500" size={32} />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">How can I help you today?</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {[
                "Analyze this market report",
                "Write a Python script for data scraping",
                "Summarize recent AI news",
                "Design a logo for my startup"
              ].map(prompt => (
                <button 
                  key={prompt}
                  onClick={() => setInputText(prompt)}
                  className="p-4 text-left rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors text-slate-300 text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 max-w-4xl mx-auto ${msg.role === Role.USER ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
              msg.role === Role.USER 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-indigo-600 border-indigo-500'
            }`}>
              {msg.role === Role.USER ? 'U' : 'S'}
            </div>
            
            <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === Role.USER ? 'items-end' : ''}`}>
              {msg.thinking && (
                <details className="w-full bg-slate-900/50 rounded-xl border border-slate-800/50 mb-2 overflow-hidden">
                  <summary className="px-4 py-2 text-xs font-medium text-indigo-400 cursor-pointer hover:bg-slate-800/80 transition-colors flex items-center gap-2">
                    <BrainCircuit size={14} />
                    View Reasoning Process
                  </summary>
                  <div className="px-4 py-3 text-sm text-slate-400 italic border-t border-slate-800/50">
                    <Markdown>{msg.thinking}</Markdown>
                  </div>
                </details>
              )}

              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {msg.attachments.map(att => (
                    <img 
                      key={att.id} 
                      src={att.url} 
                      alt={att.name} 
                      className="max-w-[200px] rounded-lg border border-slate-800"
                    />
                  ))}
                </div>
              )}

              <div className={`px-4 py-3 rounded-2xl text-slate-200 leading-relaxed ${
                msg.role === Role.USER 
                ? 'bg-slate-800 border border-slate-700' 
                : 'bg-transparent text-lg'
              }`}>
                {msg.isError ? (
                   <span className="text-red-400 flex items-center gap-2">
                     <X size={16} /> {msg.content}
                   </span>
                ) : (
                  <Markdown components={{
                    p: ({children}) => <p className="mb-4 last:mb-0">{children}</p>,
                    ul: ({children}) => <ul className="list-disc pl-5 mb-4 space-y-2">{children}</ul>,
                    code: ({children}) => <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-sm">{children}</code>,
                    pre: ({children}) => <pre className="bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-x-auto mb-4 font-mono text-sm">{children}</pre>
                  }}>
                    {msg.content}
                  </Markdown>
                )}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {msg.sources.map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                    >
                      <ExternalLink size={10} />
                      {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 border border-indigo-500 flex items-center justify-center animate-pulse">
              S
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 bg-slate-800 rounded-full w-24 animate-pulse mb-2"></div>
              <div className="h-4 bg-slate-800 rounded-full w-full animate-pulse opacity-50"></div>
              <div className="h-4 bg-slate-800 rounded-full w-[80%] animate-pulse opacity-30"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* Controls Bar */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsThinkingMode(!isThinkingMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isThinkingMode 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                <BrainCircuit size={14} />
                Reasoning Mode
              </button>
              <button 
                onClick={() => setIsSearchEnabled(!isSearchEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSearchEnabled 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                <Globe size={14} />
                Web Search
              </button>
            </div>
            <div className="text-[11px] text-slate-600 font-medium uppercase tracking-widest">
              Gemini 3 Pro
            </div>
          </div>

          {/* Main Input Box */}
          <div className="relative glass rounded-3xl border border-slate-800 focus-within:border-indigo-500/50 transition-all shadow-2xl">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 p-4 border-b border-slate-800/50">
                {attachments.map(att => (
                  <div key={att.id} className="group relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                    <img src={att.url} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeAttachment(att.id)}
                      className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-end gap-2 p-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-slate-200 transition-colors rounded-2xl hover:bg-slate-800"
              >
                <Paperclip size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*"
              />
              
              <textarea 
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Sesame anything..."
                className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-slate-200 placeholder-slate-500 resize-none min-h-[48px] max-h-48"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <button 
                onClick={handleSend}
                disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
                className={`p-3 rounded-2xl transition-all shadow-lg ${
                  (!inputText.trim() && attachments.length === 0) || isLoading
                  ? 'bg-slate-800 text-slate-600'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <ArrowUp size={20} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          <div className="text-center">
             <p className="text-[10px] text-slate-600">Sesame can make mistakes. Verify important info.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
