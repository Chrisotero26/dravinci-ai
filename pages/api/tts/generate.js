// pages/api/tts/generate.js
// Text-to-Speech using ElevenLabs — Premium feature only

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { getUserProfile, supabaseAdmin } from '../../../lib/supabase';
import { getCharacterById } from '../../../data/characters';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createServerSupabaseClient({ req, res });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const profile = await getUserProfile(user.id);
  if (profile.subscription_status !== 'premium') {
    return res.status(403).json({ error: 'Voice requires Premium', requiresUpgrade: true });
  }

  const { text, characterId, messageId } = req.body;
  if (!text || !characterId) return res.status(400).json({ error: 'text and characterId required' });

  const character = getCharacterById(characterId);
  if (!character) return res.status(404).json({ error: 'Character not found' });

  const voiceId = character.voice.elevenlabsVoiceId;

  // Check if already cached
  if (messageId) {
    const admin = supabaseAdmin();
    const { data: msg } = await admin
      .from('messages')
      .select('tts_audio_url')
      .eq('id', messageId)
      .single();

    if (msg?.tts_audio_url) {
      return res.status(200).json({ audioUrl: msg.tts_audio_url, cached: true });
    }
  }

  try {
    const elevenLabsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: text.substring(0, 500), // Limit length
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!elevenLabsRes.ok) {
      const errText = await elevenLabsRes.text();
      console.error('ElevenLabs error:', errText);
      return res.status(502).json({ error: 'TTS service error' });
    }

    const audioBuffer = await elevenLabsRes.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Optionally save to Supabase Storage and update message record
    // For now, return base64 directly
    // TODO: upload to Supabase Storage bucket and save URL to messages table

    return res.status(200).json({ audioUrl: audioDataUrl, cached: false });

  } catch (error) {
    console.error('TTS error:', error);
    return res.status(500).json({ error: 'TTS generation failed' });
  }
}
