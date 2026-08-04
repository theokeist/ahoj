import React from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/react';
import { UserPublic } from '../services/api';
import { Shield, MessageSquare, Lock, MapPin, Sparkles, Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface UserDetailModalProps {
  user: UserPublic | null;
  onClose: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  const { requestAccess, setActiveChat, chats } = useApp();

  if (!user) return null;

  const handleStartChat = () => {
    const existing = chats.find(c => c.user.id === user.id);
    if (existing) {
      setActiveChat(existing);
    } else {
      setActiveChat({
        id: `chat-${user.id}`,
        user,
        lastMessage: 'Started new chat',
        lastMessageTime: 'Just now',
        unreadCount: 0
      });
    }
    onClose();
  };

  return (
    <IonModal isOpen={!!user} onDidDismiss={onClose} initialBreakpoint={0.65} breakpoints={[0.65, 0.95]}>
      <IonContent style={{ '--background': '#0f172a' }}>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Avatar with Glow */}
          <div style={{
            position: 'relative',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            padding: '3px',
            background: user.privacyMode === 'GHOST' ? '#6b7280' : 'var(--grad-ahoj)',
            boxShadow: '0 0 24px rgba(0, 242, 254, 0.3)'
          }}>
            <img
              src={user.avatarUrl}
              alt={user.username}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: '#0f172a',
              borderRadius: '50%',
              padding: '4px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              {user.privacyMode === 'GHOST' ? <Shield size={14} color="#9ca3af" /> : <Sparkles size={14} color="#00f2fe" />}
            </div>
          </div>

          <h2 style={{ fontFamily: 'var(--font-heading)', marginTop: '12px', marginBottom: '2px', fontSize: '22px', color: '#fff' }}>
            {user.username}
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
            <MapPin size={13} color="#00f2fe" />
            <span>{user.distanceMeters} meters away</span>
            <span>•</span>
            <Clock size={13} />
            <span>{user.lastActive}</span>
          </div>

          {/* Status Message Card */}
          <div className="glass-card" style={{ width: '100%', padding: '14px 16px', marginBottom: '16px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '15px', color: '#00f2fe', fontWeight: 600 }}>
              "{user.statusMessage}"
            </p>
          </div>

          {/* Bio */}
          <p style={{ fontSize: '14px', color: '#d1d5db', textAlign: 'center', marginBottom: '24px', lineHeight: '1.5' }}>
            {user.bio}
          </p>

          {/* Action Buttons */}
          {user.privacyMode === 'PRIVATE' && user.accessStatus !== 'APPROVED' ? (
            <div style={{ width: '100%' }}>
              <IonButton
                expand="block"
                shape="round"
                disabled={user.accessStatus === 'PENDING'}
                onClick={() => requestAccess(user.id)}
                style={{ '--background': 'var(--grad-spark)', color: '#fff', height: '48px', fontWeight: 700 }}
              >
                {user.accessStatus === 'PENDING' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} /> Access Requested</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} /> Request Access to Profile</span>
                )}
              </IonButton>
            </div>
          ) : (
            <div style={{ width: '100%', display: 'flex', gap: '12px' }}>
              <IonButton
                expand="block"
                shape="round"
                onClick={handleStartChat}
                style={{ flex: 1, '--background': 'var(--grad-ahoj)', height: '48px', fontWeight: 700 }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={18} /> Send Message</span>
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};
