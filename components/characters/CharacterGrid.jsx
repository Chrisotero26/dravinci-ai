// components/characters/CharacterGrid.jsx
import Link from 'next/link';

const STYLE_ICONS = {
  'romantic-lite': '💕',
  playful: '😄',
  mentor: '🧠',
  friendly: '☀️',
  humorous: '😂'
};

export default function CharacterGrid({ characters, onSelect, compact = false }) {
  return (
    <div className={`character-grid ${compact ? 'compact' : ''}`}>
      {characters.map((char) => (
        <CharacterCard key={char.id} character={char} onSelect={onSelect} compact={compact} />
      ))}

      <style jsx>{`
        .character-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .character-grid.compact {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        @media (max-width: 640px) {
          .character-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
      `}</style>
    </div>
  );
}

function CharacterCard({ character, onSelect, compact }) {
  const styleIcon = STYLE_ICONS[character.conversationStyle] || '✦';
  const href = `/${character.slug}`;

  const CardContent = () => (
    <div className="card-inner">
      <div className="card-avatar" style={{ background: `${character.color}22`, borderColor: `${character.color}55` }}>
        <span className="avatar-letter" style={{ color: character.color }}>
          {character.name[0]}
        </span>
        {character.featured && <span className="featured-badge">Featured</span>}
      </div>

      <div className="card-body">
        <div className="card-top">
          <h3 className="char-name">{character.name}</h3>
          <span className="style-icon" title={character.conversationStyle}>{styleIcon}</span>
        </div>
        <p className="char-meta">{character.age} · {character.country}</p>
        {!compact && (
          <>
            <p className="char-greeting">"{character.greetingMessage.substring(0, 80)}..."</p>
            <div className="char-tags">
              {character.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag" style={{ borderColor: `${character.color}44`, color: character.color }}>
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}
        <button
          className="chat-btn"
          style={{ background: character.color }}
          onClick={(e) => {
            if (onSelect) { e.preventDefault(); onSelect(character); }
          }}
        >
          Chat with {character.name}
        </button>
      </div>
    </div>
  );

  return (
    <Link href={href} className="char-card" aria-label={`Chat with ${character.name}`}>
      <CardContent />
      <style jsx>{`
        :global(.char-card) {
          display: block;
          text-decoration: none;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        :global(.char-card:hover) {
          transform: translateY(-4px);
          border-color: rgba(196,149,74,0.3);
          box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(196,149,74,0.1);
        }
        .card-inner { padding: 20px; }
        .card-avatar {
          width: 72px; height: 72px;
          border-radius: 50%;
          border: 2px solid;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          position: relative;
        }
        .avatar-letter { font-size: 1.8rem; font-weight: 700; }
        .featured-badge {
          position: absolute; top: -4px; right: -4px;
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #08081a; font-size: 0.55rem; font-weight: 800;
          padding: 2px 6px; border-radius: 10px;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .char-name { color: #fff; font-size: 1.1rem; font-weight: 700; margin: 0; }
        .style-icon { font-size: 1.1rem; }
        .char-meta { color: rgba(255,255,255,0.4); font-size: 0.8rem; margin: 0 0 10px; }
        .char-greeting { color: rgba(255,255,255,0.6); font-size: 0.82rem; line-height: 1.4; margin: 0 0 12px; font-style: italic; }
        .char-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .tag {
          font-size: 0.7rem; padding: 2px 8px;
          border-radius: 20px; border: 1px solid;
          text-transform: capitalize; font-weight: 600;
        }
        .chat-btn {
          width: 100%; padding: 10px;
          border-radius: 10px; border: none;
          color: #fff; font-weight: 700; font-size: 0.875rem;
          cursor: pointer; transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .chat-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
      `}</style>
    </Link>
  );
}
