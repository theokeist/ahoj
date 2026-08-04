import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { ChatThreadModal } from '../components/ChatThreadModal';
import { MessageSquare, MapPin, Search } from 'lucide-react';

export const ChatsPage: React.FC = () => {
  const { chats, setActiveChat } = useApp();

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#090d16', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--grad-ahoj)', padding: '6px 10px', borderRadius: '12px', color: '#030712', fontWeight: 800 }}>
              💬 Messages
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Proximity Chats</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '16px' }}>

          {/* Search bar */}
          <div className="glass-card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Search size={18} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search chats..."
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '14px', outline: 'none', width: '100%' }}
            />
          </div>

          {/* Chats List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className="glass-card"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', padding: '2px', background: 'var(--grad-ahoj)' }}>
                  <img src={chat.user.avatarUrl} alt={chat.user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  {chat.unreadCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: '#ff0080',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {chat.unreadCount}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 700 }}>{chat.user.username}</h4>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{chat.lastMessageTime}</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        <ChatThreadModal />
      </IonContent>
    </IonPage>
  );
};
