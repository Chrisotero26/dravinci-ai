// components/chat/ChatWindow.jsx
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function ChatWindow({ character, user, onUpgradeNeeded }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const isPremium = user?.subscription_status === 'premium';

  // Add greeting on load
  useEffect(() => {
    if (character && messages.length === 0) {
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: character.greetingMessage,
        timestamp: new Date()
      }]);
    }
  }, [character]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    if (!user) {
      onUpgradeNeeded?.('login');
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          characterId: character.id,
          message: trimmed,
          conversationId
        })
      });

      const data = await res.json();

      if (res.status === 403 && data.requiresUpgrade) {
        onUpgradeNeeded?.('upgrade');
        setIsLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to send');

      if (data.conversationId) setConversationId(data.conversationId);
      if (data.remaining !== undefined) setRemaining(data.remaining);

      const aiMsg = {
        id: data.messageId || Date.now().toString() + '_ai',
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'error',
        role: 'assistant',
        content: "I'm having a little trouble right now. Try again in a moment? 💫",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const playTTS = async (messageId, text) => {
    if (!isPremium) {
      onUpgradeNeeded?.('upgrade');
      return;
    }

    if (playingAudio === messageId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
      return;
    }

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, characterId: character.id, messageId })
      });

      if (res.status === 403) { onUpgradeNeeded?.('upgrade'); return; }

      const { audioUrl } = await res.json();
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setPlayingAudio(messageId);
        audioRef.current.onended = () => setPlayingAudio(null);
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  return (
    <div className="chat-window">
      <audio ref={audioRef} style={{ display: 'none' }} />

      {/* Character header bar */}
      <div className="chat-header">
        <div className="char-info">
          <div className="char-avatar" style={{ borderColor: character.color }}>
            <span className="char-initial">{character.name[0]}</span>
            <div className="online-dot" />
          </div>
          <div>
            <h2 className="char-name">{character.name}</h2>
            <p className="char-tagline">{character.country} · {character.conversationStyle}</p>
          </div>
        </div>

        {remaining !== null && !isPremium && (
          <div className="message-counter">
            <span className={remaining <= 3 ? 'counter-low' : 'counter-ok'}>
              {remaining} messages left today
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="avatar-sm" style={{ background: character.color + '33', borderColor: character.color + '66' }}>
                <span style={{ color: character.color }}>{character.name[0]}</span>
              </div>
            )}
            <div className={`bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
              <p>{msg.content}</p>
              {msg.role === 'assistant' && !msg.isError && (
                <button
                  className={`tts-btn ${playingAudio === msg.id ? 'playing' : ''}`}
                  onClick={() => playTTS(msg.id, msg.content)}
                  title={isPremium ? 'Listen' : 'Voice requires Premium'}
                  aria-label="Play voice"
                >
                  {playingAudio === msg.id ? '⏸' : '🔊'}
                  {!isPremium && <span className="tts-lock">✦</span>}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-row assistant">
            <div className="avatar-sm" style={{ background: character.color + '33', borderColor: character.color + '66' }}>
              <span style={{ color: character.color }}>{character.name[0]}</span>
            </div>
            <div className="bubble assistant typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        {!user && (
          <div className="login-prompt">
            <span>Sign in to start chatting with {character.name}</span>
          </div>
        )}
        <div className="input-row">
          <textarea
            className="message-input"
            placeholder={user ? `Message ${character.name}...` : 'Sign in to chat...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading || !user}
            maxLength={500}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim() || !user}
            style={{ background: character.color }}
            aria-label="Send message"
          >
            {isLoading ? '...' : '→'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-window {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0a0a1a;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
        }
        .chat-header {
          padding: 16px 20px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .char-info { display: flex; align-items: center; gap: 12px; }
        .char-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 2px solid;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.05);
          position: relative;
        }
        .char-initial { font-weight: 700; font-size: 1.1rem; color: #fff; }
        .online-dot {
          position: absolute; bottom: 2px; right: 2px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #4DB877;
          border: 2px solid #0a0a1a;
        }
        .char-name { font-size: 1rem; font-weight: 700; color: #fff; margin: 0; }
        .char-tagline { font-size: 0.75rem; color: rgba(255,255,255,0.4); margin: 0; text-transform: capitalize; }
        .message-counter { font-size: 0.75rem; }
        .counter-ok { color: rgba(255,255,255,0.5); }
        .counter-low { color: #ff8c42; }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .message-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .message-row.user { flex-direction: row-reverse; }
        .avatar-sm {
          width: 30px; height: 30px;
          border-radius: 50%;
          border: 1px solid;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700;
          flex-shrink: 0;
        }
        .bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.9rem;
          line-height: 1.5;
          position: relative;
        }
        .bubble p { margin: 0; }
        .bubble.assistant {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.9);
          border-bottom-left-radius: 4px;
        }
        .bubble.user {
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #08081a;
          border-bottom-right-radius: 4px;
        }
        .bubble.error { background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.3); }
        .bubble.typing {
          display: flex; align-items: center; gap: 4px;
          padding: 14px 20px; min-width: 60px;
        }
        .dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.5);
          animation: bounce 1.2s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        .tts-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.7rem; opacity: 0.5;
          position: absolute; bottom: -16px; left: 4px;
          display: flex; align-items: center; gap: 2px;
          padding: 2px 6px;
          border-radius: 4px; transition: opacity 0.2s;
        }
        .tts-btn:hover { opacity: 1; background: rgba(255,255,255,0.05); }
        .tts-btn.playing { opacity: 1; color: #C4954A; }
        .tts-lock { color: #C4954A; font-size: 0.6rem; }
        .chat-input-area {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
        }
        .login-prompt {
          text-align: center;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
          margin-bottom: 10px;
        }
        .input-row { display: flex; gap: 10px; align-items: flex-end; }
        .message-input {
          flex: 1;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #fff;
          font-size: 0.9rem;
          resize: none;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s;
          max-height: 120px;
        }
        .message-input:focus { border-color: rgba(196,149,74,0.5); }
        .message-input::placeholder { color: rgba(255,255,255,0.3); }
        .message-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .send-btn {
          width: 44px; height: 44px;
          border-radius: 12px;
          border: none;
          color: #fff;
          font-size: 1.1rem;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
          font-weight: 700;
        }
        .send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
