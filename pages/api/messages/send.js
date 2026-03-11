// pages/api/messages/send.js
// Main chat API endpoint — handles message sending, AI response, caching

import Anthropic from '@anthropic-ai/sdk';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import {
  checkMessageLimit,
  incrementMessageCount,
  getOrCreateConversation,
  getConversationHistory,
  saveMessage,
  supabaseAdmin
} from '../../../lib/supabase';
import { buildSystemPrompt, buildConversationMessages } from '../../../lib/characterPrompts';
import { getCharacterById } from '../../../data/characters';
import crypto from 'crypto';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Auth check - Using the modern createPagesServerClient as suggested by Claude
    const supabase = createPagesServerClient({ req, res });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized', requiresLogin: true });
    }

    const { characterId, message, conversationId } = req.body;

    if (!characterId || !message?.trim()) {
      return res.status(400).json({ error: 'characterId and message are required' });
    }

    // Get character
    const character = getCharacterById(characterId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    // Check message limits (free tier = 10/day)
    const limitCheck = await checkMessageLimit(user.id);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'Daily message limit reached',
        requiresUpgrade: true,
        remaining: 0
      });
    }

    // Get or create conversation
    const conversation = conversationId
      ? { id: conversationId }
      : await getOrCreateConversation(user.id, characterId);

    // Get conversation history (last 20 messages for context)
    const history = await getConversationHistory(conversation.id, 20);

    // Check response cache for common prompts
    const promptHash = crypto
      .createHash('md5')
      .update(`${characterId}:${message.trim().toLowerCase()}`)
      .digest('hex');

    const admin = supabaseAdmin();
    const { data: cached } = await admin
      .from('response_cache')
      .select('response_text')
      .eq('prompt_hash', promptHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    let aiResponse;

    if (cached?.response_text && history.length === 0) {
      // Only use cache for first messages (no context)
      aiResponse = cached.response_text;
      // Increment cache hit count
      await admin
        .from('response_cache')
        .update({ hit_count: admin.rpc('increment', { x: 1 }) })
        .eq('prompt_hash', promptHash);
    } else {
      // Call Claude API
      const systemPrompt = buildSystemPrompt(character);
      const conversationMessages = buildConversationMessages(history, message);

      // Using the model specified in environment variables or a fallback
      const response = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
        max_tokens: 500,
        system: systemPrompt,
        messages: conversationMessages
      });

      aiResponse = response.content[0].text;

      // Cache this response if it's a simple first message
      if (history.length === 0) {
        await admin
          .from('response_cache')
          .upsert({
            character_id: characterId,
            prompt_hash: promptHash,
            response_text: aiResponse,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
      }
    }

    // Save both messages to DB
    await saveMessage(conversation.id, user.id, 'user', message);
    const savedAiMsg = await saveMessage(conversation.id, user.id, 'assistant', aiResponse);

    // Increment user message count
    await incrementMessageCount(user.id);

    return res.status(200).json({
      response: aiResponse,
      conversationId: conversation.id,
      messageId: savedAiMsg.id,
      remaining: limitCheck.remaining - 1
    });

  } catch (error) {
    console.error('Message API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
