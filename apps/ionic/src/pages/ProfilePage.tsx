import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent, IonRange, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useApp, CurrentUser } from '../context/AppContext';
import { AuthModal } from '../components/AuthModal';
import { User, Shield, ShieldAlert, Eye, Ghost, Edit3, Settings, Globe, LogOut, Sparkles, Check, Ticket, MapPin, AlertTriangle, KeyRound } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const history = useHistory();
  const {
    currentUser,
    updateCurrentUser,
    setIsAuthModalOpen,
    isLoggedIn,
    setIsLoggedIn,
    accessRequests,
    setIsAccessRequestsOpen,
    safeZones
  } = useApp();

  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState(currentUser.statusMessage);

  const pendingRequestsCount = accessRequests.filter(r => r.status === 'PENDING').length;

  const handleSaveStatus = () => {
    if (statusInput.trim()) {
      updateCurrentUser({ statusMessage: statusInput });
    }
    setIsEditingStatus(false);
  };

  const privacyModes: { mode: CurrentUser['privacyMode']; label: string; desc: string; icon: any }[] = [
    { mode: 'PUBLIC', label: 'Public', desc: 'Visible to all nearby users on radar', icon: Eye },
    { mode: 'PRIVATE', label: 'Private', desc: 'Requires access approval to view full profile', icon: Shield },
    { mode: 'GHOST', label: 'Ghost', desc: 'Fuzzed location & masked identity', icon: Ghost },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#090d16', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--grad-ahoj)', padding: '6px 10px', borderRadius: '12px', color: '#030712', fontWeight: 800 }}>
                👤 Profile
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Your Identity</span>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => setIsLoggedIn(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{ background: 'var(--grad-ahoj)', border: 'none', padding: '6px 14px', borderRadius: '14px', color: '#030712', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            )}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '16px' }}>

          {/* User Header */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              position: 'relative',
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              padding: '3px',
              background: currentUser.privacyMode === 'GHOST' ? '#6b7280' : 'var(--grad-ahoj)',
              boxShadow: '0 0 24px rgba(0, 242, 254, 0.35)'
            }}>
              <img src={currentUser.avatarUrl} alt={currentUser.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', margin: '12px 0 2px 0', fontSize: '22px', color: '#fff' }}>
              {currentUser.username}
            </h2>
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#9ca3af', textAlign: 'center' }}>
              {currentUser.bio}
            </p>

            {/* Interest Badges */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              {currentUser.interests.map(interest => (
                <span key={interest} style={{ fontSize: '11px', color: '#00f2fe', background: 'rgba(0, 242, 254, 0.1)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                  #{interest}
                </span>
              ))}
            </div>

            {/* Status Message */}
            <div style={{ width: '100%', background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {isEditingStatus ? (
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <input
                    type="text"
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                    maxLength={60}
                    style={{ flex: 1, background: '#1e293b', border: 'none', borderRadius: '10px', padding: '6px 10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                  <button onClick={handleSaveStatus} style={{ background: 'var(--grad-ahoj)', border: 'none', borderRadius: '10px', padding: '6px 12px', color: '#030712', fontWeight: 700, cursor: 'pointer' }}>
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '14px', color: '#00f2fe', fontWeight: 600 }}>
                    "{currentUser.statusMessage}"
                  </span>
                  <button onClick={() => setIsEditingStatus(true)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                    <Edit3 size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Navigation Cards (Safety Suite & Flash Deals & Access Requests) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div
              onClick={() => history.push('/safety')}
              className="glass-card"
              style={{ padding: '14px', cursor: 'pointer', borderLeft: '4px solid #ef4444' }}
            >
              <ShieldAlert size={22} color="#ef4444" />
              <h4 style={{ margin: '8px 0 2px 0', fontSize: '14px', color: '#fff', fontWeight: 700 }}>Safety Suite</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Safe zones & SOS emergency</p>
            </div>

            <div
              onClick={() => history.push('/deals')}
              className="glass-card"
              style={{ padding: '14px', cursor: 'pointer', borderLeft: '4px solid #00f2fe' }}
            >
              <Ticket size={22} color="#00f2fe" />
              <h4 style={{ margin: '8px 0 2px 0', fontSize: '14px', color: '#fff', fontWeight: 700 }}>Flash Deals</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Claim merchant vouchers</p>
            </div>
          </div>

          {/* Access Requests Quick Card */}
          <div
            onClick={() => setIsAccessRequestsOpen(true)}
            className="glass-card"
            style={{ padding: '14px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <KeyRound size={20} color="#00f2fe" />
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 700 }}>Access Requests</h4>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{pendingRequestsCount} pending request permissions</span>
              </div>
            </div>
            {pendingRequestsCount > 0 && (
              <span style={{ background: '#ff0080', color: '#fff', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                {pendingRequestsCount} NEW
              </span>
            )}
          </div>

          {/* Privacy Mode Selector */}
          <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', fontSize: '18px', color: '#fff' }}>
            Privacy Mode
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {privacyModes.map(item => {
              const Icon = item.icon;
              const isSelected = currentUser.privacyMode === item.mode;
              return (
                <div
                  key={item.mode}
                  onClick={() => updateCurrentUser({ privacyMode: item.mode })}
                  className="glass-card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(0, 242, 254, 0.1)' : 'var(--glass-bg)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '8px', borderRadius: '12px', background: isSelected ? 'var(--grad-ahoj)' : '#1e293b', color: isSelected ? '#030712' : '#9ca3af' }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 700 }}>{item.label}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{item.desc}</p>
                    </div>
                  </div>

                  {isSelected && <Check size={20} color="#00f2fe" />}
                </div>
              );
            })}
          </div>

        </div>

        <AuthModal />
      </IonContent>
    </IonPage>
  );
};
