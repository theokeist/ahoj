import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent, IonRange, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useApp, CurrentUser } from '../context/AppContext';
import { AuthModal } from '../components/AuthModal';
import { User, Shield, ShieldAlert, Eye, Ghost, Edit3, Settings, Globe, LogOut, Sparkles, Check, Ticket, MapPin, AlertTriangle, KeyRound, Palette } from 'lucide-react';

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
        <IonToolbar style={{ '--background': '#080a0e', padding: '0 12px', boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--grad-ahoj)', padding: '5px 10px', borderRadius: '8px', color: '#fff', fontWeight: 800, fontSize: '13px' }}>
                👤 Profile
              </div>
              <span style={{ fontSize: '11px', color: '#8e9aaf', fontWeight: 700, textTransform: 'uppercase' }}>Your Identity</span>
            </div>

            {isLoggedIn ? (
              <button
                onClick={() => setIsLoggedIn(false)}
                style={{ background: 'none', border: 'none', color: '#ea4335', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700 }}
              >
                <LogOut size={15} /> Logout
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                style={{ background: '#0099cc', border: 'none', padding: '6px 14px', borderRadius: '10px', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            )}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#0b0e14' }}>
        <div style={{ padding: '16px' }}>

          {/* User Header */}
          <div className="bb10-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              padding: '3px',
              background: currentUser.privacyMode === 'GHOST' ? '#5a6578' : '#0099cc',
              boxShadow: '0 0 20px rgba(0, 153, 204, 0.4)'
            }}>
              <img src={currentUser.avatarUrl} alt={currentUser.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', margin: '12px 0 2px 0', fontSize: '20px', color: '#fff' }}>
              {currentUser.username}
            </h2>
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#8e9aaf', textAlign: 'center' }}>
              {currentUser.bio}
            </p>

            {/* Interest Badges */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
              {currentUser.interests.map(interest => (
                <span key={interest} style={{ fontSize: '10px', color: '#0099cc', background: 'rgba(0, 153, 204, 0.15)', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                  #{interest}
                </span>
              ))}
            </div>

            {/* Status Message */}
            <div style={{ width: '100%', background: 'rgba(0, 153, 204, 0.1)', border: '1px solid rgba(0, 153, 204, 0.25)', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {isEditingStatus ? (
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <input
                    type="text"
                    value={statusInput}
                    onChange={e => setStatusInput(e.target.value)}
                    maxLength={60}
                    style={{ flex: 1, background: '#1c2636', border: 'none', borderRadius: '8px', padding: '6px 10px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                  <button onClick={handleSaveStatus} style={{ background: '#0099cc', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '13px', color: '#0099cc', fontWeight: 700 }}>
                    "{currentUser.statusMessage}"
                  </span>
                  <button onClick={() => setIsEditingStatus(true)} style={{ background: 'none', border: 'none', color: '#8e9aaf', cursor: 'pointer' }}>
                    <Edit3 size={15} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Navigation Cards (Safety Suite & Flash Deals & UI Palette) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <div
              onClick={() => history.push('/safety')}
              className="bb10-card"
              style={{ padding: '12px', cursor: 'pointer', borderLeft: '3px solid #ea4335', textAlign: 'center' }}
            >
              <ShieldAlert size={20} color="#ea4335" style={{ margin: '0 auto 4px auto' }} />
              <h4 style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 700 }}>Safety</h4>
            </div>

            <div
              onClick={() => history.push('/deals')}
              className="bb10-card"
              style={{ padding: '12px', cursor: 'pointer', borderLeft: '3px solid #0099cc', textAlign: 'center' }}
            >
              <Ticket size={20} color="#0099cc" style={{ margin: '0 auto 4px auto' }} />
              <h4 style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 700 }}>Deals</h4>
            </div>

            <div
              onClick={() => history.push('/palette')}
              className="bb10-card"
              style={{ padding: '12px', cursor: 'pointer', borderLeft: '3px solid #0099cc', textAlign: 'center' }}
            >
              <Palette size={20} color="#0099cc" style={{ margin: '0 auto 4px auto' }} />
              <h4 style={{ margin: 0, fontSize: '12px', color: '#fff', fontWeight: 700 }}>UI Palette</h4>
            </div>
          </div>

          {/* Access Requests Quick Card */}
          <div
            onClick={() => setIsAccessRequestsOpen(true)}
            className="bb10-card"
            style={{ padding: '14px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <KeyRound size={18} color="#0099cc" />
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 700 }}>Access Requests</h4>
                <span style={{ fontSize: '11px', color: '#8e9aaf' }}>{pendingRequestsCount} pending requests</span>
              </div>
            </div>
            {pendingRequestsCount > 0 && (
              <span style={{ background: '#ea4335', color: '#fff', fontWeight: 800, padding: '2px 8px', borderRadius: '8px', fontSize: '10px' }}>
                {pendingRequestsCount} NEW
              </span>
            )}
          </div>

          {/* Privacy Mode Selector */}
          <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 12px 0', fontSize: '16px', color: '#fff' }}>
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
                  className="bb10-card"
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #0099cc' : '1px solid rgba(255,255,255,0.12)',
                    background: isSelected ? 'rgba(0, 153, 204, 0.12)' : 'var(--bb10-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', borderRadius: '10px', background: isSelected ? '#0099cc' : '#1c2636', color: isSelected ? '#fff' : '#8e9aaf' }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 700 }}>{item.label}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#8e9aaf' }}>{item.desc}</p>
                    </div>
                  </div>

                  {isSelected && <Check size={18} color="#0099cc" />}
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
