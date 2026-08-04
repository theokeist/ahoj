import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { Zap, Coffee, Dumbbell, Flame, GraduationCap, Users, Plus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SparkPublic } from '../services/api';

interface SparkCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { key: SparkPublic['category']; label: string; icon: any }[] = [
  { key: 'COFFEE', label: 'Coffee', icon: Coffee },
  { key: 'SPORTS', label: 'Sports', icon: Dumbbell },
  { key: 'PARTY', label: 'Party', icon: Flame },
  { key: 'STUDY', label: 'Study', icon: GraduationCap },
  { key: 'MEETUP', label: 'Meetup', icon: Users },
];

export const SparkCreateModal: React.FC<SparkCreateModalProps> = ({ isOpen, onClose }) => {
  const { createSpark } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SparkPublic['category']>('MEETUP');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createSpark(title, description, category);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={0.75} breakpoints={[0.75, 0.95]}>
      <IonContent style={{ '--background': '#0f172a' }}>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--grad-spark)', padding: '8px', borderRadius: '12px', color: '#fff' }}>
                <Zap size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '20px', color: '#fff' }}>Create a Spark</h2>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>

          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: 0, marginBottom: '20px' }}>
            Broadcast an instant activity to nearby Ahoj users. Expires automatically in 2 hours.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '8px' }}>CATEGORY</label>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.1)',
                        background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.05)',
                        color: isSelected ? '#00f2fe' : '#9ca3af',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Icon size={14} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>SPARK TITLE</label>
              <input
                type="text"
                required
                placeholder="e.g., Quick coffee at Vnitroblock"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>DETAILS (OPTIONAL)</label>
              <textarea
                rows={3}
                placeholder="e.g., Meeting by the main entrance. First coffee on me!"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <IonButton
              type="submit"
              expand="block"
              shape="round"
              style={{ marginTop: '8px', '--background': 'var(--grad-spark)', color: '#fff', height: '48px', fontWeight: 700 }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={18} /> Broadcast Spark</span>
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonModal>
  );
};
