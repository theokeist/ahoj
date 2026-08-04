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
import { UserPublic } from '../services/api';
import { Radar, Map as MapIcon, List, MapPin, Shield, Bell, KeyRound } from 'lucide-react';

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
      {/* BlackBerry 10 Hub Header Bar */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#080a0e', '--border-color': 'rgba(255,255,255,0.12)', padding: '4px 12px', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* BB10 LED Indicator */}
              <div className="bb10-led" />
              <div style={{ background: 'var(--grad-ahoj)', padding: '5px 12px', borderRadius: '8px', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-heading)', fontSize: '14px', letterSpacing: '0.02em', boxShadow: '0 2px 8px rgba(0, 153, 204, 0.4)' }}>
                /A\ ahoj
              </div>
              <span style={{ fontSize: '11px', color: '#8e9aaf', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BB10 Proximity</span>
            </div>

            {/* BlackBerry Hub Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsAccessRequestsOpen(true)}
                style={{ position: 'relative', background: '#141a24', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '7px 9px', color: '#0099cc', cursor: 'pointer' }}
              >
                <KeyRound size={16} />
                {pendingRequestsCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ea4335', color: '#fff', borderRadius: '50%', width: '15px', height: '15px', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pendingRequestsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsNotificationsOpen(true)}
                style={{ position: 'relative', background: '#141a24', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '7px 9px', color: '#f1f5f9', cursor: 'pointer' }}
              >
                <Bell size={16} />
                {unreadNotificationsCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#0099cc', color: '#fff', borderRadius: '50%', width: '15px', height: '15px', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#0b0e14' }}>
        <div style={{ padding: '16px' }}>

          {/* View Mode Switcher (BB10 Cascades Segment Bar) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', background: '#141a24', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', width: '100%' }}>
              <button
                onClick={() => setViewMode('radar')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'radar' ? '#0099cc' : 'transparent',
                  color: viewMode === 'radar' ? '#fff' : '#8e9aaf',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                <Radar size={13} /> Radar
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'map' ? '#0099cc' : 'transparent',
                  color: viewMode === 'map' ? '#fff' : '#8e9aaf',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                <MapIcon size={13} /> Spatial Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? '#0099cc' : 'transparent',
                  color: viewMode === 'list' ? '#fff' : '#8e9aaf',
                  fontWeight: 700,
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  cursor: 'pointer'
                }}
              >
                <List size={13} /> List
              </button>
            </div>
          </div>

          {/* Radius Selector Slider (BB10 Slate Card) */}
          <div className="bb10-card" style={{ padding: '14px 18px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#8e9aaf', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.04em' }}>
                <MapPin size={13} color="#0099cc" /> SEARCH RADIUS
              </span>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0099cc', fontFamily: 'var(--font-heading)' }}>
                {radiusKm} km
              </span>
            </div>
            <IonRange
              min={0.5}
              max={5}
              step={0.5}
              value={radiusKm}
              onIonChange={e => setRadiusKm(e.detail.value as number)}
              style={{ '--bar-background': '#1c2636', '--bar-background-active': '#0099cc', '--knob-background': '#0099cc', padding: 0 }}
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
                  borderRadius: '12px',
                  border: selectedTag === tag ? '1px solid #0099cc' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedTag === tag ? 'rgba(0, 153, 204, 0.2)' : 'rgba(255,255,255,0.04)',
                  color: selectedTag === tag ? '#0099cc' : '#8e9aaf',
                  fontSize: '11px',
                  fontWeight: 700,
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

              <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: '20px', marginBottom: '12px', fontSize: '17px', color: '#fff' }}>
                Nearby Active Frames ({filteredUsers.length})
              </h3>

              {/* Horizontal Scroll Cards */}
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="bb10-card"
                    style={{
                      minWidth: '140px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ position: 'relative', width: '54px', height: '54px', borderRadius: '50%', padding: '2px', background: user.privacyMode === 'GHOST' ? '#5a6578' : '#0099cc' }}>
                      <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff', marginTop: '8px' }}>{user.username}</span>
                    <span style={{ fontSize: '11px', color: '#0099cc', marginTop: '2px' }}>{user.distanceMeters}m away</span>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="bb10-card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', padding: '2px', background: user.privacyMode === 'GHOST' ? '#5a6578' : '#0099cc' }}>
                      <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 700 }}>{user.username}</h4>
                        {user.privacyMode === 'GHOST' && <Shield size={13} color="#8e9aaf" />}
                      </div>
                      <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#0099cc' }}>"{user.statusMessage}"</p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0099cc' }}>{user.distanceMeters}m</span>
                    <span style={{ display: 'block', fontSize: '11px', color: '#8e9aaf', marginTop: '2px' }}>{user.lastActive}</span>
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
