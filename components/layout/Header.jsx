// components/layout/Header.jsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { translations } from '../../data/translations';

export default function Header({ user, onOpenAuth, onOpenSubscription }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState('es');
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem('dravinci_lang') || 'es';
    setLang(savedLang);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'es' ? 'en' : 'es';
    setLang(newLang);
    localStorage.setItem('dravinci_lang', newLang);
    router.reload();
  };

  const t = translations[lang].nav;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="dravinci-header">
      <div className="header-inner">
        <Link href="/" className="logo-link">
          <div className="logo-placeholder">
            <Image
              src="/images/dravinci-logo.png"
              alt="Dravinci AI"
              width={200}
              height={80}
              style={{ objectFit: 'contain' }}
              priority
              onError={(e) => {
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

        <nav className="header-nav desktop-only">
          <Link href="/companions" className={router.pathname.startsWith('/companions') ? 'nav-link active' : 'nav-link'}>
            {t.companions}
          </Link>
          <Link href="/about" className="nav-link">{t.about}</Link>
          <Link href="/pricing" className="nav-link">{t.pricing}</Link>
        </nav>

        <div className="header-actions">
          <button onClick={toggleLang} className="lang-toggle-btn">
            {lang === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
          </button>

          {user ? (
            <>
              <Link href="/companions" className="btn btn-ghost desktop-only">
                {t.myCompanions}
              </Link>
              {user.subscription_status !== 'premium' && (
                <button onClick={onOpenSubscription} className="btn btn-premium">
                  {t.goPremium}
                </button>
              )}
              <div className="user-menu">
                <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  <div className="user-avatar">{user.email?.[0]?.toUpperCase() || 'U'}</div>
                </button>
                {menuOpen && (
                  <div className="dropdown-menu">
                    <Link href="/profile" className="dropdown-item">Profile</Link>
                    <button onClick={handleSignOut} className="dropdown-item danger">Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => onOpenAuth('login')} className="btn btn-ghost">{t.signIn}</button>
              <button onClick={() => onOpenAuth('register')} className="btn btn-gold">{t.getStarted}</button>
            </>
          )}

          <button className="mobile-menu-btn mobile-only" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`hamburger ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .dravinci-header {
          position: sticky; top: 0; z-index: 100;
          background: rgba(8, 8, 20, 0.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(196, 149, 74, 0.2);
        }
        .header-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 24px;
          height: 80px; display: flex; align-items: center;
          justify-content: space-between; gap: 24px;
        }
        .logo-placeholder { display: flex; align-items: center; min-width: 200px; height: 80px; }
        .logo-text-fallback { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; }
        .logo-dra { color: #C4954A; } .logo-vinci { color: #fff; } .logo-ai { color: #6B8CFF; font-size: 1rem; }
        .header-nav { display: flex; gap: 8px; align-items: center; }
        .nav-link { color: rgba(255,255,255,0.7); text-decoration: none; padding: 8px 16px; border-radius: 8px; font-size: 0.9rem; transition: all 0.2s; }
        .nav-link:hover, .nav-link.active { color: #fff; background: rgba(196,149,74,0.1); }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .lang-toggle-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
        .lang-toggle-btn:hover { background: rgba(255,255,255,0.1); }
        .btn { padding: 8px 20px; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; }
        .btn-ghost { background: transparent; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.2); }
        .btn-gold { background: linear-gradient(135deg, #C4954A, #E5B86A); color: #08081a; }
        .btn-premium { background: linear-gradient(135deg, #6B8CFF, #9B59B6); color: #fff; }
        .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, #C4954A, #6B8CFF); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; }
        .dropdown-menu { position: absolute; right: 0; top: calc(100% + 8px); background: #0f0f24; border: 1px solid rgba(196,149,74,0.3); border-radius: 12px; padding: 8px; min-width: 160px; }
        .dropdown-item { display: block; width: 100%; padding: 10px 14px; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 0.875rem; border-radius: 8px; border: none; background: none; cursor: pointer; text-align: left; }
        .dropdown-item:hover { background: rgba(196,149,74,0.1); color: #fff; }
        .desktop-only { display: flex; } .mobile-only { display: none; }
        @media (max-width: 768px) { .desktop-only { display: none; } .mobile-only { display: flex; } }
      `}</style>
    </header>
  );
}
