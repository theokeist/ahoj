import React, { useEffect, useState } from 'react';
import { IonModal, IonContent } from '@ionic/react';
import { X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StoryViewerModal: React.FC = () => {
  const { activeStory, setActiveStory } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!activeStory) {
      setProgress(0);
      return;
    }
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setActiveStory(null);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeStory, setActiveStory]);

  if (!activeStory) return null;

  return (
    <IonModal isOpen={!!activeStory} onDidDismiss={() => setActiveStory(null)}>
      <IonContent style={{ '--background': '#030712' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Background Media */}
          <img
            src={activeStory.mediaUrl}
            alt={activeStory.caption}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 70%, rgba(0,0,0,0.85) 100%)' }} />

          {/* Top Bar: Progress + User Info + Close */}
          <div style={{ position: 'relative', zIndex: 10, padding: '16px' }}>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--grad-ahoj)', transition: 'width 0.1s linear' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={activeStory.userAvatarUrl}
                  alt={activeStory.username}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #00f2fe' }}
                />
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: 700 }}>{activeStory.username}</h4>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{activeStory.createdAt}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                style={{ background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Bottom Bar: Caption + Quick Reply */}
          <div style={{ position: 'relative', zIndex: 10, padding: '24px' }}>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.8)', marginBottom: '16px' }}>
              {activeStory.caption}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder={`Reply to ${activeStory.username}...`}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '24px',
                  padding: '12px 18px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              <button style={{
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
              }}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
