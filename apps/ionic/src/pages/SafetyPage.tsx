import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent, IonRange, IonButton } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { Shield, Ghost, MapPin, AlertTriangle, Plus, Check, Clock, BellRing, Lock, ShieldAlert } from 'lucide-react';

export const SafetyPage: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    safeZones,
    addSafeZone,
    toggleSafeZone,
    sosActive,
    triggerSos,
    cancelSos
  } = useApp();

  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(300);
  const [isAddingZone, setIsAddingZone] = useState(false);

  // Meetup Safe Mode timer state
  const [safeTimerActive, setSafeTimerActive] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;
    addSafeZone(newZoneName.trim(), newZoneRadius);
    setNewZoneName('');
    setIsAddingZone(false);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#090d16', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '6px 10px', borderRadius: '12px', color: '#ef4444', fontWeight: 800 }}>
              🛡️ Safety & Ghost Mode
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Privacy & Emergency Suite</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '16px' }}>

          {/* Emergency SOS Banner */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px', borderLeft: '4px solid #ef4444', background: sosActive ? 'rgba(239, 68, 68, 0.2)' : 'var(--glass-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '50%', background: sosActive ? '#ef4444' : 'rgba(239, 68, 68, 0.15)', color: '#fff' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 800 }}>
                    {sosActive ? '🚨 SOS BROADCAST ACTIVE' : 'Community SOS Alert'}
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                    {sosActive ? 'Your geolocated alert ping has been sent to nearby verified users.' : 'Send anonymous emergency alert to nearby verified users in real life.'}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              {sosActive ? (
                <button
                  onClick={cancelSos}
                  style={{ width: '100%', background: '#374151', border: 'none', padding: '12px', borderRadius: '14px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel SOS Broadcast
                </button>
              ) : (
                <button
                  onClick={triggerSos}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', border: 'none', padding: '12px', borderRadius: '14px', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
                >
                  BROADCAST EMERGENCY SOS 🚨
                </button>
              )}
            </div>
          </div>

          {/* Ghost Mode & Fuzz Controls */}
          <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', fontSize: '18px', color: '#fff' }}>
            Ghost Mode & Location Fuzzing
          </h3>

          <div className="glass-card" style={{ padding: '18px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Ghost size={22} color="#00f2fe" />
                <div>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: 700 }}>Ghost Mode Active</h4>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>Obfuscate coordinates to a randomized grid</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentUser.privacyMode === 'GHOST'}
                onChange={e => updateCurrentUser({ privacyMode: e.target.checked ? 'GHOST' : 'PUBLIC' })}
                style={{ width: '22px', height: '22px', accentColor: '#00f2fe', cursor: 'pointer' }}
              />
            </div>

            {currentUser.privacyMode === 'GHOST' && (
              <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>LOCATION FUZZ MARGIN</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#00f2fe' }}>{currentUser.ghostFuzzMeters}m</span>
                </div>
                <IonRange
                  min={100}
                  max={1000}
                  step={50}
                  value={currentUser.ghostFuzzMeters}
                  onIonChange={e => updateCurrentUser({ ghostFuzzMeters: e.detail.value as number })}
                  style={{ '--bar-background': '#1e293b', '--bar-background-active': '#00f2fe', '--knob-background': '#00f2fe', padding: 0 }}
                />
              </div>
            )}
          </div>

          {/* First-Time Meetup Safe Mode Timer */}
          <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', fontSize: '18px', color: '#fff' }}>
            First-Time Meetup Safe Mode
          </h3>

          <div className="glass-card" style={{ padding: '18px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Clock size={20} color="#ff0080" />
              <div>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: 700 }}>Meetup Safety Check-In Timer</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                  Triggers safety check-in prompt after your meetup. If unacknowledged, pings trusted contacts.
                </p>
              </div>
            </div>

            {safeTimerActive ? (
              <div style={{ background: 'rgba(255, 0, 128, 0.15)', padding: '14px', borderRadius: '14px', border: '1px solid #ff0080', textAlign: 'center' }}>
                <span style={{ fontSize: '14px', color: '#fff', fontWeight: 800 }}>
                  ⏱️ Safety Timer Running: {timerMinutes} mins remaining
                </span>
                <button
                  onClick={() => setSafeTimerActive(false)}
                  style={{ marginTop: '10px', background: '#374151', border: 'none', padding: '8px 16px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Check In & Dismiss Timer
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSafeTimerActive(true)}
                style={{ width: '100%', background: 'var(--grad-spark)', border: 'none', padding: '12px', borderRadius: '14px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Start 30-Minute Meetup Timer ⚡️
              </button>
            )}
          </div>

          {/* Geofenced Safe Zones Manager */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '18px', color: '#fff' }}>
              Geofenced Safe Zones ({safeZones.length})
            </h3>
            <button
              onClick={() => setIsAddingZone(true)}
              style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={16} /> Add Zone
            </button>
          </div>

          {isAddingZone && (
            <form onSubmit={handleAddZone} className="glass-card" style={{ padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                required
                placeholder="Zone name (e.g., Home, Office)"
                value={newZoneName}
                onChange={e => setNewZoneName(e.target.value)}
                style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <IonButton type="submit" size="small" style={{ flex: 1, '--background': 'var(--grad-ahoj)', color: '#030712', fontWeight: 700 }}>Save Zone</IonButton>
                <button type="button" onClick={() => setIsAddingZone(false)} style={{ background: '#374151', border: 'none', borderRadius: '10px', padding: '0 14px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {safeZones.map(zone => (
              <div key={zone.id} className="glass-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin size={20} color={zone.isActive ? '#00f2fe' : '#9ca3af'} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 700 }}>{zone.name}</h4>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>{zone.radiusMeters}m radius • Fuzz: {zone.fuzzLevel}</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={zone.isActive}
                  onChange={() => toggleSafeZone(zone.id)}
                  style={{ width: '20px', height: '20px', accentColor: '#00f2fe', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};
