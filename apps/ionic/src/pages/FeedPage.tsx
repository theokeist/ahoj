import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonRange
} from '@ionic/react';
import { RadarCanvas } from '../components/RadarCanvas';
import { MapView } from '../components/MapView';
import { UserDetailModal } from '../components/UserDetailModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { AccessRequestsModal } from '../components/AccessRequestsModal';
import { useApp } from '../context/AppContext';
import { UserPublic, SparkPublic, LoungePublic } from '../services/api';
import { Radar, Map as MapIcon, List, MapPin, Shield, Bell, KeyRound, Sparkles } from 'lucide-react';

export const FeedPage: React.FC = () => {
  const {
    nearbyUsers,
    sparks,
    lounges,
    radiusKm,
    setRadiusKm,
    unreadNotificationsCount,
    setIsNotificationsOpen,
    accessRequests,
    setIsAccessRequestsOpen,
    setActiveLounge
  } = useApp();

  const [viewMode, setViewMode] = useState<'radar' | 'map' | 'list'>('radar');
  const [selectedUser, setSelectedUser] = useState<UserPublic | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('ALL');

  const pendingRequestsCount = accessRequests.filter(r => r.status === 'PENDING').length;

  const filteredUsers = selectedTag === 'ALL'
    ? nearbyUsers
    : nearbyUsers.filter(u => u.interests && u.interests.includes(selectedTag));

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#090d16', '--border-color': 'transparent', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--grad-ahoj)', padding: '6px 10px', borderRadius: '12px', color: '#030712', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                /A\ ahoj
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Proximity Feed</span>
            </div>

            {/* Header Actions & Notifications */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Access Requests Button */}
              <button
                onClick={() => setIsAccessRequestsOpen(true)}
                style={{ position: 'relative', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px', color: '#00f2fe', cursor: 'pointer' }}
              >
                <KeyRound size={18} />
                {pendingRequestsCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ff0080', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              {/* Notifications Button */}
              <button
                onClick={() => setIsNotificationsOpen(true)}
                style={{ position: 'relative', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '8px', color: '#fff', cursor: 'pointer' }}
              >
                <Bell size={18} />
                {unreadNotificationsCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#00f2fe', color: '#030712', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '16px' }}>

          {/* View Mode Switcher (Radar / Map / List) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', background: '#111827', padding: '3px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', width: '100%' }}>
              <button
                onClick={() => setViewMode('radar')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: viewMode === 'radar' ? 'var(--grad-ahoj)' : 'transparent',
                  color: viewMode === 'radar' ? '#030712' : '#9ca3af',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <Radar size={14} /> Radar
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: viewMode === 'map' ? 'var(--grad-ahoj)' : 'transparent',
                  color: viewMode === 'map' ? '#030712' : '#9ca3af',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <MapIcon size={14} /> Spatial Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: viewMode === 'list' ? 'var(--grad-ahoj)' : 'transparent',
                  color: viewMode === 'list' ? '#030712' : '#9ca3af',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <List size={14} /> List
              </button>
            </div>
          </div>

          {/* Radius Selector Slider */}
          <div className="glass-card" style={{ padding: '14px 18px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#00f2fe" /> SEARCH RADIUS
              </span>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#00f2fe', fontFamily: 'var(--font-heading)' }}>
                {radiusKm} km
              </span>
            </div>
            <IonRange
              min={0.5}
              max={5}
              step={0.5}
              value={radiusKm}
              onIonChange={e => setRadiusKm(e.detail.value as number)}
              style={{ '--bar-background': '#1e293b', '--bar-background-active': '#00f2fe', '--knob-background': '#00f2fe', padding: 0 }}
            />
          </div>

          {/* Interest Filter Tags */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
            {['ALL', 'coffee', 'tech', 'bouldering', 'music', 'design'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  border: selectedTag === tag ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.08)',
                  background: selectedTag === tag ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255,255,255,0.04)',
                  color: selectedTag === tag ? '#00f2fe' : '#9ca3af',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Render Active View */}
          {viewMode === 'radar' && (
            <div>
              <RadarCanvas users={filteredUsers} radiusKm={radiusKm} onSelectUser={setSelectedUser} />

              <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: '20px', marginBottom: '12px', fontSize: '18px', color: '#fff' }}>
                Nearby People ({filteredUsers.length})
              </h3>

              {/* Horizontal Scroll Cards */}
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="glass-card"
                    style={{
                      minWidth: '140px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', padding: '2px', background: user.privacyMode === 'GHOST' ? '#6b7280' : 'var(--grad-ahoj)' }}>
                      <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff', marginTop: '8px' }}>{user.username}</span>
                    <span style={{ fontSize: '11px', color: '#00f2fe', marginTop: '2px' }}>{user.distanceMeters}m away</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'map' && (
            <MapView
              users={filteredUsers}
              sparks={sparks}
              lounges={lounges}
              radiusKm={radiusKm}
              onSelectUser={setSelectedUser}
              onSelectLounge={(l) => setActiveLounge(l)}
            />
          )}

          {viewMode === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="glass-card"
                  style={{
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '50%', padding: '2px', background: user.privacyMode === 'GHOST' ? '#6b7280' : 'var(--grad-ahoj)' }}>
                      <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 700 }}>{user.username}</h4>
                        {user.privacyMode === 'GHOST' && <Shield size={14} color="#9ca3af" />}
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#00f2fe' }}>"{user.statusMessage}"</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#00f2fe' }}>{user.distanceMeters}m</span>
                    <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{user.lastActive}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        <NotificationsModal />
        <AccessRequestsModal />
      </IonContent>
    </IonPage>
  );
};
