import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent, IonRange, IonButton } from '@ionic/react';
import {
  Radar,
  Radio,
  Zap,
  Shield,
  Ghost,
  Bell,
  Check,
  Flame,
  Volume2,
  MapPin,
  QrCode,
  Layers,
  Sparkles,
  AlertTriangle,
  KeyRound,
  MessageSquare
} from 'lucide-react';

export const ComponentPalettePage: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'buttons' | 'cards' | 'indicators' | 'controls'>('buttons');
  const [sliderVal, setSliderVal] = useState(2.5);
  const [isLedActive, setIsLedActive] = useState(true);

  return (
    <IonPage>
      {/* BB10 Cascades Header */}
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#080a0e', '--border-color': 'rgba(255,255,255,0.12)', padding: '4px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="bb10-led" />
              <h2 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '16px', fontWeight: 800 }}>
                🎨 Component Palette
              </h2>
            </div>
            <span style={{ fontSize: '11px', color: '#0099cc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ahoj UI Kit
            </span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#0b0e14' }}>
        <div style={{ padding: '16px' }}>

          {/* Palette Introduction Header */}
          <div className="bb10-card" style={{ padding: '18px', marginBottom: '20px', borderLeft: '4px solid #0099cc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={18} color="#0099cc" />
              <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 800 }}>
                Original & Distinct BB10 UI Palette
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#8e9aaf', lineHeight: '1.4' }}>
              A signature dark slate component library combining BlackBerry 10 Cascades architecture with neon spatial telemetry cues.
            </p>
          </div>

          {/* Segment Selector Switch */}
          <div style={{ display: 'flex', background: '#141a24', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '20px' }}>
            {(['buttons', 'cards', 'indicators', 'controls'] as const).map(seg => (
              <button
                key={seg}
                onClick={() => setActiveSegment(seg)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeSegment === seg ? '#0099cc' : 'transparent',
                  color: activeSegment === seg ? '#fff' : '#8e9aaf',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  cursor: 'pointer'
                }}
              >
                {seg}
              </button>
            ))}
          </div>

          {/* SECTION 1: BUTTONS & ACTIONS */}
          {activeSegment === 'buttons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#8e9aaf', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Primary Action Buttons
              </h4>

              {/* BB Cyan Primary Button */}
              <button style={{
                width: '100%',
                background: 'var(--grad-ahoj)',
                border: '1px solid #0099cc',
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(0, 153, 204, 0.35)',
                cursor: 'pointer'
              }}>
                <Radar size={18} /> Primary Radar Scan
              </button>

              {/* BB Slate Tactile Button */}
              <button style={{
                width: '100%',
                background: '#141a24',
                backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: '12px',
                padding: '12px',
                color: '#f1f5f9',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <Radio size={18} color="#0099cc" /> Secondary Tactile Action
              </button>

              {/* BB Hub Alert SOS Button */}
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ea4335 0%, #b91c1c 100%)',
                border: '1px solid #ea4335',
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(234, 67, 53, 0.4)',
                cursor: 'pointer'
              }}>
                <AlertTriangle size={18} /> Community Emergency SOS
              </button>

              {/* Pill Action Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                <span style={{ background: 'rgba(0, 153, 204, 0.15)', border: '1px solid #0099cc', color: '#0099cc', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                  ⚡️ #coffee
                </span>
                <span style={{ background: 'rgba(234, 67, 53, 0.15)', border: '1px solid #ea4335', color: '#ea4335', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                  🔥 #sports
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#8e9aaf', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                  👻 #ghost-mode
                </span>
              </div>
            </div>
          )}

          {/* SECTION 2: ACTIVE FRAME CARDS */}
          {activeSegment === 'cards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#8e9aaf', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Cascades Active Frame Cards
              </h4>

              {/* User Profile Active Frame Card */}
              <div className="bb10-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '50%', padding: '2px', background: '#0099cc' }}>
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#fff', fontWeight: 700 }}>alex_cyber</h4>
                      <span style={{ background: '#0099cc', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>VERIFIED</span>
                    </div>
                    <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#0099cc' }}>"Grinding at Bitcoin Coffee ☕️"</p>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0099cc', background: 'rgba(0,153,204,0.1)', padding: '4px 8px', borderRadius: '8px' }}>140m</span>
              </div>

              {/* Spatial Audio Room Card */}
              <div className="bb10-card" style={{ padding: '16px', borderLeft: '4px solid #0099cc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#0099cc', fontWeight: 700 }}>📍 Paralelni Polis / Bitcoin Coffee</span>
                  <span style={{ fontSize: '11px', color: '#ea4335', fontWeight: 800 }}>LIVE AUDIO</span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#fff', fontWeight: 800 }}>
                  Bitcoin Coffee Dev Lounge ☕️
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#8e9aaf' }}>
                  4 speakers active • 18 listeners connected
                </p>
              </div>

              {/* Merchant Flash Voucher Card */}
              <div className="bb10-card" style={{ padding: '16px', borderLeft: '4px solid #ea4335' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ background: '#ea4335', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px' }}>50% OFF</span>
                    <h4 style={{ margin: '6px 0 2px 0', fontSize: '15px', color: '#fff', fontWeight: 700 }}>2-for-1 Speciality Flat White</h4>
                    <span style={{ fontSize: '11px', color: '#8e9aaf' }}>Bitcoin Coffee • Expires in 45m</span>
                  </div>
                  <QrCode size={40} color="#0099cc" />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: INDICATORS & TELEMETRY */}
          {activeSegment === 'indicators' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#8e9aaf', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                BB10 Telemetry & LED Indicators
              </h4>

              <div className="bb10-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="bb10-led" />
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>BlackBerry 10 Alert LED Pulse</span>
                </div>
                <span style={{ fontSize: '11px', color: '#ea4335', fontWeight: 800 }}>ACTIVE</span>
              </div>

              <div className="bb10-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Ghost size={20} color="#8e9aaf" />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 700 }}>Ghost Fuzz Margin</h5>
                    <span style={{ fontSize: '11px', color: '#8e9aaf' }}>Approximate coordinate grid (+300m)</span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#0099cc', fontWeight: 800 }}>300m FUZZ</span>
              </div>

              {/* Sound Wave Audio Visualizer Meter */}
              <div className="bb10-card" style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{ fontSize: '11px', color: '#8e9aaf', fontWeight: 700, display: 'block', marginBottom: '10px' }}>
                  LIVE WEBRTC AUDIO STREAM VISUALIZER
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '28px' }}>
                  {[40, 70, 30, 90, 50, 80, 20, 60, 100, 40, 70, 90].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '4px',
                        height: `${h}%`,
                        background: '#0099cc',
                        borderRadius: '2px',
                        boxShadow: '0 0 8px rgba(0, 153, 204, 0.5)'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CONTROLS & SLIDERS */}
          {activeSegment === 'controls' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#8e9aaf', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Tactile Sliders & Input Controls
              </h4>

              <div className="bb10-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#8e9aaf' }}>PROXIMITY RADIAL RANGE</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0099cc' }}>{sliderVal} km</span>
                </div>
                <IonRange
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={sliderVal}
                  onIonChange={e => setSliderVal(e.detail.value as number)}
                  style={{ '--bar-background': '#1c2636', '--bar-background-active': '#0099cc', '--knob-background': '#0099cc', padding: 0 }}
                />
              </div>

              <div className="bb10-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#8e9aaf', letterSpacing: '0.04em' }}>BLACKBERRY HUB SEARCH INPUT</label>
                <input
                  type="text"
                  placeholder="Search nearby users, sparks & lounges..."
                  style={{
                    width: '100%',
                    background: '#0b0e14',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
};
