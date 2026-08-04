import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { ArrowLeft, Send, MapPin, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ChatThreadModal: React.FC = () => {
  const { activeChat, setActiveChat, activeChatMessages, sendMessage } = useApp();
  const [text, setText] = useState('');

  if (!activeChat) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText('');
  };

  return (
    <IonModal isOpen={!!activeChat} onDidDismiss={() => setActiveChat(null)}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#090d16' }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={() => setActiveChat(null)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={22} />
          </button>
          <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', padding: '2px', background: 'var(--grad-ahoj)' }}>
            <img
              src={activeChat.user.avatarUrl}
              alt={activeChat.user.username}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              {activeChat.user.username}
            </h3>
            <span style={{ fontSize: '12px', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={11} /> {activeChat.user.distanceMeters}m away
            </span>
          </div>
        </div>

        {/* Message Thread */}
        <IonContent style={{ '--background': '#090d16' }}>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeChatMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  padding: '10px 16px',
                  borderRadius: msg.isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: msg.isMe ? 'var(--grad-ahoj)' : 'rgba(30, 41, 59, 0.9)',
                  color: msg.isMe ? '#030712' : '#f3f4f6',
                  fontWeight: msg.isMe ? 600 : 400,
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  border: msg.isMe ? 'none' : '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div>{msg.content}</div>
                <div style={{
                  fontSize: '10px',
                  marginTop: '4px',
                  textAlign: 'right',
                  opacity: 0.7,
                  color: msg.isMe ? '#030712' : '#9ca3af'
                }}>
                  {msg.createdAt}
                </div>
              </div>
            ))}
          </div>
        </IonContent>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{
          padding: '12px 16px',
          background: 'rgba(17, 24, 39, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            style={{
              flex: 1,
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              padding: '12px 18px',
              color: '#fff',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--grad-ahoj)',
              border: 'none',
              borderRadius: '50%',
              width: '46px',
              height: '46px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#030712',
              cursor: 'pointer'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </IonModal>
  );
};
