import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { LoungePublic } from '../services/api';
import { Radio, MapPin, X, Sparkles } from 'lucide-react';

interface LoungeCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoungeCreateModal: React.FC<LoungeCreateModalProps> = ({ isOpen, onClose }) => {
  const { createLounge } = useApp();
  const [title, setTitle] = useState('');
  const [venueName, setVenueName] = useState('Prague Tech Hub');
  const [category, setCategory] = useState<LoungePublic['category']>('AUDIO');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createLounge(title.trim(), venueName.trim() || 'Nearby Venue', category, description.trim());
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '24px 16px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', borderRadius: '10px', background: 'var(--grad-ahoj)', color: '#030712' }}>
                <Radio size={18} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0, fontSize: '20px' }}>
                Host Spatial Lounge
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '6px' }}>
                LOUNGE TITLE
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Coffee & Web3 Tech Talk ☕️"
                maxLength={60}
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '6px' }}>
                VENUE / LOCATION NAME
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} color="#00f2fe" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={e => setVenueName(e.target.value)}
                  placeholder="e.g. Bitcoin Coffee, Prague"
                  style={{
                    width: '100%',
                    background: '#111827',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '12px 14px 12px 42px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' }}>
                LOUNGE TYPE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {(['AUDIO', 'CHAT', 'MUSIC', 'GAMING', 'TECH'] as const).map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      border: category === cat ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.08)',
                      background: category === cat ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.04)',
                      color: category === cat ? '#00f2fe' : '#9ca3af',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '6px' }}>
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What is this lounge about?..."
                style={{
                  width: '100%',
                  background: '#111827',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <IonButton
              type="submit"
              expand="block"
              shape="round"
              style={{ marginTop: '16px', '--background': 'var(--grad-ahoj)', color: '#030712', height: '48px', fontWeight: 700 }}
            >
              Open Spatial Lounge 🎙️
            </IonButton>

          </form>

        </div>
      </IonContent>
    </IonModal>
  );
};
