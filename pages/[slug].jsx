// pages/[slug].jsx
// Dynamic SEO page for each character — e.g., /chat-with-valeria

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { characters, getCharacterBySlug } from '../data/characters';
import { supabase } from '../lib/supabase';
import Header from '../components/layout/Header';
import ChatWindow from '../components/chat/ChatWindow';
import AuthModal from '../components/subscription/AuthModal';
import SubscriptionModal from '../components/subscription/SubscriptionModal';
import CharacterGrid from '../components/characters/CharacterGrid';

export async function getStaticPaths() {
  const paths = characters.map(char => ({ params: { slug: char.slug } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const character = getCharacterBySlug(params.slug);
  if (!character) return { notFound: true };
  const related = characters.filter(c => c.id !== character.id).slice(0, 4);
  return { props: { character, related } };
}

export default function CharacterPage({ character, related }) {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [subOpen, setSubOpen] = useState(false);
  const [subTrigger, setSubTrigger] = useState('upgrade');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUpgradeNeeded = (type) => {
    if (type === 'login') {
      setAuthMode('login');
      setAuthOpen(true);
    } else {
      setSubTrigger(type);
      setSubOpen(true);
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `Chat with ${character.name} - Dravinci AI`,
    "description": character.seoDescription,
    "url": `https://dravinci.ai/${character.slug}`,
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier available"
    },
    "provider": {
      "@type": "Organization",
      "name": "Dravinci AI",
      "url": "https://dravinci.ai"
    }
  };

  return (
    <>
      <Head>
        <title>{character.seoTitle}</title>
        <meta name="description" content={character.seoDescription} />
        <meta name="keywords" content={`AI companion, ${character.name}, ${character.tags.join(', ')}, Dravinci AI, chat AI`} />

        {/* Open Graph */}
        <meta property="og:title" content={character.seoTitle} />
        <meta property="og:description" content={character.seoDescription} />
        <meta property="og:image" content={`https://dravinci.ai${character.ogImage}`} />
        <meta property="og:url" content={`https://dravinci.ai/${character.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Dravinci AI" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={character.seoTitle} />
        <meta name="twitter:description" content={character.seoDescription} />
        <meta name="twitter:image" content={`https://dravinci.ai${character.ogImage}`} />

        {/* Canonical */}
        <link rel="canonical" href={`https://dravinci.ai/${character.slug}`} />

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div className="page-wrapper">
        <Header
          user={user}
          onOpenAuth={openAuth}
          onOpenSubscription={() => handleUpgradeNeeded('upgrade')}
        />

        <main className="chat-page">
          <div className="chat-layout">
            {/* Left sidebar — character info */}
            <aside className="char-sidebar">
              <div className="char-profile-card" style={{ borderColor: `${character.color}44` }}>
                <div className="profile-avatar" style={{ background: `${character.color}22`, borderColor: character.color }}>
                  <span style={{ color: character.color, fontSize: '3rem', fontWeight: 700 }}>
                    {character.name[0]}
                  </span>
                </div>
                <h1 className="profile-name">{character.name}</h1>
                <p className="profile-meta">{character.age} years old · {character.country}</p>

                <div className="trait-list">
                  {character.personality.map(trait => (
                    <span key={trait} className="trait" style={{ color: character.color, borderColor: `${character.color}44` }}>
                      {trait}
                    </span>
                  ))}
                </div>

                <p className="profile-voice">
                  🎙️ Voice: {character.voice.tone}
                </p>
              </div>

              {/* Related characters */}
              <div className="related-section">
                <h3 className="related-title">More Companions</h3>
                <div className="related-list">
                  {related.map(rel => (
                    <a key={rel.id} href={`/${rel.slug}`} className="related-item">
                      <div className="related-dot" style={{ background: rel.color }} />
                      <div>
                        <div className="related-name">{rel.name}</div>
                        <div className="related-country">{rel.country}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </aside>

            {/* Chat window */}
            <div className="chat-main">
              <ChatWindow
                character={character}
                user={user}
                onUpgradeNeeded={handleUpgradeNeeded}
              />
            </div>
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setAuthOpen(false)}
      />

      <SubscriptionModal
        isOpen={subOpen}
        onClose={() => setSubOpen(false)}
        trigger={subTrigger}
      />

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #080818; color: #fff; font-family: 'Segoe UI', system-ui, sans-serif; }
      `}</style>
      <style jsx>{`
        .page-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
        .chat-page {
          flex: 1;
          padding: 24px;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
        }
        .chat-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
          height: calc(100vh - 120px);
        }
        .char-sidebar { display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
        .char-profile-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }
        .profile-avatar {
          width: 90px; height: 90px;
          border-radius: 50%;
          border: 2px solid;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .profile-name { font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .profile-meta { color: rgba(255,255,255,0.45); font-size: 0.82rem; margin-bottom: 16px; }
        .trait-list { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-bottom: 16px; }
        .trait {
          font-size: 0.72rem; padding: 3px 10px;
          border-radius: 20px; border: 1px solid;
          font-weight: 600;
        }
        .profile-voice { font-size: 0.8rem; color: rgba(255,255,255,0.4); }
        .related-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 16px;
        }
        .related-title { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
        .related-list { display: flex; flex-direction: column; gap: 8px; }
        .related-item {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; padding: 8px 10px;
          border-radius: 8px; transition: background 0.2s;
        }
        .related-item:hover { background: rgba(255,255,255,0.04); }
        .related-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .related-name { color: #fff; font-size: 0.875rem; font-weight: 600; }
        .related-country { color: rgba(255,255,255,0.4); font-size: 0.75rem; }
        .chat-main { min-height: 0; }
        @media (max-width: 900px) {
          .chat-layout { grid-template-columns: 1fr; }
          .char-sidebar { display: none; }
        }
      `}</style>
    </>
  );
}
