// components/subscription/SubscriptionModal.jsx
import { useState } from 'react';

const PLANS = [
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: '$9.99',
    period: '/month',
    badge: null,
    features: [
      'Unlimited daily messages',
      'Voice responses (TTS)',
      'All 10+ AI companions',
      'Priority response speed',
      'Conversation memory',
      'Exclusive premium characters'
    ]
  },
  {
    id: 'annual',
    name: 'Premium Annual',
    price: '$6.67',
    period: '/month',
    badge: 'Best Value — Save 33%',
    originalPrice: '$79.99/year',
    features: [
      'Everything in Monthly',
      'Save $40 per year',
      'Early access to new characters',
      'Custom character requests',
      'Priority support',
      'Annual members badge'
    ]
  }
];

export default function SubscriptionModal({ isOpen, onClose, trigger = 'upgrade' }) {
  const [selectedPlan, setSelectedPlan] = useState('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan: selectedPlan })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to create checkout');

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const triggerMessages = {
    upgrade: {
      title: 'Unlock Unlimited Conversations',
      subtitle: "You've reached your daily limit. Upgrade to keep the magic going."
    },
    voice: {
      title: 'Unlock Voice Responses',
      subtitle: 'Hear your AI companion speak with Premium — ElevenLabs powered voices.'
    },
    characters: {
      title: 'Meet All Our Companions',
      subtitle: 'Unlock exclusive Premium characters and unlimited chat time.'
    },
    default: {
      title: 'Upgrade to Premium',
      subtitle: 'The full Dravinci AI experience — unlimited, personal, and unforgettable.'
    }
  };

  const { title, subtitle } = triggerMessages[trigger] || triggerMessages.default;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal-header">
          <div className="modal-star">✦</div>
          <h2 className="modal-title">{title}</h2>
          <p className="modal-subtitle">{subtitle}</p>
        </div>

        <div className="plans-grid">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <span className="price-amount">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              {plan.originalPrice && (
                <div className="price-original">{plan.originalPrice} billed annually</div>
              )}
              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f} className="feature-item">
                    <span className="check">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className={`plan-selector ${selectedPlan === plan.id ? 'active' : ''}`} />
            </div>
          ))}
        </div>

        {error && <p className="modal-error">{error}</p>}

        <button
          className="upgrade-btn"
          onClick={handleUpgrade}
          disabled={isLoading}
        >
          {isLoading ? 'Redirecting...' : `Upgrade to ${selectedPlan === 'annual' ? 'Annual' : 'Monthly'} Premium`}
        </button>

        <p className="modal-legal">
          Cancel anytime. By subscribing you agree to our{' '}
          <a href="/terms" target="_blank">Terms of Service</a>.
          Secure payments via Stripe.
        </p>

        <div className="trust-badges">
          <span>🔒 SSL Secure</span>
          <span>⚡ Instant Access</span>
          <span>↩️ Cancel Anytime</span>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-container {
          background: #0d0d22;
          border: 1px solid rgba(196,149,74,0.3);
          border-radius: 24px;
          padding: 40px;
          max-width: 680px;
          width: 100%;
          position: relative;
          animation: slideUp 0.3s ease;
          max-height: 90vh;
          overflow-y: auto;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-close {
          position: absolute; top: 16px; right: 20px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); font-size: 1.2rem;
          transition: color 0.2s;
        }
        .modal-close:hover { color: #fff; }
        .modal-header { text-align: center; margin-bottom: 32px; }
        .modal-star {
          color: #C4954A; font-size: 2rem; margin-bottom: 12px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .modal-title { color: #fff; font-size: 1.6rem; font-weight: 800; margin: 0 0 8px; }
        .modal-subtitle { color: rgba(255,255,255,0.6); font-size: 0.95rem; margin: 0; line-height: 1.5; }
        .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .plan-card {
          background: rgba(255,255,255,0.03);
          border: 2px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .plan-card:hover { border-color: rgba(196,149,74,0.3); }
        .plan-card.selected {
          border-color: #C4954A;
          background: rgba(196,149,74,0.06);
        }
        .plan-badge {
          position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #08081a; font-size: 0.7rem; font-weight: 800;
          padding: 3px 12px; border-radius: 20px;
          white-space: nowrap; letter-spacing: 0.05em;
        }
        .plan-name { color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-bottom: 8px; font-weight: 600; }
        .plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px; }
        .price-amount { color: #fff; font-size: 1.8rem; font-weight: 800; }
        .price-period { color: rgba(255,255,255,0.4); font-size: 0.85rem; }
        .price-original { color: rgba(255,255,255,0.35); font-size: 0.75rem; margin-bottom: 14px; }
        .plan-features { list-style: none; padding: 0; margin: 12px 0 0; }
        .feature-item { color: rgba(255,255,255,0.7); font-size: 0.82rem; padding: 4px 0; display: flex; gap: 8px; }
        .check { color: #C4954A; font-weight: 800; flex-shrink: 0; }
        .plan-selector {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          margin-top: 14px;
          transition: all 0.2s;
        }
        .plan-selector.active {
          border-color: #C4954A;
          background: #C4954A;
          box-shadow: 0 0 0 3px rgba(196,149,74,0.2);
        }
        .modal-error { color: #ff6b6b; font-size: 0.85rem; text-align: center; margin-bottom: 16px; }
        .upgrade-btn {
          width: 100%; padding: 16px;
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #08081a; font-size: 1rem; font-weight: 800;
          border: none; border-radius: 14px; cursor: pointer;
          transition: all 0.2s; letter-spacing: 0.02em;
          margin-bottom: 16px;
        }
        .upgrade-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(196,149,74,0.4); }
        .upgrade-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .modal-legal { text-align: center; font-size: 0.75rem; color: rgba(255,255,255,0.3); margin: 0 0 16px; }
        .modal-legal a { color: rgba(196,149,74,0.7); }
        .trust-badges {
          display: flex; justify-content: center; gap: 20px;
          font-size: 0.75rem; color: rgba(255,255,255,0.35);
        }
        @media (max-width: 580px) {
          .modal-container { padding: 24px 20px; }
          .plans-grid { grid-template-columns: 1fr; }
          .modal-title { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
}
