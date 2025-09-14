import React, { useState } from 'react';
import axios from 'axios';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your assistant 🤖. How can I help?", from: "bot" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [visible, setVisible] = useState(true); // NEW

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { text: input, from: "user" }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const botReply = await getBotResponse(input);
      setMessages([...newMessages, { text: botReply, from: "bot" }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { text: "Oops, something went wrong!", from: "bot" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getBotResponse = async (userText) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/getBotResponse", { text: userText });
      const botReply = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return botReply || "Sorry, I couldn't understand that.";
    } catch (error) {
      console.error('Error fetching bot response:', error);
      return "Error occurred while fetching response.";
    }
  };

  if (!visible) return null; // 👈 Hide component if closed

  return (
    <div style={styles.chatWrapper}>
      <div style={styles.chatHeader}>
        <span>💬 Assistant</span>
        <button onClick={() => setVisible(false)} style={styles.closeBtn}>✖</button>
      </div>

      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.from === 'bot' ? styles.botMsg : styles.userMsg}>
            {msg.text}
          </div>
        ))}
        {isTyping && <div style={styles.botMsg}>Typing...</div>}
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message..."
        />
        <button style={styles.button} onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

const styles = {
  chatWrapper: {
    width: '350px',
    height: '500px',
    position: 'fixed',
    bottom: '40px',
    right: '30px',
    background: 'linear-gradient(135deg, #1e1e2f, #2c2c3a)',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 1000,
    fontFamily: '"Segoe UI", sans-serif'
  },
  chatHeader: {
    padding: '12px 16px',
    background: '#4b6cb7',
    backgroundImage: 'linear-gradient(315deg, #4b6cb7 0%, #182848 74%)',
    fontSize: '18px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #444'
  },
  closeBtn: {
    background: 'transparent',
    color: '#fff',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer'
  },
  messages: {
    flex: 1,
    padding: '16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#1e1e2f'
  },
  botMsg: {
    alignSelf: 'flex-start',
    background: '#44475a',
    padding: '10px 14px',
    borderRadius: '14px',
    maxWidth: '80%',
    fontSize: '14px'
  },
  userMsg: {
    alignSelf: 'flex-end',
    background: '#6272a4',
    padding: '10px 14px',
    borderRadius: '14px',
    maxWidth: '80%',
    fontSize: '14px'
  },
  inputArea: {
    display: 'flex',
    borderTop: '1px solid #333'
  },
  input: {
    flex: 1,
    padding: '12px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    background: '#2d2d44',
    color: '#fff',
    borderRadius: '0 0 0 16px'
  },
  button: {
    padding: '12px 16px',
    border: 'none',
    background: '#4CAF50',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '0 0 16px 0'
  }
};

export default ChatBot;
