import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { Camera, Image, MapPin, Sparkles, X, Check } from 'lucide-react';

const PRESET_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80', label: 'Prague Night' },
  { url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80', label: 'Coffee Spot' },
  { url: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&auto=format&fit=crop&q=80', label: 'Bouldering Wall' },
  { url: 'https://images.unsplash.com/photo-1538488881523-434905ce4303?w=600&auto=format&fit=crop&q=80', label: 'Sunset View' }
];

export const StoryCreateModal: React.FC = () => {
  const { isStoryCreateOpen, setIsStoryCreateOpen, createStory } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PHOTOS[0].url);
  const [caption, setCaption] = useState('');
  const [locationName, setLocationName] = useState('Bitcoin Coffee, Prague');

  if (!isStoryCreateOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStory(selectedPhoto, caption.trim() || 'Nearby vibes 📸', locationName);
    setIsStoryCreateOpen(false);
    setCaption('');
  };

  return (
    <IonModal isOpen={isStoryCreateOpen} onDidDismiss={() => setIsStoryCreateOpen(false)}>
      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '24px 16px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0, fontSize: '20px' }}>
              📸 Post 24h Proximity Story
            </h2>
            <button onClick={() => setIsStoryCreateOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>

            {/* Photo Preview Container */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '300px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <img src={selectedPhoto} alt="Story preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.8) 100%)' }} />

              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px' }}>
                <span style={{ fontSize: '12px', color: '#00f2fe', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} /> {locationName}
                </span>
                <p style={{ margin: '4px 0 0 0', color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                  {caption || 'Your caption will appear here...'}
                </p>
              </div>
            </div>

            {/* Select Preset Photo or Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '8px' }}>
                SELECT STORY PHOTO
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {PRESET_PHOTOS.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhoto(item.url)}
                    style={{
                      position: 'relative',
                      height: '70px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedPhoto === item.url ? '2px solid #00f2fe' : '1px solid transparent'
                    }}
                  >
                    <img src={item.url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {selectedPhoto === item.url && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0, 242, 254, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={20} color="#030712" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Caption Input */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '6px' }}>
                STORY CAPTION
              </label>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="What's happening nearby right now?..."
                maxLength={100}
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

            {/* Location Tag */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9ca3af', marginBottom: '6px' }}>
                LOCATION TAG
              </label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="Location spot..."
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

            <IonButton
              type="submit"
              expand="block"
              shape="round"
              style={{ marginTop: 'auto', '--background': 'var(--grad-spark)', color: '#fff', height: '48px', fontWeight: 700 }}
            >
              Publish Proximity Story ⚡️
            </IonButton>

          </form>

        </div>
      </IonContent>
    </IonModal>
  );
};
