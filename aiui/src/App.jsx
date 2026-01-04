import React, { useState } from 'react';
import bgImage from './assets/background.png';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  // 1. New state for the selected model
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [draftComments, setDraftComments] = useState({});

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input, modelUsed: selectedModel };
    setMessages(prev => [...prev, userMsg]);
    
    const currentPrompt = input;
    const currentModel = selectedModel; // Capture current selection
    setInput('');

    try {
      // 2. Pass the selected model to your API
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentPrompt,
          model: currentModel // Your backend can now use this
        }),
      });
      
      const data = await response.json();

      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: data.response, 
        id: data.responseId,
        feedbackSent: false,
        modelUsed: currentModel
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  const handleFeedback = async (responseId, rating) => {
    const comment = draftComments[responseId] || "";
    try {
      await fetch('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseId: responseId,
          rating: rating.toString(),
          comment: comment
        }),
      });
      setMessages(prev => prev.map(m => 
        m.id === responseId ? { ...m, feedbackSent: true } : m
      ));
    } catch (error) {
      console.error("Feedback Error:", error);
    }
  };

  return (
    <div style={{...styles.fullPage, backgroundImage: `url(${bgImage})`}}>
      <div style={styles.overlay}>
        <div style={styles.chatContainer}>
          
          <div style={styles.messageList}>
            {messages.map((msg, index) => (
              <div key={index} style={msg.role === 'user' ? styles.userRow : styles.botRow}>
                {/* Optional: Show which model was used for this specific message */}
                <div style={styles.modelTag}>{msg.modelUsed}</div>
                <div style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
                  {msg.content}

                  {msg.role === 'bot' && !msg.feedbackSent && (
                    <div style={styles.feedbackBox}>
                      <input 
                        type="text"
                        placeholder="Optional comment..."
                        style={styles.commentInput}
                        onChange={(e) => setDraftComments({...draftComments, [msg.id]: e.target.value})}
                      />
                      <button onClick={() => handleFeedback(msg.id, 1)} style={styles.rateBtn}>👍</button>
                      <button onClick={() => handleFeedback(msg.id, -1)} style={styles.rateBtn}>👎</button>
                    </div>
                  )}
                  {msg.feedbackSent && <div style={styles.sentLabel}>Feedback sent!</div>}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.inputArea}>
            {/* 3. Dropdown Menu */}
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)}
              style={styles.modelDropdown}
            >
              <option value="gpt-3.5-turbo">GPT-3.5</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-5-mini">GPT-5 Mini</option>
            </select>

            <input 
              style={styles.mainInput}
              value={input}
              placeholder="Type a message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} style={styles.sendBtn}>Send</button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

const styles = {
  // ... your existing styles ...
  fullPage: { height: '100vh', width: '100vw', backgroundSize: 'cover', backgroundPosition: 'center' },
  overlay: { height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatContainer: { 
    width: '600px', height: '80vh', // Widened slightly to fit dropdown
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    backdropFilter: 'blur(15px)', 
    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  },
  messageList: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  userRow: { alignSelf: 'flex-end', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  botRow: { alignSelf: 'flex-start', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  userBubble: { backgroundColor: '#007bff', color: 'white', padding: '12px', borderRadius: '15px 15px 0 15px' },
  botBubble: { backgroundColor: 'rgba(255,255,255,0.9)', color: '#222', padding: '12px', borderRadius: '15px 15px 15px 0' },
  inputArea: { padding: '20px', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.1)' },
  mainInput: { flex: 1, padding: '12px', borderRadius: '25px', border: 'none', outline: 'none' },
  sendBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0 20px', borderRadius: '25px', cursor: 'pointer' },
  
  // New Styles
  modelDropdown: {
    padding: '0 10px',
    borderRadius: '15px',
    border: 'none',
    backgroundColor: 'white',
    fontSize: '12px',
    cursor: 'pointer',
    outline: 'none'
  },
  modelTag: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '4px',
    padding: '0 5px'
  },

  feedbackBox: { marginTop: '10px', display: 'flex', gap: '5px', borderTop: '1px solid #ddd', paddingTop: '8px' },
  commentInput: { flex: 1, fontSize: '11px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' },
  rateBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  sentLabel: { fontSize: '10px', color: '#28a745', marginTop: '5px', fontWeight: 'bold' }
};

export default App;