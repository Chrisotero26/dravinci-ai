// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (for API routes only)
export const supabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(supabaseUrl, supabaseServiceKey);
};

/* ============================================================
   SUPABASE DATABASE SCHEMA (run in Supabase SQL editor)
   ============================================================

-- USERS TABLE (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  date_of_birth DATE,
  is_verified_adult BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'free',  -- 'free' | 'premium'
  subscription_tier TEXT,                    -- null | 'monthly' | 'annual'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  message_count_today INTEGER DEFAULT 0,
  message_count_reset_at TIMESTAMP,
  favorite_characters TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CHARACTERS TABLE
CREATE TABLE public.characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  age INTEGER,
  country TEXT,
  accent TEXT,
  appearance JSONB,
  personality TEXT[],
  conversation_style TEXT,
  greeting_message TEXT,
  sad_behavior TEXT,
  voice_config JSONB,
  tags TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- CONVERSATIONS TABLE
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  character_id TEXT REFERENCES public.characters(id),
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id),
  user_id UUID REFERENCES public.profiles(id),
  role TEXT NOT NULL,  -- 'user' | 'assistant'
  content TEXT NOT NULL,
  tts_audio_url TEXT,  -- cached TTS audio URL if generated
  created_at TIMESTAMP DEFAULT NOW()
);

-- SUBSCRIPTIONS TABLE (for audit trail)
CREATE TABLE public.subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT,  -- 'created' | 'updated' | 'cancelled'
  stripe_event_id TEXT,
  plan_id TEXT,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMP DEFAULT NOW()
);

-- RESPONSE CACHE TABLE
CREATE TABLE public.response_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id TEXT,
  prompt_hash TEXT UNIQUE,
  response_text TEXT,
  hit_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

-- ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users see own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users see own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own messages" ON public.messages
  FOR ALL USING (auth.uid() = user_id);

-- Characters are public read
CREATE POLICY "Characters are public" ON public.characters
  FOR SELECT USING (TRUE);

============================================================ */

// Helper functions
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function checkMessageLimit(userId) {
  const profile = await getUserProfile(userId);
  if (profile.subscription_status === 'premium') return { allowed: true, remaining: Infinity };
  
  const FREE_DAILY_LIMIT = 10;
  const now = new Date();
  const resetAt = profile.message_count_reset_at ? new Date(profile.message_count_reset_at) : null;
  
  // Reset counter if it's a new day
  if (!resetAt || now.toDateString() !== resetAt.toDateString()) {
    await supabase
      .from('profiles')
      .update({ message_count_today: 0, message_count_reset_at: now.toISOString() })
      .eq('id', userId);
    return { allowed: true, remaining: FREE_DAILY_LIMIT };
  }
  
  const remaining = FREE_DAILY_LIMIT - profile.message_count_today;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

export async function incrementMessageCount(userId) {
  await supabase.rpc('increment_message_count', { user_id: userId });
}

export async function getOrCreateConversation(userId, characterId) {
  // Get most recent active conversation
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('character_id', characterId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (existing) return existing;
  
  // Create new conversation
  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, character_id: characterId })
    .select()
    .single();
  
  if (error) throw error;
  return created;
}

export async function getConversationHistory(conversationId, limit = 20) {
  const { data, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function saveMessage(conversationId, userId, role, content) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, user_id: userId, role, content })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
