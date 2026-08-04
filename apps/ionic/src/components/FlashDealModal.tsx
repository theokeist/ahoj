import React from 'react';
import { IonModal, IonContent, IonButton } from '@ionic/react';
import { FlashDealPublic } from '../services/api';
import { Ticket, MapPin, Clock, X, CheckCircle2, QrCode } from 'lucide-react';

interface FlashDealModalProps {
  deal: FlashDealPublic | null;
  onClose: () => void;
  onClaim: (dealId: string) => void;
}

export const FlashDealModal: React.FC<FlashDealModalProps> = ({ deal, onClose, onClaim }) => {
  if (!deal) return null;

  return (
    <IonModal isOpen={!!deal} onDidDismiss={onClose}>
      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '24px 16px', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          {/* Deal Voucher Card */}
          <div className="glass-card" style={{ width: '100%', padding: '24px', textAlign: 'center', position: 'relative', border: '1px solid #00f2fe' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 16px auto',
              overflow: 'hidden',
              border: '2px solid #00f2fe'
            }}>
              <img src={deal.avatarUrl} alt={deal.businessName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <span style={{ background: 'var(--grad-ahoj)', color: '#030712', fontWeight: 800, padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
              {deal.discountText}
            </span>

            <h2 style={{ fontFamily: 'var(--font-heading)', color: '#fff', margin: '14px 0 6px 0', fontSize: '20px' }}>
              {deal.title}
            </h2>

            <p style={{ fontSize: '13px', color: '#00f2fe', fontWeight: 600, margin: '0 0 16px 0' }}>
              📍 {deal.businessName} ({deal.distanceMeters}m away)
            </p>

            {/* QR / Barcode Display */}
            <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', margin: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <QrCode size={120} color="#030712" />
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#030712', marginTop: '8px', letterSpacing: '2px' }}>
                {deal.code}
              </span>
            </div>

            <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
              {deal.terms}
            </p>
          </div>

          <div style={{ marginTop: '20px', width: '100%' }}>
            {deal.isClaimed ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '12px', borderRadius: '14px', textAlign: 'center', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} /> Voucher Saved to Profile Wallet
              </div>
            ) : (
              <IonButton
                onClick={() => onClaim(deal.id)}
                expand="block"
                shape="round"
                style={{ '--background': 'var(--grad-ahoj)', color: '#030712', height: '48px', fontWeight: 700 }}
              >
                Claim Flash Voucher Now 🎟️
              </IonButton>
            )}
          </div>

        </div>
      </IonContent>
    </IonModal>
  );
};
