import React, { useState } from 'react';
// Import your local image from the assets folder
import bgImage from './assets/background.png';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  // Stores draft comments for each message ID
  const [draftComments, setDraftComments] = useState({});

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add user message to UI
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentPrompt = input;
    setInput('');

    try {
      // 2. Request to Chat API
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt }),
      });
      
      const data = await response.json();

      // 3. Add Bot response to UI using responseId from payload
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: data.response, 
        id: data.responseId,
        feedbackSent: false 
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  const handleFeedback = async (responseId, rating) => {
    const comment = draftComments[responseId] || "";

    try {
      // 4. Request to Feedback API
      await fetch('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responseId: responseId,
          rating: rating.toString(), // "1" or "-1"
          comment: comment
        }),
      });

      // Mark as sent to hide the buttons
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
  fullPage: { height: '100vh', width: '100vw', backgroundSize: 'cover', backgroundPosition: 'center' },
  overlay: { height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatContainer: { 
    width: '500px', height: '80vh', 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    backdropFilter: 'blur(15px)', 
    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  },
  messageList: { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  userRow: { alignSelf: 'flex-end', maxWidth: '80%' },
  botRow: { alignSelf: 'flex-start', maxWidth: '80%' },
  userBubble: { backgroundColor: '#007bff', color: 'white', padding: '12px', borderRadius: '15px 15px 0 15px' },
  botBubble: { backgroundColor: 'rgba(255,255,255,0.9)', color: '#222', padding: '12px', borderRadius: '15px 15px 15px 0' },
  inputArea: { padding: '20px', display: 'flex', gap: '10px', backgroundColor: 'rgba(0,0,0,0.1)' },
  mainInput: { flex: 1, padding: '12px', borderRadius: '25px', border: 'none', outline: 'none' },
  sendBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0 20px', borderRadius: '25px', cursor: 'pointer' },
  feedbackBox: { marginTop: '10px', display: 'flex', gap: '5px', borderTop: '1px solid #ddd', paddingTop: '8px' },
  commentInput: { flex: 1, fontSize: '11px', padding: '4px', border: '1px solid #ccc', borderRadius: '4px' },
  rateBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  sentLabel: { fontSize: '10px', color: '#28a745', marginTop: '5px', fontWeight: 'bold' }
};

export default App;