import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { SparkCreateModal } from '../components/SparkCreateModal';
import { Zap, Coffee, Dumbbell, Flame, GraduationCap, Users, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { SparkPublic } from '../services/api';

const CAT_ICONS: Record<SparkPublic['category'], any> = {
  COFFEE: Coffee,
  SPORTS: Dumbbell,
  PARTY: Flame,
  STUDY: GraduationCap,
  MEETUP: Users,
  OTHER: Zap
};

export const SparksPage: React.FC = () => {
  const { sparks, joinSpark } = useApp();
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredSparks = selectedCat === 'ALL' ? sparks : sparks.filter(s => s.category === selectedCat);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#090d16', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--grad-spark)', padding: '6px 10px', borderRadius: '12px', color: '#fff', fontWeight: 800 }}>
                ⚡️ Sparks
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Nearby Meetups</span>
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
                background: 'var(--grad-spark)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> New Spark
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '16px' }}>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px' }}>
            {['ALL', 'COFFEE', 'SPORTS', 'PARTY', 'STUDY', 'MEETUP'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '1px solid #ff0080' : '1px solid rgba(255,255,255,0.08)',
                  background: selectedCat === cat ? 'rgba(255, 0, 128, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: selectedCat === cat ? '#ff0080' : '#9ca3af',
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

          {/* Sparks Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredSparks.map(spark => {
              const Icon = CAT_ICONS[spark.category] || Zap;
              return (
                <div
                  key={spark.id}
                  className="glass-card"
                  style={{
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderLeft: '4px solid #ff0080'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={spark.userAvatarUrl} alt={spark.username} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{spark.username}</span>
                        <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af' }}>{spark.distanceMeters}m away</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: 'rgba(255, 0, 128, 0.1)',
                      color: '#ff0080',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      <Icon size={12} /> {spark.category}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                      {spark.title}
                    </h3>
                    {spark.description && (
                      <p style={{ margin: 0, fontSize: '13px', color: '#d1d5db', lineHeight: '1.4' }}>
                        {spark.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Expires soon • {spark.participantsCount || 1} attending
                    </span>
                    <button
                      onClick={() => joinSpark(spark.id)}
                      style={{
                        background: spark.isJoined ? 'rgba(16, 185, 129, 0.2)' : 'var(--grad-spark)',
                        border: spark.isJoined ? '1px solid #10b981' : 'none',
                        padding: '6px 14px',
                        borderRadius: '14px',
                        color: spark.isJoined ? '#10b981' : '#fff',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {spark.isJoined ? (
                        <> <CheckCircle2 size={14} /> Attending </>
                      ) : (
                        'Join Spark'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        <SparkCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      </IonContent>
    </IonPage>
  );
};
