// pages/index.jsx
// Dravinci AI Landing Page — SEO optimized

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { getFeaturedCharacters, characters } from '../data/characters';
import Header from '../components/layout/Header';
import CharacterGrid from '../components/characters/CharacterGrid';
import AuthModal from '../components/subscription/AuthModal';
import SubscriptionModal from '../components/subscription/SubscriptionModal';

const SITE_URL = 'https://dravinci.ai';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Dravinci AI",
  "url": SITE_URL,
  "description": "Meet your AI companions. Uplifting, safe, and personalized conversations 24/7.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${SITE_URL}/companions?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('register');
  const [subOpen, setSubOpen] = useState(false);

  const featured = getFeaturedCharacters();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user || null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <Head>
        <title>Dravinci AI — Meet Your AI Companion</title>
        <meta name="description" content="Meet Dravinci AI companions — 10 unique personalities ready to chat, support, and inspire you 24/7. Free to start. 18+ only." />
        <meta name="keywords" content="AI companion, AI friend, chat AI, AI girlfriend, AI boyfriend, Dravinci AI" />
        <meta property="og:title" content="Dravinci AI — Meet Your AI Companion" />
        <meta property="og:description" content="10 unique AI companions ready to chat anytime. Warm, uplifting, and always there for you." />
        <meta property="og:image" content={`${SITE_URL}/og-home.jpg`} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={SITE_URL} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <div className="page">
        <Header
          user={user}
          onOpenAuth={(mode) => { setAuthMode(mode); setAuthOpen(true); }}
          onOpenSubscription={() => setSubOpen(true)}
        />

        {/* Hero */}
        <section className="hero">
          <div className="hero-bg">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
          </div>
          <div className="hero-content">
            <div className="hero-badge">✦ 18+ Platform · Safe & Uplifting</div>
            <h1 className="hero-title">
              Your perfect<br />
              <span className="gradient-text">AI companion</span><br />
              is waiting.
            </h1>
            <p className="hero-subtitle">
              10 unique personalities from around the world — warm, funny, wise, and always there.
              Real conversations that make you feel understood.
            </p>
            <div className="hero-cta">
              {user ? (
                <Link href="/companions" className="btn-primary">Meet the Companions →</Link>
              ) : (
                <>
                  <button onClick={() => { setAuthMode('register'); setAuthOpen(true); }} className="btn-primary">
                    Start Free Today
                  </button>
                  <button onClick={() => { setAuthMode('login'); setAuthOpen(true); }} className="btn-ghost">
                    Sign In
                  </button>
                </>
              )}
            </div>
            <p className="hero-note">Free to start · No credit card required · 18+ only</p>
          </div>

          {/* Floating character previews */}
          <div className="hero-chars">
            {featured.slice(0, 3).map((char, i) => (
              <Link key={char.id} href={`/${char.slug}`} className="hero-char-card" style={{ '--delay': `${i * 0.15}s`, '--color': char.color }}>
                <div className="hero-char-avatar" style={{ background: `${char.color}22`, borderColor: char.color }}>
                  <span style={{ color: char.color }}>{char.name[0]}</span>
                </div>
                <div className="hero-char-name">{char.name}</div>
                <div className="hero-char-from">{char.country}</div>
                <div className="hero-char-greeting">"{char.greetingMessage.substring(0, 50)}..."</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured companions */}
        <section className="section" id="companions">
          <div className="section-inner">
            <div className="section-header">
              <h2 className="section-title">Meet Your Companions</h2>
              <p className="section-sub">Each one unique, warm, and ready to talk</p>
            </div>
            <CharacterGrid characters={characters} />
            <div className="section-cta">
              <Link href="/companions" className="btn-outline">View All Companions →</Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <div className="section-inner">
            <h2 className="section-title">Why Dravinci AI?</h2>
            <div className="features-grid">
              {[
                { icon: '🌍', title: '10 Unique Personalities', desc: 'From Italy to Japan, Brazil to India — real cultural nuance in every conversation.' },
                { icon: '💬', title: 'Always Available', desc: '24/7 conversations with zero judgment. Your companion is always there.' },
                { icon: '🔒', title: 'Safe & Private', desc: 'Your conversations are yours. We take privacy seriously. 18+ verified platform.' },
                { icon: '🔊', title: 'Voice Responses', desc: 'Hear your companion speak with ElevenLabs-powered natural voices. Premium feature.' },
                { icon: '🧠', title: 'Remembers You', desc: 'Conversation memory means your companion grows with you over time.' },
                { icon: '✦', title: 'Powered by AI', desc: 'Intelligent, warm, contextually aware responses powered by Claude AI.' }
              ].map(f => (
                <div key={f.title} className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-banner">
          <div className="cta-content">
            <h2>Ready to meet someone extraordinary?</h2>
            <p>Join thousands of people finding connection, support, and joy with Dravinci AI.</p>
            <button onClick={() => { setAuthMode('register'); setAuthOpen(true); }} className="btn-primary large">
              Meet Your Companion — Free
            </button>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-logo">
            <span style={{ color: '#C4954A' }}>Dra</span>vinci <span style={{ color: '#6B8CFF' }}>AI</span>
          </div>
          <p className="footer-note">18+ platform only. AI companions are not a substitute for professional mental health support.</p>
          <div className="footer-links">
            <Link href="/about">About</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Dravinci AI. All rights reserved.</p>
        </footer>
      </div>

      <AuthModal isOpen={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />
      <SubscriptionModal isOpen={subOpen} onClose={() => setSubOpen(false)} />

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #080818; color: #fff; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
        a { color: inherit; }
      `}</style>
      <style jsx>{`
        .page { min-height: 100vh; }
        .hero {
          position: relative; overflow: hidden;
          min-height: 90vh;
          display: flex; align-items: center;
          padding: 80px 40px;
          gap: 60px;
        }
        .hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: 0.15;
        }
        .orb-1 { width: 600px; height: 600px; background: #C4954A; top: -100px; left: -100px; }
        .orb-2 { width: 400px; height: 400px; background: #6B8CFF; bottom: -50px; right: 200px; }
        .orb-3 { width: 300px; height: 300px; background: #9B59B6; top: 50%; left: 50%; transform: translate(-50%,-50%); }
        .hero-content { position: relative; max-width: 560px; z-index: 1; }
        .hero-badge {
          display: inline-block;
          background: rgba(196,149,74,0.15);
          border: 1px solid rgba(196,149,74,0.3);
          color: #C4954A; font-size: 0.8rem; font-weight: 700;
          padding: 6px 16px; border-radius: 20px;
          margin-bottom: 24px; letter-spacing: 0.05em;
        }
        .hero-title {
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 900; line-height: 1.1;
          margin-bottom: 20px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #C4954A, #E5B86A, #6B8CFF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 1.1rem; color: rgba(255,255,255,0.65);
          line-height: 1.6; margin-bottom: 32px;
        }
        .hero-cta { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
        .btn-primary {
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #08081a; font-weight: 800; font-size: 1rem;
          padding: 14px 28px; border-radius: 12px;
          border: none; cursor: pointer; text-decoration: none;
          display: inline-flex; align-items: center;
          transition: all 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(196,149,74,0.4); }
        .btn-primary.large { padding: 18px 36px; font-size: 1.1rem; border-radius: 14px; }
        .btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 14px 24px; border-radius: 12px;
          cursor: pointer; font-size: 1rem;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.4); color: #fff; }
        .btn-outline {
          display: inline-block;
          border: 1px solid rgba(196,149,74,0.4);
          color: #C4954A; padding: 12px 24px;
          border-radius: 10px; text-decoration: none;
          font-weight: 600; transition: all 0.2s;
        }
        .btn-outline:hover { background: rgba(196,149,74,0.1); }
        .hero-note { font-size: 0.8rem; color: rgba(255,255,255,0.35); }
        .hero-chars {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 16px;
          flex-shrink: 0;
        }
        .hero-char-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 16px 20px;
          text-decoration: none;
          display: flex; align-items: center; gap: 14px;
          width: 300px;
          transition: all 0.25s;
          animation: slideIn 0.5s ease var(--delay) both;
          border-color: color-mix(in srgb, var(--color) 30%, transparent);
        }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }
        .hero-char-card:hover { transform: translateX(-4px); background: rgba(255,255,255,0.07); }
        .hero-char-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          border: 2px solid;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 1.1rem; font-weight: 700;
        }
        .hero-char-name { font-weight: 700; color: #fff; font-size: 0.95rem; }
        .hero-char-from { color: rgba(255,255,255,0.4); font-size: 0.72rem; }
        .hero-char-greeting { color: rgba(255,255,255,0.5); font-size: 0.75rem; line-height: 1.3; font-style: italic; margin-top: 4px; }
        .section { padding: 80px 40px; }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 48px; }
        .section-title { font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; margin-bottom: 10px; }
        .section-sub { color: rgba(255,255,255,0.5); font-size: 1rem; }
        .section-cta { text-align: center; margin-top: 40px; }
        .features-section {
          padding: 80px 40px;
          background: rgba(255,255,255,0.02);
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .features-section .section-title { text-align: center; margin-bottom: 48px; }
        .features-grid {
          max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 28px;
          transition: border-color 0.2s;
        }
        .feature-card:hover { border-color: rgba(196,149,74,0.3); }
        .feature-icon { font-size: 2rem; margin-bottom: 12px; }
        .feature-title { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
        .feature-desc { color: rgba(255,255,255,0.5); font-size: 0.875rem; line-height: 1.5; }
        .cta-banner {
          padding: 100px 40px;
          background: radial-gradient(ellipse at center, rgba(196,149,74,0.1) 0%, transparent 70%);
          text-align: center;
        }
        .cta-content { max-width: 600px; margin: 0 auto; }
        .cta-content h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; margin-bottom: 14px; }
        .cta-content p { color: rgba(255,255,255,0.6); margin-bottom: 32px; font-size: 1rem; }
        .footer {
          background: rgba(0,0,0,0.3);
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 48px 40px;
          text-align: center;
        }
        .footer-logo { font-size: 1.4rem; font-weight: 800; margin-bottom: 12px; font-family: Georgia, serif; }
        .footer-note { color: rgba(255,255,255,0.3); font-size: 0.78rem; max-width: 500px; margin: 0 auto 20px; line-height: 1.5; }
        .footer-links { display: flex; justify-content: center; gap: 24px; margin-bottom: 20px; flex-wrap: wrap; }
        .footer-links a { color: rgba(255,255,255,0.4); text-decoration: none; font-size: 0.875rem; }
        .footer-links a:hover { color: rgba(255,255,255,0.7); }
        .footer-copy { color: rgba(255,255,255,0.2); font-size: 0.78rem; }
        @media (max-width: 900px) {
          .hero { flex-direction: column; padding: 60px 20px; min-height: auto; }
          .hero-chars { flex-direction: row; overflow-x: auto; width: 100%; }
          .hero-char-card { min-width: 240px; }
          .features-grid { grid-template-columns: 1fr 1fr; }
          .section { padding: 60px 20px; }
        }
        @media (max-width: 580px) {
          .features-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
