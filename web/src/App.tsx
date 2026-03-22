import React, { useState, useRef, useEffect } from 'react';
import { Send, Map, Activity, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// Types
interface Message {
  id: string;
  role: 'user' | 'agent';
  text?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isScouting, setIsScouting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [initialized, setInitialized] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isScouting) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsScouting(true);
    setStatusText('Scouting...');

    try {
      let currentResult;
      const apiEndpoint = initialized ? '/api/message' : '/api/start';

      const response = await fetch(`${API_BASE}${apiEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userMessage.text }),
      });

      currentResult = await response.json();
      setInitialized(true);

      // Handle official interaction turns recursively
      while (currentResult.status === 'requires_action') {
        const outputs = currentResult.outputs || [];
        const calls = outputs.filter((o: any) => o.type === 'function_call');
        
        if (calls.length === 0) break;

        const results = [];
        for (const call of calls) {
          setStatusText(`Executing ${call.name}...`);
          
          const toolResponse = await fetch(`${API_BASE}/api/execute-tool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: call.name, args: call.arguments }),
          });
          const toolData = await toolResponse.json();
          results.push({ name: call.name, id: call.id, result: toolData });
        }

        setStatusText('Refining results...');
        const syncResponse = await fetch(`${API_BASE}/api/tool-results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results }),
        });
        currentResult = await syncResponse.json();
      }

      // Add agent response to chat
      const textBlocks = currentResult.outputs?.filter((o: any) => o.type === 'text') || [];
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        text: textBlocks.map((b: any) => b.text).join('\n\n'),
      };
      setMessages(prev => [...prev, agentMessage]);

    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        text: `Error: ${error.message}. Is the backend running?`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsScouting(false);
      setStatusText('');
    }
  };

  return (
    <div className="scout-container">
      <div className="glass-panel">
        <header className="scout-header">
          <div style={{ background: '#3b82f6', padding: '0.6rem', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
            <Map size={24} color="white" />
          </div>
          <div>
            <h1>Neighborhood Scout</h1>
            <span>State-of-the-art evaluation engine</span>
          </div>
        </header>

        <main className="chat-area">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center', marginTop: '4rem', color: '#64748b' }}
              >
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <TrendingUp size={48} color="#1e293b" />
                </div>
                <h3>Where should we scout today?</h3>
                <p>Enter a neighborhood name to begin your evaluation.</p>
              </motion.div>
            )}
            
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`message-bubble message-${m.role}`}
              >
                {m.text && (
                  <div className="markdown-content">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                )}
              </motion.div>
            ))}
            
            {isScouting && (
              <motion.div
                key="scouting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem', marginLeft: '1rem' }}
              >
                <Activity size={16} className="pulse" />
                {statusText}
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </main>

        <form className="scout-input-container" onSubmit={handleSubmit}>
          <input
            className="scout-input"
            type="text"
            placeholder="Search a neighborhood (e.g., 'Williamsburg, Brooklyn')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isScouting}
          />
          <button className="send-button" type="submit" disabled={isScouting || !input.trim()}>
            <Send size={20} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid rgba(148,163,184,0.15)', marginTop: '0.5rem', paddingTop: '0.65rem', paddingBottom: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.04em' }}>
            vibe coded
          </span>
          <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.85rem', lineHeight: 1 }}>·</span>
          <span style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '0.04em' }}>
            built with{' '}
            <a
              href="https://ai.google.dev/gemini-api/docs/interactions?ua=chat"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#94a3b8', textDecoration: 'underline', textUnderlineOffset: '2px' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#3b82f6')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
            >
              Gemini Interactions API
            </a>
          </span>
          <span style={{ color: 'rgba(148,163,184,0.6)', fontSize: '0.85rem', lineHeight: 1 }}>·</span>
          <a
            href="https://github.com/ppongtong/neighborhood-scout"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#94a3b8', textDecoration: 'none', letterSpacing: '0.04em' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#3b82f6')}
            onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
            </svg>
            see the code · by panhathai
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
