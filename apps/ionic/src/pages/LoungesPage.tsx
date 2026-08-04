import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { LoungeCreateModal } from '../components/LoungeCreateModal';
import { LoungeRoomModal } from '../components/LoungeRoomModal';
import { Radio, Users, Volume2, Plus, MapPin, Sparkles, Lock } from 'lucide-react';
import { LoungePublic } from '../services/api';

export const LoungesPage: React.FC = () => {
  const { lounges, joinLounge, activeLounge } = useApp();
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredLounges = selectedCat === 'ALL' ? lounges : lounges.filter(l => l.category === selectedCat);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#090d16', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--grad-ahoj)', padding: '6px 10px', borderRadius: '12px', color: '#030712', fontWeight: 800 }}>
                🎙️ Lounges
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Spatial Audio Hubs</span>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '20px',
                border: 'none',
                background: 'var(--grad-ahoj)',
                color: '#030712',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Open Lounge
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '16px' }}>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px' }}>
            {['ALL', 'AUDIO', 'CHAT', 'MUSIC', 'TECH'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.08)',
                  background: selectedCat === cat ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: selectedCat === cat ? '#00f2fe' : '#9ca3af',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Lounges Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredLounges.map(lounge => (
              <div
                key={lounge.id}
                onClick={() => joinLounge(lounge)}
                className="glass-card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderLeft: '4px solid #00f2fe',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#00f2fe', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {lounge.venueName} ({lounge.distanceMeters}m away)
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: 'rgba(0, 242, 254, 0.1)',
                    color: '#00f2fe',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    <Radio size={12} /> {lounge.category}
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                    {lounge.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: '1.4' }}>
                    {lounge.description}
                  </p>
                </div>

                {/* Active Speakers Avatars Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', marginLeft: '6px' }}>
                      {lounge.activeSpeakers.map((speaker, i) => (
                        <img
                          key={speaker.id}
                          src={speaker.avatarUrl}
                          alt={speaker.name}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            marginLeft: i > 0 ? '-8px' : '0',
                            border: '2px solid #090d16'
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: '#d1d5db', fontWeight: 600 }}>
                      {lounge.speakerCount} speakers • {lounge.listenerCount} listening
                    </span>
                  </div>

                  <button style={{
                    background: 'var(--grad-ahoj)',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '14px',
                    color: '#030712',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                    Join Audio
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        <LoungeCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        <LoungeRoomModal />
      </IonContent>
    </IonPage>
  );
};
