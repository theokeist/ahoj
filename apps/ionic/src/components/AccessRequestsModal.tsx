import React from 'react';
import { IonModal, IonContent } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { Shield, Check, X, User } from 'lucide-react';

export const AccessRequestsModal: React.FC = () => {
  const { isAccessRequestsOpen, setIsAccessRequestsOpen, accessRequests, approveAccessRequest, denyAccessRequest } = useApp();

  if (!isAccessRequestsOpen) return null;

  return (
    <IonModal isOpen={isAccessRequestsOpen} onDidDismiss={() => setIsAccessRequestsOpen(false)}>
      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '24px 16px', minHeight: '100%' }}>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '6px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe' }}>
                <Shield size={20} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: 0, fontSize: '20px' }}>
                Access Requests
              </h2>
            </div>
            <button onClick={() => setIsAccessRequestsOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: 0, marginBottom: '20px' }}>
            Users requesting permission to view your un-fuzzed location and private profile details.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {accessRequests.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: '14px' }}>
                No pending access requests
              </div>
            ) : (
              accessRequests.map(req => (
                <div key={req.id} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={req.user.avatarUrl} alt={req.user.username} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 700 }}>{req.user.username}</h4>
                      <span style={{ fontSize: '12px', color: '#00f2fe' }}>{req.user.distanceMeters}m away • {req.createdAt}</span>
                    </div>
                  </div>

                  {req.status === 'PENDING' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => approveAccessRequest(req.id)}
                        style={{ background: 'var(--grad-ahoj)', border: 'none', borderRadius: '10px', padding: '8px 12px', color: '#030712', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        onClick={() => denyAccessRequest(req.id)}
                        style={{ background: '#374151', border: 'none', borderRadius: '10px', padding: '8px 10px', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        <X size={14} /> Deny
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: req.status === 'APPROVED' ? '#10b981' : '#ef4444' }}>
                      {req.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </IonContent>
    </IonModal>
  );
};
