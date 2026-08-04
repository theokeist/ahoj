import React from 'react';
import { IonModal, IonContent } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { Bell, Zap, Shield, Flame, Camera, Radio, X, CheckCheck } from 'lucide-react';

export const NotificationsModal: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen, notifications, markNotificationsRead } = useApp();

  if (!isNotificationsOpen) return null;

  return (
    <IonModal isOpen={isNotificationsOpen} onDidDismiss={() => setIsNotificationsOpen(false)}>
      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '24px 16px', minHeight: '100%' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', borderRadius: '10px', background: 'var(--grad-ahoj)', color: '#030712' }}>
                <Bell size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0, fontSize: '20px' }}>
                Notifications
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={markNotificationsRead} style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCheck size={14} /> Read all
              </button>
              <button onClick={() => setIsNotificationsOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                className="glass-card"
                style={{
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderLeft: n.read ? '1px solid rgba(255,255,255,0.08)' : '3px solid #00f2fe',
                  background: n.read ? 'rgba(17, 24, 39, 0.4)' : 'rgba(0, 242, 254, 0.08)'
                }}
              >
                {n.avatarUrl ? (
                  <img src={n.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>
                    <Zap size={20} />
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 700 }}>{n.title}</h4>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{n.timestamp}</span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{n.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </IonContent>
    </IonModal>
  );
};
