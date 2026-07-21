import React, { useState } from 'react';
import { AI_MOCK_RESPONSES } from '../appData';

import { Send, Sparkles, HelpCircle } from 'lucide-react';

interface AIAssistantProps {
  role: string;
  roleTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ role, roleTitle, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: `Welcome! I am calibrated for the ${roleTitle} portal. Ask me anything about your current tasks, metrics, or scripts.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  // Suggested prompts based on active role
  const suggestions: Record<string, string[]> = {
    super_admin: ["Check database replication status", "Audit recent deletion failures"],
    studio_owner: ["Summarize quarterly performance", "Forecast studio tax liability"],
    director: ["Critique Bikram's Shot 04", "Style guideline checklist"],
    producer: ["Analyze Space Explorer project risk", "Calculate resource allocation gaps"],
    project_manager: ["Identify team blockers", "Draft standup summary"],
    animator: ["Maya joint alignment python script", "Download reference playblasts"],
    student: ["Rigging joint weighting study tips", "Search internship postings"]
  };

  const getSuggestedPrompts = () => {
    return suggestions[role] || ["Summarize my active task", "Check schedule deadlines", "How to submit files"];
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking and replying
    setTimeout(() => {
      let aiText = AI_MOCK_RESPONSES[role] || AI_MOCK_RESPONSES.default;
      
      // Add custom prompt simple matches
      const promptLower = text.toLowerCase();
      if (promptLower.includes('maya') || promptLower.includes('python')) {
        aiText = AI_MOCK_RESPONSES.animator;
      } else if (promptLower.includes('risk') || promptLower.includes('budget')) {
        aiText = AI_MOCK_RESPONSES.producer;
      } else if (promptLower.includes('shot 04') || promptLower.includes('critique')) {
        aiText = AI_MOCK_RESPONSES.director;
      } else if (promptLower.includes('quarterly') || promptLower.includes('revenue')) {
        aiText = AI_MOCK_RESPONSES.studio_owner;
      } else if (promptLower.includes('blocker') || promptLower.includes('velocity')) {
        aiText = AI_MOCK_RESPONSES.project_manager;
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="glass-panel animate-fade-in" style={styles.sidebar}>
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <Sparkles size={18} color="#06b6d4" />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>AI Studio Assistant</span>
        </div>
        <button className="btn-secondary" style={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div style={styles.roleTag}>
        <HelpCircle size={14} color="#9ca3af" />
        <span>Context: <strong>{roleTitle}</strong></span>
      </div>

      <div style={styles.chatArea}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{
              ...styles.messageBubble,
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? 'rgba(109, 40, 217, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: msg.sender === 'user' ? '1px solid rgba(109, 40, 217, 0.4)' : '1px solid var(--border-color)',
            }}
          >
            <div style={styles.messageText}>{msg.text}</div>
          </div>
        ))}
        {isTyping && (
          <div style={{ ...styles.messageBubble, alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.03)' }}>
            <div style={styles.typingIndicator}>Assistant is thinking...</div>
          </div>
        )}
      </div>

      <div style={styles.suggestionsContainer}>
        <div style={styles.suggestionTitle}>Suggested Prompts:</div>
        <div style={styles.suggestionList}>
          {getSuggestedPrompts().map((p) => (
            <button 
              key={p} 
              className="btn-secondary" 
              style={styles.suggestionBtn}
              onClick={() => handleSend(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <form 
        onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
        style={styles.inputArea}
      >
        <input
          type="text"
          placeholder="Ask AI Assistant..."
          className="glass-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.inputField}
        />
        <button type="submit" className="btn-primary" style={styles.sendBtn}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    width: '380px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '1px solid var(--border-color)',
    borderRadius: '16px 0 0 16px',
    boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
    padding: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
  },
  closeBtn: {
    padding: '4px 8px',
    fontSize: '14px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  roleTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255,255,255,0.02)',
    padding: '8px 12px',
    borderRadius: '8px',
    margin: '12px 0',
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '4px',
    marginBottom: '16px',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '13px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  messageText: {
    whiteSpace: 'pre-line',
  },
  typingIndicator: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    padding: '12px 0',
    borderTop: '1px solid var(--border-color)',
  },
  suggestionTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  suggestionList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  suggestionBtn: {
    padding: '6px 10px',
    fontSize: '11px',
    textAlign: 'left',
    borderRadius: '6px',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    marginTop: 'auto',
  },
  inputField: {
    flex: 1,
    padding: '10px 14px',
  },
  sendBtn: {
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};
