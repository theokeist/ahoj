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
        <IonToolbar style={{ '--background': '#080a0e', padding: '4px 12px', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'linear-gradient(135deg, #ea4335 0%, #b91c1c 100%)', padding: '5px 10px', borderRadius: '8px', color: '#fff', fontWeight: 800, fontSize: '13px', letterSpacing: '0.02em' }}>
                ⚡️ Sparks
              </div>
              <span style={{ fontSize: '11px', color: '#8e9aaf', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Nearby Meetups</span>
            </div>

            <button
              onClick={() => setIsCreateOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #ea4335 0%, #0099cc 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              <Plus size={15} /> New Spark
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#0b0e14' }}>
        <div style={{ padding: '16px' }}>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '8px' }}>
            {['ALL', 'COFFEE', 'SPORTS', 'PARTY', 'STUDY', 'MEETUP'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: selectedCat === cat ? '1px solid #ea4335' : '1px solid rgba(255,255,255,0.12)',
                  background: selectedCat === cat ? 'rgba(234, 67, 53, 0.2)' : 'rgba(255,255,255,0.04)',
                  color: selectedCat === cat ? '#ea4335' : '#8e9aaf',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sparks Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredSparks.map(spark => {
              const Icon = CAT_ICONS[spark.category] || Zap;
              return (
                <div
                  key={spark.id}
                  className="bb10-card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderLeft: '4px solid #ea4335'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={spark.userAvatarUrl} alt={spark.username} style={{ width: '34px', height: '34px', borderRadius: '50%' }} />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{spark.username}</span>
                        <span style={{ display: 'block', fontSize: '11px', color: '#8e9aaf' }}>{spark.distanceMeters}m away</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: 'rgba(234, 67, 53, 0.15)',
                      color: '#ea4335',
                      fontSize: '10px',
                      fontWeight: 800
                    }}>
                      <Icon size={12} /> {spark.category}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                      {spark.title}
                    </h3>
                    {spark.description && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>
                        {spark.description}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span style={{ fontSize: '11px', color: '#8e9aaf', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> Expires soon • {spark.participantsCount || 1} attending
                    </span>
                    <button
                      onClick={() => joinSpark(spark.id)}
                      style={{
                        background: spark.isJoined ? 'rgba(0, 200, 83, 0.2)' : 'linear-gradient(135deg, #ea4335 0%, #0099cc 100%)',
                        border: spark.isJoined ? '1px solid #00c853' : 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        color: spark.isJoined ? '#00c853' : '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {spark.isJoined ? (
                        <> <CheckCircle2 size={13} /> Attending </>
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
