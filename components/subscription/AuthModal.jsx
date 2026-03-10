// components/subscription/AuthModal.jsx
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AuthModal({ isOpen, mode = 'login', onClose, onSuccess }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  const validateAge = (dobString) => {
    const dob = new Date(dobString);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (currentMode === 'register') {
        // Age verification
        if (!dob) { setError('Please enter your date of birth.'); setIsLoading(false); return; }
        const age = validateAge(dob);
        if (age < 18) {
          setError('You must be 18 or older to use Dravinci AI. This platform contains mature themes.');
          setIsLoading(false);
          return;
        }
        if (!agreedToTerms) { setError('Please agree to the Terms of Service.'); setIsLoading(false); return; }
        if (!ageVerified) { setError('Please confirm you are 18+.'); setIsLoading(false); return; }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split('@')[0],
              date_of_birth: dob,
              is_verified_adult: true
            }
          }
        });

        if (signUpError) throw signUpError;

        // Create profile
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: email,
            display_name: displayName || email.split('@')[0],
            date_of_birth: dob,
            is_verified_adult: true
          });
        }

        setSuccess('Account created! Check your email to verify, then sign in.');

      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="modal-logo">
          <span className="logo-dra">Dra</span><span className="logo-vinci">vinci</span><span className="logo-ai"> AI</span>
        </div>

        <div className="mode-tabs">
          <button className={`tab ${currentMode === 'login' ? 'active' : ''}`} onClick={() => setCurrentMode('login')}>
            Sign In
          </button>
          <button className={`tab ${currentMode === 'register' ? 'active' : ''}`} onClick={() => setCurrentMode('register')}>
            Create Account
          </button>
        </div>

        {success ? (
          <div className="success-msg">
            <span className="success-icon">✓</span>
            <p>{success}</p>
            <button className="submit-btn" onClick={() => { setSuccess(null); setCurrentMode('login'); }}>
              Sign In
            </button>
          </div>
        ) : (
          <div className="form">
            {currentMode === 'register' && (
              <input
                type="text"
                placeholder="Display name (optional)"
                className="input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              className="input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {currentMode === 'register' && (
              <>
                <div className="dob-field">
                  <label className="field-label">Date of Birth (must be 18+)</label>
                  <input
                    type="date"
                    className="input"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={ageVerified}
                    onChange={e => setAgeVerified(e.target.checked)}
                  />
                  <span>I confirm I am 18 years of age or older</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                  />
                  <span>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a></span>
                </label>
              </>
            )}

            {error && <div className="error-msg">{error}</div>}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isLoading || !email || !password}
            >
              {isLoading
                ? 'Please wait...'
                : currentMode === 'login' ? 'Sign In' : 'Create Account'
              }
            </button>

            {currentMode === 'login' && (
              <a href="/auth/forgot-password" className="forgot-link">Forgot password?</a>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal {
          background: #0d0d22;
          border: 1px solid rgba(196,149,74,0.3);
          border-radius: 24px;
          padding: 40px 36px;
          max-width: 420px;
          width: 100%;
          position: relative;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .close-btn {
          position: absolute; top: 16px; right: 20px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); font-size: 1.1rem;
        }
        .close-btn:hover { color: #fff; }
        .modal-logo {
          text-align: center; margin-bottom: 24px;
          font-size: 1.6rem; font-weight: 800; font-family: Georgia, serif;
        }
        .logo-dra { color: #C4954A; }
        .logo-vinci { color: #fff; }
        .logo-ai { color: #6B8CFF; font-size: 1.1rem; }
        .mode-tabs {
          display: flex; margin-bottom: 24px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px; padding: 4px;
        }
        .tab {
          flex: 1; padding: 10px;
          background: none; border: none;
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem; font-weight: 600;
          cursor: pointer; border-radius: 8px;
          transition: all 0.2s;
        }
        .tab.active { background: rgba(196,149,74,0.15); color: #C4954A; }
        .form { display: flex; flex-direction: column; gap: 12px; }
        .input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fff; font-size: 0.9rem;
          outline: none; width: 100%;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        .input:focus { border-color: rgba(196,149,74,0.5); }
        .input::placeholder { color: rgba(255,255,255,0.3); }
        .field-label { display: block; color: rgba(255,255,255,0.5); font-size: 0.78rem; margin-bottom: 4px; }
        .dob-field { display: flex; flex-direction: column; }
        .checkbox-label {
          display: flex; align-items: flex-start; gap: 10px;
          color: rgba(255,255,255,0.6); font-size: 0.82rem; cursor: pointer;
        }
        .checkbox-label input { margin-top: 2px; accent-color: #C4954A; }
        .checkbox-label a { color: #C4954A; }
        .error-msg {
          background: rgba(255,107,107,0.1);
          border: 1px solid rgba(255,107,107,0.3);
          border-radius: 8px; padding: 10px 14px;
          color: #ff8888; font-size: 0.82rem;
        }
        .success-msg { text-align: center; padding: 20px 0; }
        .success-icon { font-size: 2rem; color: #4DB877; display: block; margin-bottom: 12px; }
        .success-msg p { color: rgba(255,255,255,0.7); margin-bottom: 20px; }
        .submit-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #08081a; font-weight: 800; font-size: 0.95rem;
          border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(196,149,74,0.4); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .forgot-link { display: block; text-align: center; color: rgba(196,149,74,0.7); font-size: 0.82rem; text-decoration: none; }
        .forgot-link:hover { color: #C4954A; }
      `}</style>
    </div>
  );
}
