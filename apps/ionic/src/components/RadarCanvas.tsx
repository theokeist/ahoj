import React from 'react';
import { UserPublic } from '../services/api';
import { Shield, Eye, Ghost, MapPin, Zap } from 'lucide-react';

interface RadarCanvasProps {
  users: UserPublic[];
  radiusKm: number;
  onSelectUser: (user: UserPublic) => void;
}

export const RadarCanvas: React.FC<RadarCanvasProps> = ({ users, radiusKm, onSelectUser }) => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '320px',
      background: 'radial-gradient(circle at center, #111827 0%, #090d16 100%)',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 0 40px rgba(0, 242, 254, 0.05)'
    }}>
      {/* Concentric Radar Rings */}
      <div style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', border: '1px dashed rgba(0, 242, 254, 0.15)' }} />
      <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(0, 242, 254, 0.2)' }} />
      <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(0, 242, 254, 0.25)' }} />

      {/* Pulsing Radar Wave */}
      <div className="pulse-ring" style={{ width: '220px', height: '220px' }} />
      <div className="pulse-ring pulse-ring-delayed" style={{ width: '220px', height: '220px' }} />

      {/* Crosshair Axes */}
      <div style={{ position: 'absolute', width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 242, 254, 0.2), transparent)' }} />
      <div style={{ position: 'absolute', height: '100%', width: '1px', background: 'linear-gradient(180deg, transparent, rgba(0, 242, 254, 0.2), transparent)' }} />

      {/* Center Pin (Self) */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'var(--grad-ahoj)',
        padding: '3px',
        boxShadow: '0 0 20px #00f2fe'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: '#090d16',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00f2fe'
        }}>
          <Zap size={14} />
        </div>
      </div>

      {/* Nearby Users Pins on Radar */}
      {users.map((user, idx) => {
        // Calculate position based on index & distance
        const angle = (idx * (360 / users.length) - 45) * (Math.PI / 180);
        const normDistance = Math.min(user.distanceMeters / (radiusKm * 1000), 0.95);
        const radiusPx = 40 + normDistance * 90; // max radius inside 260px container
        const x = Math.cos(angle) * radiusPx;
        const y = Math.sin(angle) * radiusPx;

        const isGhost = user.privacyMode === 'GHOST';

        return (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              position: 'absolute',
              transform: `translate(${x}px, ${y}px)`,
              zIndex: 20,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* User Avatar Pin */}
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              padding: '2px',
              background: user.hasActiveStories ? 'var(--grad-spark)' : isGhost ? '#6b7280' : 'var(--grad-ahoj)',
              boxShadow: isGhost ? '0 0 10px rgba(107, 114, 128, 0.5)' : '0 0 14px rgba(0, 242, 254, 0.4)'
            }}>
              <img
                src={user.avatarUrl}
                alt={user.username}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
            {/* Label */}
            <div style={{
              marginTop: '4px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              padding: '2px 8px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '11px',
              fontWeight: 600,
              color: '#f3f4f6',
              whiteSpace: 'nowrap'
            }}>
              {user.username} • {user.distanceMeters}m
            </div>
          </div>
        );
      })}

      {/* Radar Overlay Badge */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        background: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(10px)',
        padding: '4px 12px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '12px',
        color: '#9ca3af',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <MapPin size={12} color="#00f2fe" /> Radius: <strong style={{ color: '#00f2fe' }}>{radiusKm} km</strong>
      </div>
    </div>
  );
};
