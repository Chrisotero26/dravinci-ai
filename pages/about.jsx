import Header from '../components/layout/Header';
import Head from 'next/head';

export default function About() {
  return (
    <div className="dravinci-page">
      <Head>
        <title>Sobre Nosotros | Dravinci AI</title>
      </Head>
      <Header />
      <main className="about-content">
        <section className="hero-section">
          <h1>Sobre Dravinci AI</h1>
          <p className="subtitle">Fusionando la creatividad humana con la inteligencia artificial.</p>
        </section>
        <section className="mission-section">
          <div className="container">
            <h2>Nuestra Misión</h2>
            <p>Dravinci AI nace de la visión de crear compañeros digitales que no solo respondan preguntas, sino que inspiren la creatividad y el crecimiento personal. Nuestra plataforma utiliza los modelos de lenguaje más avanzados para ofrecerte una experiencia única y personalizada.</p>
          </div>
        </section>
      </main>
      <style jsx>{`
        .dravinci-page {
          min-height: 100vh;
          background: #080818;
          color: #fff;
        }
        .about-content {
          max-width: 800px;
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
        .mission-section {
          background: rgba(255,255,255,0.03);
          padding: 40px;
          border-radius: 24px;
          border: 1px solid rgba(196,149,74,0.2);
        }
        h2 {
          color: #C4954A;
          margin-bottom: 20px;
        }
        p {
          line-height: 1.8;
          font-size: 1.1rem;
          color: rgba(255,255,255,0.9);
        }
      `}</style>
    </div>
  );
}
