// components/layout/Header.jsx
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function Header({ user, onOpenAuth, onOpenSubscription }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="dravinci-header">
      <div className="header-inner">

        {/* ===== LOGO PLACEHOLDER ===== */}
        {/* Replace the <div className="logo-placeholder"> below with:
            <Link href="/">
              <Image src="/images/dravinci-logo.png" alt="Dravinci AI" width={160} height={50} />
            </Link>
        */}
        <Link href="/" className="logo-link">
          <div className="logo-placeholder">
            {/* INSERT LOGO HERE */}
            <Image
              src="/images/dravinci-logo.png"
              alt="Dravinci AI"
              width={200}
              height={80}
              style={{ objectFit: 'contain' }}
              priority
              onError={(e) => {
                // Fallback text logo if image not found
                e.target.style.display = 'none';
              }}
            />
            <span className="logo-text-fallback">
              <span className="logo-dra">Dra</span>
              <span className="logo-vinci">vinci</span>
              <span className="logo-ai"> AI</span>
            </span>
          </div>
        </Link>
        {/* ===== END LOGO PLACEHOLDER ===== */}

        <nav className="header-nav desktop-only">
          <Link href="/companions" className={router.pathname.startsWith('/companions') ? 'nav-link active' : 'nav-link'}>
            Compañeros
          </Link>
          <Link href="/about" className="nav-link">Sobre Nosotros</Link>
          <Link href="/pricing" className="nav-link">Precios</Link>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <Link href="/companions" className="btn btn-ghost desktop-only">
                My Companions
              </Link>
              {user.subscription_status !== 'premium' && (
                <button onClick={onOpenSubscription} className="btn btn-premium">
                  ✦ Go Premium
                </button>
              )}
              <div className="user-menu">
                <button
                  className="user-avatar-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>
                {menuOpen && (
                  <div className="dropdown-menu">
                    <Link href="/profile" className="dropdown-item">Profile</Link>
                    <Link href="/subscription" className="dropdown-item">Subscription</Link>
                    <hr className="dropdown-divider" />
                    <button onClick={handleSignOut} className="dropdown-item danger">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => onOpenAuth('login')} className="btn btn-ghost">
                Sign In
              </button>
              <button onClick={() => onOpenAuth('register')} className="btn btn-gold">
                Get Started
              </button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-btn mobile-only"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="mobile-nav">
          <Link href="/companions" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            Companions
          </Link>
          <Link href="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            About
          </Link>
          <Link href="/pricing" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            Pricing
          </Link>
          {!user && (
            <>
              <button onClick={() => { onOpenAuth('login'); setMenuOpen(false); }} className="mobile-nav-link">
                Sign In
              </button>
              <button onClick={() => { onOpenAuth('register'); setMenuOpen(false); }} className="mobile-nav-btn-gold">
                Get Started Free
              </button>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .dravinci-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(8, 8, 20, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(196, 149, 74, 0.2);
        }
        .header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .logo-link { text-decoration: none; }
        .logo-placeholder {
          display: flex;
          align-items: center;
          position: relative;
          min-width: 200px;
          height: 80px;
        }
        .logo-text-fallback {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .logo-dra { color: #C4954A; }
        .logo-vinci { color: #fff; }
        .logo-ai { color: #6B8CFF; font-size: 1rem; }
        .header-nav { display: flex; gap: 8px; align-items: center; }
        .nav-link {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .nav-link:hover, .nav-link.active {
          color: #fff;
          background: rgba(196,149,74,0.1);
        }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .btn {
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
        }
        .btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.8);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .btn-gold {
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #08081a;
        }
        .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(196,149,74,0.4); }
        .btn-premium {
          background: linear-gradient(135deg, #6B8CFF, #9B59B6);
          color: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          letter-spacing: 0.05em;
        }
        .btn-premium:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(107,140,255,0.4); }
        .user-menu { position: relative; }
        .user-avatar-btn { background: none; border: none; cursor: pointer; padding: 0; }
        .user-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #C4954A, #6B8CFF);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.9rem;
        }
        .dropdown-menu {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: #0f0f24;
          border: 1px solid rgba(196,149,74,0.3);
          border-radius: 12px;
          padding: 8px;
          min-width: 160px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .dropdown-item {
          display: block; width: 100%;
          padding: 10px 14px;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          font-size: 0.875rem;
          border-radius: 8px;
          border: none; background: none;
          cursor: pointer; text-align: left;
          transition: all 0.15s;
        }
        .dropdown-item:hover { background: rgba(196,149,74,0.1); color: #fff; }
        .dropdown-item.danger { color: #ff6b6b; }
        .dropdown-divider { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 4px 0; }
        .desktop-only { display: flex; }
        .mobile-only { display: none; }
        .mobile-nav {
          padding: 12px 24px 20px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .mobile-nav-link {
          padding: 12px 16px;
          color: rgba(255,255,255,0.8);
          text-decoration: none; font-size: 1rem;
          border-radius: 8px; border: none; background: none;
          cursor: pointer; text-align: left;
        }
        .mobile-nav-btn-gold {
          padding: 14px 20px; margin-top: 8px;
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #08081a; font-weight: 700; font-size: 1rem;
          border-radius: 10px; border: none; cursor: pointer;
        }
        .hamburger {
          display: block; width: 24px; height: 2px;
          background: #fff; position: relative; transition: all 0.3s;
        }
        .hamburger::before, .hamburger::after {
          content: ''; position: absolute;
          width: 24px; height: 2px; background: #fff; transition: all 0.3s;
        }
        .hamburger::before { top: -8px; }
        .hamburger::after { top: 8px; }
        .mobile-menu-btn { background: none; border: none; cursor: pointer; padding: 8px; }
        @media (max-width: 768px) {
          .desktop-only { display: none; }
          .mobile-only { display: flex; }
        }
      `}</style>
    </header>
  );
}
