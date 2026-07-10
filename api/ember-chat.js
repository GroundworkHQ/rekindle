import Anthropic from '@anthropic-ai/sdk';
import { EMBER_SYSTEM_PROMPT } from './_ember-prompt.js';

// Node.js serverless function (the Anthropic SDK needs Node built-ins, so not Edge).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  // Vercel parses JSON bodies into req.body; fall back to manual parse just in case.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }

  const { messages, quiz } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).send('Missing messages');
    return;
  }

  // Light guardrails: keep the last 20 turns, cap each message length, force roles.
  const trimmed = messages.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 4000),
  }));

  // The Claude API requires the first message to be a user turn. The frontend
  // keeps Ember's opening greeting for display, so drop any leading assistant messages.
  while (trimmed.length && trimmed[0].role !== 'user') trimmed.shift();
  if (trimmed.length === 0) {
    res.status(400).send('Missing user message');
    return;
  }

  // Fold the quiz result into the system prompt as context, if we have it.
  let system = EMBER_SYSTEM_PROMPT;
  if (quiz && Number.isFinite(quiz.score)) {
    const focus = typeof quiz.focus === 'string' && quiz.focus.trim() ? quiz.focus.trim() : null;
    system +=
      `\n\n<context>The person just took the Marriage Health Score check-up. ` +
      `Their overall score is ${Math.round(quiz.score)} out of 100` +
      (focus ? `, and their weakest area is "${focus}".` : '.') +
      ` If this is the start of the conversation, open warmly with light awareness of where they are, ` +
      `without fixating on the number or sounding clinical.</context>`;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).send('Server is not configured yet.');
    return;
  }

  const client = new Anthropic({ apiKey });

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const stream = client.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      // Cache the (long, static-per-conversation) system prompt so turns after
      // the first skip reprocessing it — cuts time-to-first-token noticeably.
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      // Thinking off for fast, snappy replies (short warm chat, no deep reasoning
      // needed). Switch to { type: 'adaptive' } if you want more thoughtful answers.
      // (Haiku 4.5 doesn't support output_config.effort, so it's omitted.)
      thinking: { type: 'disabled' },
      messages: trimmed,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text);
      }
    }
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).send('Ember could not start. Please try again.');
      return;
    }
    res.write('\n\nSorry, something interrupted me. Could you say that again?');
  } finally {
    res.end();
  }
}
