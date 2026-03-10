import Header from '../components/layout/Header';
import Head from 'next/head';

export default function Pricing() {
  return (
    <div className="dravinci-page">
      <Head>
        <title>Precios | Dravinci AI</title>
      </Head>
      <Header />
      <main className="pricing-content">
        <section className="hero-section">
          <h1>Planes y Precios</h1>
          <p className="subtitle">Elige el plan que mejor se adapte a tu creatividad.</p>
        </section>
        <section className="pricing-grid">
          <div className="pricing-card">
            <h3>Gratis</h3>
            <div className="price">$0<span>/mes</span></div>
            <ul>
              <li>Acceso a personajes básicos</li>
              <li>10 mensajes por día</li>
              <li>Soporte comunitario</li>
            </ul>
            <button className="btn btn-ghost">Empezar Gratis</button>
          </div>
          <div className="pricing-card featured">
            <div className="badge">Recomendado</div>
            <h3>Premium</h3>
            <div className="price">$19<span>/mes</span></div>
            <ul>
              <li>Acceso a todos los personajes</li>
              <li>Mensajes ilimitados</li>
              <li>Voz de alta calidad (ElevenLabs)</li>
              <li>Soporte prioritario</li>
            </ul>
            <button className="btn btn-gold">Obtener Premium</button>
          </div>
        </section>
      </main>
      <style jsx>{`
        .dravinci-page {
          min-height: 100vh;
          background: #080818;
          color: #fff;
        }
        .pricing-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 80px 24px;
        }
        .hero-section {
          text-align: center;
          margin-bottom: 60px;
        }
        h1 {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          color: #C4954A;
          margin-bottom: 16px;
        }
        .subtitle {
          font-size: 1.25rem;
          color: rgba(255,255,255,0.7);
        }
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;
          margin-top: 40px;
        }
        .pricing-card {
          background: rgba(255,255,255,0.03);
          padding: 40px;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: center;
          position: relative;
          transition: transform 0.3s ease;
        }
        .pricing-card:hover {
          transform: translateY(-10px);
        }
        .pricing-card.featured {
          border-color: #C4954A;
          background: rgba(196,149,74,0.05);
        }
        .badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #C4954A;
          color: #080818;
          padding: 4px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 700;
        }
        h3 {
          font-size: 1.5rem;
          margin-bottom: 20px;
          color: #fff;
        }
        .price {
          font-size: 3rem;
          font-weight: 700;
          color: #C4954A;
          margin-bottom: 30px;
        }
        .price span {
          font-size: 1rem;
          color: rgba(255,255,255,0.5);
        }
        ul {
          list-style: none;
          padding: 0;
          margin-bottom: 40px;
          text-align: left;
        }
        li {
          margin-bottom: 12px;
          color: rgba(255,255,255,0.8);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        li::before {
          content: '✓';
          color: #C4954A;
          font-weight: 700;
        }
        .btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-ghost {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.05);
        }
        .btn-gold {
          background: linear-gradient(135deg, #C4954A, #E5B86A);
          color: #080818;
        }
        .btn-gold:hover {
          box-shadow: 0 10px 30px rgba(196,149,74,0.3);
        }
      `}</style>
    </div>
  );
}
