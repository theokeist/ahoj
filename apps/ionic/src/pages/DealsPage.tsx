import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonContent } from '@ionic/react';
import { useApp } from '../context/AppContext';
import { FlashDealModal } from '../components/FlashDealModal';
import { Ticket, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { FlashDealPublic } from '../services/api';

export const DealsPage: React.FC = () => {
  const { flashDeals, claimDeal } = useApp();
  const [selectedDeal, setSelectedDeal] = useState<FlashDealPublic | null>(null);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#090d16', padding: '0 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--grad-ahoj)', padding: '6px 10px', borderRadius: '12px', color: '#030712', fontWeight: 800 }}>
              🎟️ Flash Deals
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>Nearby Merchant Coupons</span>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ '--background': '#090d16' }}>
        <div style={{ padding: '16px' }}>

          <div className="glass-card" style={{ padding: '16px', marginBottom: '16px', background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(121, 40, 202, 0.15) 100%)' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#fff', fontFamily: 'var(--font-heading)' }}>
              ⚡️ Ahoj Business Partner Flash Deals
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db' }}>
              Exclusive short-duration discounts pushed by verified local cafes, venues, and shops near you.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {flashDeals.map(deal => (
              <div
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className="glass-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  borderLeft: '4px solid #00f2fe'
                }}
              >
                <img src={deal.avatarUrl} alt={deal.businessName} style={{ width: '50px', height: '50px', borderRadius: '14px', objectFit: 'cover' }} />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#00f2fe', fontWeight: 700 }}>{deal.businessName}</span>
                    <span style={{ fontSize: '11px', color: '#ff0080', fontWeight: 800, background: 'rgba(255, 0, 128, 0.15)', padding: '2px 8px', borderRadius: '8px' }}>
                      {deal.discountText}
                    </span>
                  </div>

                  <h4 style={{ margin: '4px 0 2px 0', fontSize: '15px', color: '#fff', fontWeight: 700 }}>
                    {deal.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                    <span>📍 {deal.distanceMeters}m away</span>
                    <span>⏱️ Expires in {deal.expiresInMinutes}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        <FlashDealModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onClaim={(id) => {
            claimDeal(id);
            setSelectedDeal(prev => prev ? { ...prev, isClaimed: true } : null);
          }}
        />
      </IonContent>
    </IonPage>
  );
};
