import React, { useState } from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import { Zap, Mail, Lock, User, Shield, ArrowRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, setIsLoggedIn } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('martasko14@example.com');
  const [password, setPassword] = useState('password123');
  const [username, setUsername] = useState('martasko14');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setIsAuthModalOpen(false);
  };

  return (
    <IonModal isOpen={isAuthModalOpen} onDidDismiss={() => setIsAuthModalOpen(false)}>
      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '32px 24px', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
            <button onClick={() => setIsAuthModalOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '16px',
              borderRadius: '24px',
              background: 'var(--grad-ahoj)',
              color: '#030712',
              marginBottom: '16px',
              boxShadow: '0 0 30px rgba(0, 242, 254, 0.4)'
            }}>
              <Zap size={36} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: '#fff', margin: '0 0 8px 0' }}>/A\ ahoj</h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Next-Gen Proximity Social Network</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>USERNAME</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '14px',
                      padding: '12px 14px 12px 44px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '12px 14px 12px 44px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#9ca3af', marginBottom: '6px' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    padding: '12px 14px 12px 44px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <IonButton
              type="submit"
              expand="block"
              shape="round"
              style={{ marginTop: '8px', '--background': 'var(--grad-ahoj)', color: '#030712', height: '48px', fontWeight: 700 }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
              </span>
            </IonButton>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: '#00f2fe', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }}
            >
              {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
