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
      </div>
    </div>
  );
};

export default App;
