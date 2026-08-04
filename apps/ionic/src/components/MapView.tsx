import React, { useState } from 'react';
import { UserPublic, SparkPublic, LoungePublic } from '../services/api';
import { MapPin, Shield, Zap, Flame, Radio, Layers, Compass } from 'lucide-react';

interface MapViewProps {
  users: UserPublic[];
  sparks: SparkPublic[];
  lounges: LoungePublic[];
  radiusKm: number;
  onSelectUser: (user: UserPublic) => void;
  onSelectSpark?: (spark: SparkPublic) => void;
  onSelectLounge?: (lounge: LoungePublic) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  users,
  sparks,
  lounges,
  radiusKm,
  onSelectUser,
  onSelectSpark,
  onSelectLounge
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'USERS' | 'SPARK' | 'LOUNGE'>('ALL');

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '380px',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      background: '#0b1120',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
    }}>
      {/* Visual Map Grid Background (Cyber Spatial Grid) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(to right, rgba(0, 242, 254, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 242, 254, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px'
      }} />

      {/* Activity Heatmap Overlay Blobs */}
      {showHeatmap && (
        <>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '30%',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 242, 254, 0.35) 0%, rgba(121, 40, 202, 0.15) 50%, transparent 80%)',
            filter: 'blur(16px)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '20%',
            right: '25%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 0, 128, 0.35) 0%, transparent 80%)',
            filter: 'blur(16px)',
            pointerEvents: 'none'
          }} />
        </>
      )}

      {/* Concentric Distance Rings */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '280px', height: '280px', borderRadius: '50%', border: '1px dashed rgba(255, 255, 255, 0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(0, 242, 254, 0.15)', pointerEvents: 'none' }} />

      {/* Map Control Bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 30
      }}>
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(12px)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['ALL', 'USERS', 'SPARK', 'LOUNGE'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                background: filterType === type ? 'var(--grad-ahoj)' : 'transparent',
                border: 'none',
                color: filterType === type ? '#030712' : '#9ca3af',
                fontSize: '10px',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '10px',
                cursor: 'pointer'
              }}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: showHeatmap ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            color: showHeatmap ? '#00f2fe' : '#9ca3af',
            fontSize: '11px',
            fontWeight: 700,
            padding: '6px 10px',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          <Layers size={12} /> Heatmap {showHeatmap ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Center Pin (User Self Position) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--grad-ahoj)',
          padding: '3px',
          boxShadow: '0 0 24px #00f2fe'
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>
            <Compass size={16} />
          </div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#00f2fe', marginTop: '2px', background: 'rgba(0,0,0,0.7)', padding: '1px 6px', borderRadius: '6px' }}>YOU</span>
      </div>

      {/* User Avatar Pins */}
      {(filterType === 'ALL' || filterType === 'USERS') && users.map((user, idx) => {
        const angle = (idx * (360 / users.length) - 30) * (Math.PI / 180);
        const normDistance = Math.min(user.distanceMeters / (radiusKm * 1000), 0.9);
        const radiusPx = 50 + normDistance * 110;
        const x = Math.cos(angle) * radiusPx;
        const y = Math.sin(angle) * radiusPx;

        return (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              zIndex: 20,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              padding: '2px',
              background: user.privacyMode === 'GHOST' ? '#6b7280' : 'var(--grad-ahoj)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              <img src={user.avatarUrl} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '10px', color: '#fff', fontWeight: 700, background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '8px', marginTop: '2px', whiteSpace: 'nowrap' }}>
              {user.username} ({user.distanceMeters}m)
            </span>
          </div>
        );
      })}

      {/* Sparks Pins */}
      {(filterType === 'ALL' || filterType === 'SPARK') && sparks.slice(0, 3).map((spark, idx) => {
        const angle = (idx * 110 + 45) * (Math.PI / 180);
        const radiusPx = 80 + idx * 30;
        const x = Math.cos(angle) * radiusPx;
        const y = Math.sin(angle) * radiusPx;

        return (
          <div
            key={spark.id}
            onClick={() => onSelectSpark && onSelectSpark(spark)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              zIndex: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 0, 128, 0.9)',
              padding: '4px 8px',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 800,
              boxShadow: '0 0 16px rgba(255, 0, 128, 0.6)'
            }}
          >
            <Flame size={12} /> {spark.title.slice(0, 15)}...
          </div>
        );
      })}

      {/* Lounges Pins */}
      {(filterType === 'ALL' || filterType === 'LOUNGE') && lounges.slice(0, 2).map((lounge, idx) => {
        const angle = (idx * -120 - 60) * (Math.PI / 180);
        const radiusPx = 100;
        const x = Math.cos(angle) * radiusPx;
        const y = Math.sin(angle) * radiusPx;

        return (
          <div
            key={lounge.id}
            onClick={() => onSelectLounge && onSelectLounge(lounge)}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              zIndex: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 242, 254, 0.9)',
              padding: '4px 8px',
              borderRadius: '12px',
              color: '#030712',
              fontSize: '10px',
              fontWeight: 800,
              boxShadow: '0 0 16px rgba(0, 242, 254, 0.6)'
            }}
          >
            <Radio size={12} /> {lounge.venueName.slice(0, 14)}
          </div>
        );
      })}

      {/* Footer Info */}
      <div style={{ position: 'absolute', bottom: '10px', left: '12px', fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <MapPin size={12} color="#00f2fe" /> Active Spatial Grid ({radiusKm} km radius)
      </div>
    </div>
  );
};
