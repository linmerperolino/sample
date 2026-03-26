# Community Insights Scanner

Scan Reddit and X (Twitter) for real community discussions from the last 30 days on any topic, then synthesize those insights into copy-paste-ready prompts grounded in what people have actually figured out — not what was working six months ago.

## When to Use This Skill

Use this skill when the user asks things like:

- "What is the community saying about [topic]?"
- "Scan Reddit and X for [topic]"
- "What are people figuring out about [topic] right now?"
- "Give me prompts based on what the community knows about [topic]"
- "What's working for [topic] lately?"
- "Community insights on [topic]"

## When to Avoid

Do not use this skill for:

- Topics where real-time community data is irrelevant (e.g., historical facts, math problems)
- Requests for a single definitive answer rather than community synthesis
- Sensitive personal topics where Reddit/X scanning would be inappropriate

## Key Implementation Details

### Step 1 — Identify the Topic

Extract the topic from the user's message. If no topic is clear, ask: "What topic should I scan Reddit and X for?"

### Step 2 — Search Reddit (last 30 days)

Run 4 web searches targeting Reddit. Use today's date minus 30 days for recency filtering:

1. `site:reddit.com "[topic]"` — broad recent posts
2. `site:reddit.com "[topic]" tips OR advice OR lessons learned`
3. `site:reddit.com "[topic]" problems OR issues OR mistakes`
4. `site:reddit.com "[topic]" best practices OR what works`

Note: reddit.com blocks direct crawling. If site: searches fail, use broader queries like `reddit "[topic]" 2025 lessons learned` and collect results from aggregators and search snippets.

### Step 3 — Search X / Twitter (last 30 days)

Run 3 web searches targeting X:

1. `site:x.com OR site:twitter.com "[topic]"`
2. `"[topic]" x.com thread insights tips`
3. `"[topic]" twitter community what works`

### Step 4 — Fetch Key Sources

Use web fetch on the top 4–6 most relevant URLs found above (mix of Reddit threads and X posts/aggregators). Extract:

- Specific techniques, tools, or workflows mentioned by multiple people
- Recurring pain points or failure modes
- "Aha moments" — things the community recently discovered that changed their approach
- Contrarian takes that challenge the conventional wisdom
- Specific numbers, timeframes, or measurable results people reported

If direct Reddit/X URLs block fetching, fetch aggregator pages, Medium articles, or forum posts that reference the community discussions.

### Step 5 — Synthesize Community Insights

Output a "What the Community Has Figured Out" section before writing prompts:

```
## What the Community Has Figured Out (Last 30 Days): [topic]

**The Consensus Shifts**
- [insight] — seen in X posts / Y Reddit threads
- ...

**Top Pain Points Right Now**
- ...

**What's Actually Working**
- ...

**Contrarian Takes Worth Noting**
- ...

**Emerging Tools / Approaches**
- ...
```

Keep it tight — 3–5 bullets per category, sourced from actual posts found. Never fabricate sources.

### Step 6 — Generate Copy-Paste-Ready Prompts

Write 6–8 prompts grounded in the real community insights above. Each prompt must:

- Open with a clear role or context line
- Encode a specific insight or technique the community has validated
- Be copy-paste-ready — no unexplained placeholders (use [brackets] for self-evident fill-ins only)
- Work standalone — no setup required

Format each as:

```
## Prompt N: [short title reflecting the community insight]

> **Why this prompt:** One sentence linking it to what you found (cite source type — Reddit, X, etc.)

[the full, copy-paste-ready prompt text]
```

### Step 7 — Meta-Prompt (Bonus)

End with one meta-prompt the user can run to stay current:

```
## Meta-Prompt: Stay Current on [topic]

Search recent Reddit and X discussions (last 30 days) about [topic].
Identify the top 5 things the community has figured out that most
tutorials still don't cover. For each insight, write me a
copy-paste-ready prompt I can use immediately.
```

## Quality Rules

- **No hallucinated sources.** Only reference URLs and discussions actually fetched or found in search results.
- **No stale advice.** If a technique was common 6+ months ago but the community has moved on, flag it as outdated.
- **Ground every prompt in evidence.** Each prompt title and rationale must trace back to a real post or thread.
- **Be specific.** Weak: "use structured output". Strong: "set response_format: json_schema with a strict schema — the community found this cuts hallucinated field names by ~80%".
- **Match the community's vocabulary.** Use the exact terms, jargon, and framings people use in posts — not textbook language.

## Example Invocation

User: "Scan Reddit and X for what the community is figuring out about AI trading bots"

The skill searches Reddit and X, fetches top threads, synthesizes 5 insight categories, then outputs 6–8 ready-to-use prompts each grounded in a specific community finding — covering things like the "Bot Pilot" mental model, overfitting stress tests, sentiment layer architecture, and the Solana fee viability problem.
