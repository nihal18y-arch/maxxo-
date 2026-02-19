
import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  Layers, 
  Search, 
  Zap, 
  History,
  Trash2
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onNewChat, 
  onSelectChat,
  onDeleteChat
}) => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">Sesame</span>
        </div>

        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 px-4 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
        >
          <Plus size={18} />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Recent Chats
        </div>
        {sessions.map((session) => (
          <div 
            key={session.id}
            className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors relative ${
              activeSessionId === session.id 
              ? 'bg-slate-800 text-slate-100' 
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
            onClick={() => onSelectChat(session.id)}
          >
            <MessageSquare size={16} />
            <span className="text-sm truncate pr-6">{session.title || 'Untitled Chat'}</span>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(session.id);
              }}
              className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-slate-600">
            No history yet
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-800/50 transition-colors">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-200 cursor-pointer rounded-lg hover:bg-slate-800/50 transition-colors">
          <Layers size={18} />
          <span className="text-sm font-medium">Workspace</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
