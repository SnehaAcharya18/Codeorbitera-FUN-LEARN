import React, { useState, useEffect } from 'react';
import db from '../firebase';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Oops, something broke!</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const CommunityForum = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [name, setName] = useState(localStorage.getItem('fixedUsername') || '');
  const [fixedUsername, setFixedUsername] = useState(localStorage.getItem('fixedUsername') || '');
  const navigate = useNavigate();

  const messagesRef = collection(db, 'messages');

  const getUserId = () => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('userId', id);
    }
    return id;
  };

  const currentUserId = getUserId();

  useEffect(() => {
    const q = query(messagesRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.data().name)}&background=random&size=150`,
        }));
        setMessages(msgs);
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const addMessage = async (name, message, replyTo = null) => {
    try {
      await addDoc(messagesRef, {
        name,
        userId: currentUserId,
        messages: message,
        timestamp: Date.now(),
        replyTo,
        likes: 0,
      });
      if (!fixedUsername) {
        localStorage.setItem('fixedUsername', name);
        setFixedUsername(name);
      }
      setNewMsg('');
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  const likeMessage = async (id) => {
    try {
      const msgDoc = doc(db, 'messages', id);
      const msg = messages.find((m) => m.id === id);
      if (msg) {
        await updateDoc(msgDoc, { likes: (msg.likes || 0) + 1 });
      }
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() && newMsg.trim()) {
      addMessage(name.trim(), newMsg.trim());
    }
  };

  const renderMessages = (msgs, replyTo = null, level = 0) =>
    msgs
      .filter((m) => m.replyTo === replyTo)
      .map((msg) => (
        <div key={msg.id} className="comment">
          <div className="comment-vote">
            <button
              onClick={() => likeMessage(msg.id)}
              className="vote-button"
              title="Like"
            >
              👍
            </button>
            <span className="vote-count">{msg.likes || 0}</span>
            <button className="vote-button" disabled title="Dislike">
              👎
            </button>
          </div>
          <div className="comment-content">
            <div className="comment-header">
              <img src={msg.avatar} alt="Avatar" className="comment-avatar" />
              <div className="comment-meta">
                <span className="comment-author">{msg.name}</span>
                <span className="comment-time">
                  {new Date(msg.timestamp).toLocaleString([], {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
            <p className="comment-text">{msg.messages}</p>
            <div className="comment-actions">
              <button
                onClick={() => {
                  const reply = prompt('Enter your reply:');
                  if (reply) addMessage(name || 'Anonymous', reply, msg.id);
                }}
                className="action-button"
              >
                Reply
              </button>
              {msg.userId === currentUserId && (
                <button
                  onClick={() => {
                    if (window.confirm('Delete this comment?')) {
                      deleteMessage(msg.id);
                    }
                  }}
                  className="action-button"
                >
                  Delete
                </button>
              )}
            </div>
            {level < 3 && (
              <div className="comment-replies" style={{ marginLeft: `${24}px` }}>
                {renderMessages(msgs, msg.id, level + 1)}
              </div>
            )}
          </div>
        </div>
      ));

  return (
    <ErrorBoundary>
      <div className="container">
        {/* Navbar */}
        {/* 🔹 Navbar */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-black bg-opacity-40 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold font-orbitron">
            C
          </div>
          <span className="text-lg sm:text-xl font-bold font-orbitron">
            Code Orbitera
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = "/dashboard"}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/Community")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Community Forum
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/contact")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Contact Us
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/Codeanalyser")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Code Analyzer
          </motion.button>
        </div>
      </nav>

        {/* Content */}
        <header className="header">
          <h1>Community Forum</h1>
          <p>Connect with Coders and Gamers in the Ultimate Community</p>
        </header>
        <main className="main">
          <div className="post-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Your Gamer Tag"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!fixedUsername}
                  title={fixedUsername ? 'Username is fixed after your first comment' : ''}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  placeholder="Share your thoughts..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="form-button">Post Comment</button>
            </form>
          </div>
          <div className="comments-section">
            {messages.length > 0 ? (
              renderMessages(messages)
            ) : (
              <div className="no-comments">
                No comments yet. Start the conversation!
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Styles */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { overflow-y: auto; margin: 0; }

        .container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: #0d0d0d;
          color: #f5f5f5;
          font-family: 'Segoe UI', Roboto, sans-serif;
        }

        /* Navbar */
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 32px;
          background: linear-gradient(90deg, #000, #3b0764);
          color: #fff;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        .nav-left { display: flex; align-items: center; gap: 10px; }
        .logo {
          background: #9333ea;
          color: #fff;
          font-weight: 700;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .brand {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
        }
        .nav-links { display: flex; gap: 16px; }
        .nav-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: #9333ea;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .nav-btn:hover {
          background: #7e22ce;
        }

        /* Header */
        .header {
          text-align: center;
          padding: 40px 20px;
        }
        .header h1 {
          font-size: 36px;
          font-weight: 800;
          color: #9333ea;
        }
        .header p {
          font-size: 16px;
          margin-top: 10px;
          color: #a3a3a3;
        }

        /* Main */
        .main {
          flex-grow: 1;
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        .post-form {
          background: #1a1a1a;
          border: 1px solid #9333ea;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(147, 51, 234, 0.2);
        }
        .form-input, .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #3b0764;
          border-radius: 6px;
          font-size: 16px;
          background: #0d0d0d;
          color: #f5f5f5;
        }
        .form-input:focus, .form-textarea:focus {
          outline: none;
          border-color: #9333ea;
          box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.3);
        }
        .form-textarea { min-height: 100px; resize: vertical; }
        .form-button {
          padding: 12px 24px;
          background: #9333ea;
          border: none;
          color: #fff;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .form-button:hover { background: #7e22ce; transform: translateY(-2px); }

        /* Comments */
        .comment { display: flex; padding: 16px 0; border-left: 2px solid transparent; }
        .comment:hover { border-left-color: #9333ea; }
        .comment-vote { display: flex; flex-direction: column; align-items: center; width: 40px; color: #9333ea; }
        .vote-button { background: none; border: none; font-size: 18px; cursor: pointer; color: #9333ea; }
        .vote-count { font-size: 14px; font-weight: 600; color: #f5f5f5; }

        .comment-content { flex: 1; }
        .comment-header { display: flex; align-items: center; margin-bottom: 8px; }
        .comment-avatar { width: 32px; height: 32px; border-radius: 50%; margin-right: 8px; }
        .comment-author { font-weight: 600; color: #9333ea; margin-right: 6px; }
        .comment-time { font-size: 12px; color: #a3a3a3; }
        .comment-text { font-size: 16px; margin: 8px 0; color: #f5f5f5; }
        .comment-actions { display: flex; gap: 16px; }
        .action-button { border: none; background: none; font-size: 14px; cursor: pointer; color: #a3a3a3; }
        .action-button:hover { color: #9333ea; }

        .no-comments {
          text-align: center;
          padding: 30px;
          background: #1a1a1a;
          border: 1px solid #9333ea;
          border-radius: 6px;
          color: #a3a3a3;
        }
      `}</style>
    </ErrorBoundary>
  );
};

export default CommunityForum;
