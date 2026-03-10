// pages/api/subscriptions/webhook.js
// Stripe webhook — updates subscription status in Supabase

import Stripe from 'stripe';
import { supabaseAdmin } from '../../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const admin = supabaseAdmin();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;

      await admin.from('profiles').update({
        subscription_status: 'premium',
        subscription_tier: plan,
        stripe_subscription_id: session.subscription
      }).eq('id', userId);

      await admin.from('subscription_events').insert({
        user_id: userId,
        event_type: 'created',
        stripe_event_id: event.id,
        plan_id: plan,
        amount: session.amount_total,
        currency: session.currency
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (profile) {
        await admin.from('profiles').update({
          subscription_status: 'free',
          subscription_tier: null,
          stripe_subscription_id: null
        }).eq('id', profile.id);

        await admin.from('subscription_events').insert({
          user_id: profile.id,
          event_type: 'cancelled',
          stripe_event_id: event.id,
          plan_id: null,
          amount: 0
        });
      }
      break;
    }

    case 'invoice.payment_failed': {
      // Handle payment failure — optionally notify user
      console.log('Payment failed for customer:', event.data.object.customer);
      break;
    }
  }

  return res.status(200).json({ received: true });
}
