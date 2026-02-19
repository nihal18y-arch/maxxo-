
import React, { useState, useEffect } from 'react';
import { 
  ChatSession, 
  Message, 
  Role, 
  Attachment, 
  ModelType 
} from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with an empty session if none exists
  useEffect(() => {
    const saved = localStorage.getItem('sesame_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
      }
    } else {
      handleNewChat();
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('sesame_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  const handleSelectChat = (id: string) => {
    setActiveSessionId(id);
  };

  const handleDeleteChat = (id: string) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id && newSessions.length > 0) {
      setActiveSessionId(newSessions[0].id);
    } else if (newSessions.length === 0) {
      handleNewChat();
    }
  };

  const handleSendMessage = async (
    text: string, 
    attachments: Attachment[], 
    options: { useThinking?: boolean; useSearch?: boolean }
  ) => {
    if (!activeSession) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: Role.USER,
      content: text,
      timestamp: Date.now(),
      attachments
    };

    // Update session locally first
    const updatedMessages = [...activeSession.messages, userMessage];
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
      ? { 
          ...s, 
          messages: updatedMessages,
          title: s.messages.length === 0 ? (text.substring(0, 30) || 'Image Chat') : s.title
        } 
      : s
    ));

    setIsLoading(true);

    try {
      const attachmentPayload = attachments.map(a => ({
        data: a.base64 || "",
        mimeType: "image/png" // Simplification
      }));

      // Use Flash for standard, Pro for Thinking/Search
      const model: ModelType = (options.useThinking || options.useSearch) 
        ? 'gemini-3-pro-preview' 
        : 'gemini-3-flash-preview';

      const response = await sendMessageToGemini(
        model,
        updatedMessages,
        text,
        attachmentPayload,
        {
          useThinking: options.useThinking,
          useSearch: options.useSearch,
          thinkingBudget: 16000
        }
      );

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: Role.ASSISTANT,
        content: response.text,
        timestamp: Date.now(),
        thinking: response.thinking,
        sources: response.sources
      };

      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, assistantMessage] } 
        : s
      ));
    } catch (error: any) {
      const errorMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: Role.ASSISTANT,
        content: "I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setSessions(prev => prev.map(s => 
        s.id === activeSessionId 
        ? { ...s, messages: [...s.messages, errorMessage] } 
        : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 font-sans antialiased text-slate-100">
      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      
      <main className="flex-1 flex flex-col relative h-full">
        <ChatWindow 
          messages={activeSession?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default App;
