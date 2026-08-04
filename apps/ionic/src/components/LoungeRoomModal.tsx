import React, { useState } from 'react';
import { IonModal, IonContent } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { Radio, Mic, MicOff, Volume2, Users, X, Send, Heart, Flame, Coffee, Sparkles } from 'lucide-react';

export const LoungeRoomModal: React.FC = () => {
  const { activeLounge, leaveLounge, isMicMuted, toggleMic, currentUser } = useApp();
  const [messages, setMessages] = useState<{ id: string; user: string; text: string; time: string }[]>([
    { id: '1', user: 'alex_cyber', text: 'Welcome to the Bitcoin Coffee spatial lounge! ☕️', time: '12:30' },
    { id: '2', user: 'sophia_code', text: 'Hey everyone! Testing the local WebRTC audio channel.', time: '12:32' }
  ]);
  const [inputText, setInputText] = useState('');
  const [reactions, setReactions] = useState<{ id: string; emoji: string }[]>([]);

  if (!activeLounge) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        user: currentUser.username,
        text: inputText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputText('');
  };

  const addReaction = (emoji: string) => {
    const id = Date.now().toString();
    setReactions(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  return (
    <IonModal isOpen={!!activeLounge} onDidDismiss={leaveLounge}>
      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '20px 16px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

          {/* Floating Emoji Reactions */}
          <div style={{ position: 'absolute', bottom: '100px', right: '30px', pointerEvents: 'none', zIndex: 50 }}>
            {reactions.map(r => (
              <div
                key={r.id}
                style={{
                  fontSize: '28px',
                  animation: 'floatUp 2s ease-out forwards',
                  marginBottom: '6px'
                }}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '12px', background: 'var(--grad-ahoj)', color: '#030712' }}>
                <Radio size={20} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0, fontSize: '18px' }}>
                  {activeLounge.title}
                </h2>
                <span style={{ fontSize: '12px', color: '#00f2fe', fontWeight: 600 }}>
                  📍 {activeLounge.venueName} • {activeLounge.distanceMeters}m away
                </span>
              </div>
            </div>

            <button onClick={leaveLounge} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
              Leave
            </button>
          </div>

          {/* Active Speakers Stage Grid */}
          <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Volume2 size={14} color="#00f2fe" /> ACTIVE SPEAKERS ({activeLounge.activeSpeakers.length})
              </span>
              <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Users size={12} /> {activeLounge.listenerCount} listening
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {activeLounge.activeSpeakers.map(speaker => (
                <div key={speaker.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    position: 'relative',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: speaker.isSpeaking ? 'var(--grad-ahoj)' : '#1e293b',
                    boxShadow: speaker.isSpeaking ? '0 0 20px rgba(0, 242, 254, 0.6)' : 'none'
                  }}>
                    <img src={speaker.avatarUrl} alt={speaker.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    {speaker.isSpeaking && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: '#00f2fe',
                        borderRadius: '50%',
                        padding: '3px',
                        color: '#030712'
                      }}>
                        <Volume2 size={12} />
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600, marginTop: '6px' }}>{speaker.name}</span>
                </div>
              ))}
            </div>

            {/* Audio Wave Visualizer Animation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '16px', height: '24px' }}>
              {[40, 70, 30, 90, 50, 80, 20, 60, 100, 40].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: `${isMicMuted ? 8 : h}%`,
                    background: 'var(--grad-ahoj)',
                    borderRadius: '2px',
                    transition: 'height 0.2s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Live Chat Stream */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', marginBottom: '12px', gap: '8px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#00f2fe', fontWeight: 700 }}>{msg.user}</span>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>{msg.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#e5e7eb' }}>{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Reaction Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', justifyContent: 'center' }}>
            {['🔥', '☕️', '👏', '❤️', '🚀'].map(emoji => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                style={{
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Bottom Audio & Chat Input Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={toggleMic}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: isMicMuted ? '#374151' : 'var(--grad-ahoj)',
                color: isMicMuted ? '#9ca3af' : '#030712',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isMicMuted ? 'none' : '0 0 16px rgba(0, 242, 254, 0.5)'
              }}
            >
              {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <form onSubmit={handleSend} style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Message room..."
                style={{
                  flex: 1,
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'var(--grad-ahoj)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: '#030712',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>

        </div>
      </IonContent>
    </IonModal>
  );
};
