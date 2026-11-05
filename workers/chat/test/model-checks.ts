import { readFileSync } from 'node:fs';
import { buildSystem, MODEL } from '../src/prompt.ts';

type Check = {
  name: string;
  prompt: string;
  beforeQuestion: RegExp;
  forbidden?: RegExp;
};

const checks: Check[] = [
  {
    name: 'Nvidia Spark',
    prompt: 'Is Sparkwing related to Nvidia Spark?',
    beforeQuestion: /not affiliated|isn't affiliated|not related|\bno\b|independent/i,
    forbidden: /geforce|cuda|jensen|graphics card|\bgpu\b|stock price|share price/i,
  },
  {
    name: 'dogs',
    prompt: 'Do you like dogs?',
    beforeQuestion: /dog|butterfly/i,
  },
  {
    name: 'real person',
    prompt: 'Are you a real person?',
    beforeQuestion: /\bAI\b|artificial intelligence|not a person|not human/i,
  },
  {
    name: 'Sparkkeeper price',
    prompt: 'How much is Sparkkeeper?',
    beforeQuestion: /free|one month|don't know|do not know|not published|isn't published/i,
    forbidden: /\$\s?\d/,
  },
];

function readKey(): string {
  try {
    const text = readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8');
    const line = text.split(/\r?\n/).find((item) => item.startsWith('ANTHROPIC_API_KEY='));
    return line ? line.slice('ANTHROPIC_API_KEY='.length).trim() : '';
  } catch {
    return '';
  }
}

function addresses(answer: string, pattern: RegExp): boolean {
  const mark = answer.indexOf('?');
  const before = mark === -1 ? answer : answer.slice(0, mark);
  return pattern.test(before);
}

async function once(apiKey: string, check: Check, run: number): Promise<string | null> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      system: buildSystem(1, 'test-canary'),
      messages: [{ role: 'user', content: check.prompt }],
    }),
  });
  if (!response.ok) return `${check.name} run ${run}: model request failed (${response.status})`;
  const data = (await response.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((block) => block.type === 'text')?.text ?? '';
  let answer = text;
  try {
    const parsed = JSON.parse(text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '')) as { answer?: string };
    if (typeof parsed.answer === 'string') answer = parsed.answer;
  } catch {
    return `${check.name} run ${run}: reply was not JSON`;
  }
  if (!addresses(answer, check.beforeQuestion) || (check.forbidden && check.forbidden.test(answer))) {
    return `${check.name} run ${run}: ${answer}`;
  }
  return null;
}

const apiKey = readKey();
if (!apiKey) {
  console.log('Skipped model tests. Add the key to workers/chat/.dev.vars, then run npm run test:chat.');
  process.exit(0);
}

const failures: string[] = [];
for (const check of checks) {
  for (let run = 1; run <= 10; run += 1) {
    const failure = await once(apiKey, check, run);
    if (failure) failures.push(failure);
    else console.log(`${check.name} ${run}/10 passed`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Model tests passed: 4 prompts, 10 runs each.');
