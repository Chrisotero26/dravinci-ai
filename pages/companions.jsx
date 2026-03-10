// pages/companions.jsx
import Head from 'next/head';
import { useState } from 'react';
import { characters } from '../data/characters';
import CharacterGrid from '../components/characters/CharacterGrid';

const STYLES = ['All', 'friendly', 'romantic-lite', 'mentor', 'playful', 'humorous'];

export default function CompanionsPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = characters.filter(c => {
    const matchesStyle = filter === 'All' || c.conversationStyle === filter;
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()) || c.tags.some(t => t.includes(search.toLowerCase()));
    return matchesStyle && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>All AI Companions — Dravinci AI</title>
        <meta name="description" content="Browse all 10 Dravinci AI companions. Find your perfect AI friend, mentor, or companion. Free to start." />
        <link rel="canonical" href="https://dravinci.ai/companions" />
      </Head>

      <main className="companions-page">
        <div className="page-inner">
          <h1 className="page-title">Meet All Companions</h1>
          <p className="page-sub">10 unique personalities, always available</p>

          <div className="filters">
            <input
              type="text"
              placeholder="Search by name, country, or style..."
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="style-filters">
              {STYLES.map(s => (
                <button
                  key={s}
                  className={`filter-btn ${filter === s ? 'active' : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {s === 'All' ? 'All' : s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <CharacterGrid characters={filtered} />

          {filtered.length === 0 && (
            <p className="no-results">No companions match your search. Try a different filter.</p>
          )}
        </div>
      </main>

      <style jsx>{`
        .companions-page { padding: 60px 40px; min-height: 100vh; background: #080818; }
        .page-inner { max-width: 1200px; margin: 0 auto; }
        .page-title { font-size: 2.4rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
        .page-sub { color: rgba(255,255,255,0.45); margin-bottom: 36px; }
        .filters { margin-bottom: 36px; display: flex; flex-direction: column; gap: 16px; }
        .search-input {
          max-width: 400px; padding: 12px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; color: #fff; font-size: 0.9rem; outline: none;
        }
        .search-input:focus { border-color: rgba(196,149,74,0.5); }
        .search-input::placeholder { color: rgba(255,255,255,0.3); }
        .style-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .filter-btn {
          padding: 7px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; color: rgba(255,255,255,0.6);
          font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          text-transform: capitalize;
        }
        .filter-btn:hover { border-color: rgba(196,149,74,0.3); color: #fff; }
        .filter-btn.active {
          background: rgba(196,149,74,0.15);
          border-color: rgba(196,149,74,0.5);
          color: #C4954A;
        }
        .no-results { color: rgba(255,255,255,0.4); text-align: center; padding: 60px 0; font-size: 1rem; }
        @media (max-width: 600px) { .companions-page { padding: 40px 20px; } }
      `}</style>
    </>
  );
}
