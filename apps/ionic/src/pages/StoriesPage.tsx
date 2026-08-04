import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { StoryViewerModal } from '../components/StoryViewerModal';
import { StoryCreateModal } from '../components/StoryCreateModal';
import { Sparkles, Plus, Clock, MapPin } from 'lucide-react';

export const StoriesPage: React.FC = () => {
  const { stories, setActiveStory, setIsStoryCreateOpen } = useApp();

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#090d16', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--grad-ahoj)', padding: '6px 10px', borderRadius: '12px', color: '#030712', fontWeight: 800 }}>
                📸 Stories
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>24h Nearby Moments</span>
            </div>

            <button
              onClick={() => setIsStoryCreateOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '16px',
                border: 'none',
                background: 'var(--grad-spark)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} /> Post Story
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '16px' }}>

          {/* Top Story Avatars Carousel */}
          <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '8px' }}>
            {/* Create Story Button */}
            <div
              onClick={() => setIsStoryCreateOpen(true)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px', cursor: 'pointer' }}
            >
              <div style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#111827',
                border: '2px dashed #00f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00f2fe'
              }}>
                <Plus size={24} />
              </div>
              <span style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px', fontWeight: 600 }}>Your Story</span>
            </div>

            {/* Stories */}
            {stories.map(story => (
              <div
                key={story.id}
                onClick={() => setActiveStory(story)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '64px', cursor: 'pointer' }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  padding: '3px',
                  background: 'var(--grad-spark)',
                  boxShadow: '0 0 16px rgba(255, 0, 128, 0.4)'
                }}>
                  <img src={story.userAvatarUrl} alt={story.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#fff', marginTop: '6px', fontWeight: 600 }}>{story.username}</span>
              </div>
            ))}
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', margin: '16px 0 12px 0', fontSize: '18px', color: '#fff' }}>
            Recent Nearby Stories ({stories.length})
          </h3>

          {/* Grid View of Stories */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {stories.map(story => (
              <div
                key={story.id}
                onClick={() => setActiveStory(story)}
                className="glass-card"
                style={{
                  position: 'relative',
                  height: '240px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <img src={story.mediaUrl} alt={story.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)' }} />

                {/* User Header */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={story.userAvatarUrl} alt={story.username} style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid #00f2fe' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{story.username}</span>
                </div>

                {/* Caption */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
                  {story.locationName && (
                    <span style={{ fontSize: '10px', color: '#00f2fe', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '2px' }}>
                      <MapPin size={10} /> {story.locationName}
                    </span>
                  )}
                  <p style={{ margin: 0, fontSize: '13px', color: '#fff', fontWeight: 600, lineHeight: '1.3' }}>
                    {story.caption}
                  </p>
                  <span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} /> {story.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

        <StoryViewerModal />
        <StoryCreateModal />
      </IonContent>
    </IonPage>
  );
};
