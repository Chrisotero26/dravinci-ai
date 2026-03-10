// scripts/generateSitemap.js
// Generates sitemap.xml for all character pages + static pages

const fs = require('fs');
const path = require('path');
const { characters } = require('../data/characters');

const SITE_URL = 'https://dravinci.ai';

const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/companions', priority: '0.9', changefreq: 'weekly' },
  { url: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { url: '/about', priority: '0.7', changefreq: 'monthly' },
];

function generateSitemap() {
  const characterPages = characters.map(char => ({
    url: `/${char.slug}`,
    priority: char.featured ? '0.9' : '0.8',
    changefreq: 'weekly'
  }));

  const allPages = [...staticPages, ...characterPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf-8');
  console.log(`✅ Sitemap generated: ${allPages.length} URLs → public/sitemap.xml`);
}

generateSitemap();

// ============================================================
// scripts/seedCharacters.js — Seeds characters to Supabase
// ============================================================

async function seedCharacters() {
  require('dotenv').config({ path: '.env.local' });
  const { createClient } = require('@supabase/supabase-js');
  const { characters } = require('../data/characters');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log(`📤 Seeding ${characters.length} characters to Supabase...`);

  for (const char of characters) {
    const { error } = await supabase.from('characters').upsert({
      id: char.id,
      name: char.name,
      slug: char.slug,
      age: char.age,
      country: char.country,
      accent: char.accent,
      appearance: char.appearance,
      personality: char.personality,
      conversation_style: char.conversationStyle,
      greeting_message: char.greetingMessage,
      sad_behavior: char.sadBehavior,
      voice_config: char.voice,
      tags: char.tags,
      featured: char.featured,
      avatar_url: char.avatarUrl,
      color: char.color,
      is_active: true
    });

    if (error) {
      console.error(`❌ Error seeding ${char.name}:`, error.message);
    } else {
      console.log(`✅ Seeded: ${char.name} (${char.country})`);
    }
  }

  console.log('🎉 Seed complete!');
}

if (require.main === module && process.argv[2] === '--seed') {
  seedCharacters().catch(console.error);
}
