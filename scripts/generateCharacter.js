// scripts/generateCharacter.js
// ============================================================
// MANUS AUTOMATION SCRIPT — Batch character creation
// ============================================================
// Usage: node scripts/generateCharacter.js
// Or via Manus: provide CHARACTER_PROMPT and this script
// will generate a fully-formatted character profile.
// ============================================================

/**
 * MANUS PROMPT TEMPLATE FOR NEW CHARACTERS
 * =========================================
 * Copy this prompt into Manus to batch-generate new characters.
 * The output will be a valid JavaScript object ready to paste
 * into data/characters.js
 */

const MANUS_CHARACTER_GENERATION_PROMPT = `
You are creating an AI companion character profile for the Dravinci AI platform.
The platform is 18+ and characters must be SAFE, POSITIVE, and UPLIFTING.
No harmful content. Flirty is allowed only in a safe, playful way.

Generate a complete character profile in this EXACT JSON format:

{
  "id": "lowercase_no_spaces",
  "slug": "chat-with-[name]",
  "name": "Character Name",
  "age": 25,
  "country": "Country Name",
  "accent": "Description of accent",
  "appearance": {
    "hair": "Description",
    "eyes": "Description",
    "style": "Description"
  },
  "personality": ["Trait1", "Trait2", "Trait3", "Trait4", "Trait5"],
  "conversationStyle": "friendly|playful|mentor|romantic-lite|humorous",
  "greetingMessage": "First message the character sends (warm, engaging, under 200 chars)",
  "exampleConversation": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "sadBehavior": "Description of how character responds to distressed users",
  "voice": {
    "tone": "Description of voice tone",
    "warmth": "Low|Medium|High|Very high",
    "accent": "Description for TTS",
    "elevenlabsVoiceId": "PLACEHOLDER_[NAME]_VOICE_ID"
  },
  "seoTitle": "Chat with [Name] - [trait] AI Companion | Dravinci AI",
  "seoDescription": "SEO meta description under 160 chars",
  "ogImage": "/images/characters/[name]-og.jpg",
  "tags": ["tag1", "tag2", "tag3"],
  "featured": false,
  "avatarUrl": "/images/characters/[name].jpg",
  "color": "#HEXCOLOR"
}

Create a character with these specifications:
- Name: [INSERT NAME]
- Country/Background: [INSERT COUNTRY]  
- Personality type: [INSERT TYPE: romantic/mentor/funny/wise/playful]
- Special trait: [INSERT UNIQUE TRAIT]

Make them feel REAL, WARM, and UNIQUE. 
Give them cultural depth, not stereotypes.
Output ONLY the JSON object, nothing else.
`;

/**
 * MANUS SEO PAGE GENERATION PROMPT
 * ==================================
 */
const MANUS_SEO_PAGE_PROMPT = `
Given this character data:
[INSERT CHARACTER JSON]

Generate a Next.js static page file for this character.
The file should:
1. Use getStaticProps/getStaticPaths
2. Include full Head metadata (title, description, OG, Twitter, JSON-LD)
3. Have clean URL: /chat-with-[name]
4. Include character profile sidebar
5. Include ChatWindow component
6. Be SEO optimized for "chat with [name] AI" keywords

Output only the complete .jsx file content.
`;

/**
 * MANUS BATCH WORKFLOW
 * =====================
 * Step 1: Use MANUS_CHARACTER_GENERATION_PROMPT to generate 10 characters at once
 * Step 2: Parse the JSON array of characters
 * Step 3: Run seedCharacters.js to insert them into Supabase
 * Step 4: Run generateSitemap.js to update sitemap
 * Step 5: Deploy to Vercel/production
 */

const BATCH_GENERATION_PROMPT = `
Using the character profile format below, generate 10 NEW unique AI companion characters for Dravinci AI.

Requirements:
- Each must have a DIFFERENT country of origin
- Cover diverse personality types: mix of romantic-lite, mentor, playful, friendly, humorous
- Ages between 21-35
- All characters are safe, positive, and uplifting
- No duplicate personality archetypes
- Rich cultural authenticity without stereotypes

Character format: [PASTE FULL FORMAT FROM ABOVE]

Output a JSON array of 10 character objects. 
Output ONLY the JSON array, no commentary.
`;

module.exports = {
  MANUS_CHARACTER_GENERATION_PROMPT,
  MANUS_SEO_PAGE_PROMPT,
  BATCH_GENERATION_PROMPT
};

// Example usage with Anthropic SDK (for automated runs):
async function generateCharacterWithClaude(specs) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = MANUS_CHARACTER_GENERATION_PROMPT
    .replace('[INSERT NAME]', specs.name)
    .replace('[INSERT COUNTRY]', specs.country)
    .replace('[INSERT TYPE: romantic/mentor/funny/wise/playful]', specs.type)
    .replace('[INSERT UNIQUE TRAIT]', specs.trait);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });

  const jsonText = response.content[0].text.trim();
  const character = JSON.parse(jsonText);
  return character;
}

// CLI usage
if (require.main === module) {
  const specs = {
    name: process.argv[2] || 'Alex',
    country: process.argv[3] || 'Australia',
    type: process.argv[4] || 'friendly',
    trait: process.argv[5] || 'outdoor adventurer'
  };

  generateCharacterWithClaude(specs)
    .then(char => {
      console.log('\n✅ Generated character:');
      console.log(JSON.stringify(char, null, 2));
      console.log('\n📋 Add this to data/characters.js in the characters array.');
    })
    .catch(err => {
      console.error('❌ Error:', err.message);
    });
}
