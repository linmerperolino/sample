# Community Insights Scanner

Scan Reddit and X (Twitter) for real community discussions from the last 30 days on the topic below, then synthesize those insights into copy-paste-ready Claude prompts.

**Topic:** $ARGUMENTS

If the topic above is empty, ask: "What topic should I scan Reddit and X for?"

---

## Instructions

Execute the following steps in order:

### Step 1 — Search Reddit (last 30 days)

Run **4 targeted WebSearch queries** to surface recent Reddit discussions. Use today's date minus 30 days for the `after:` filter:

1. `site:reddit.com "$ARGUMENTS"` — broad recent posts
2. `site:reddit.com "$ARGUMENTS" tips OR advice OR lessons learned`
3. `site:reddit.com "$ARGUMENTS" problems OR issues OR mistakes`
4. `site:reddit.com "$ARGUMENTS" best practices OR what works`

Collect the top results from each query. Note URLs, post titles, and any visible snippets.

### Step 2 — Search X / Twitter (last 30 days)

Run **3 targeted WebSearch queries** to surface recent X posts and threads:

1. `site:x.com OR site:twitter.com "$ARGUMENTS"`
2. `"$ARGUMENTS" x.com thread insights tips`
3. `"$ARGUMENTS" twitter community what works`

Collect the top results. Note any viral threads, high-engagement posts, or recurring themes.

### Step 4 — Fetch & Skim Key Sources

Use WebFetch on the **top 4–6 most relevant URLs** (mix of Reddit threads and X posts) found above. Extract:

- Specific techniques, tools, or workflows mentioned by multiple people
- Recurring pain points or failure modes
- "Aha moments" — things the community recently discovered that changed their approach
- Contrarian takes that challenge the conventional wisdom
- Specific numbers, timeframes, or measurable results people reported

### Step 5 — Synthesize Community Insights

Before writing prompts, output a **"What the Community Has Figured Out"** section:

```
## What the Community Has Figured Out (Last 30 Days): $ARGUMENTS

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

Keep this tight — 3–5 bullets per category, sourced from actual posts.

### Step 6 — Generate Copy-Paste-Ready Prompts

Write **6–8 Claude prompts** grounded in the real community insights above. Each prompt must:

- Open with a clear role or context line
- Encode a specific insight or technique the community has validated
- Be copy-paste-ready (no placeholders that require explanation, or wrap them in `[brackets]` that are self-evident)
- Work standalone — no setup required

Format each prompt in a fenced code block labeled `prompt`:

````
## Prompt 1: <short title reflecting the community insight>

> **Why this prompt:** One sentence linking it to what you found in the community (cite the source type — Reddit, X, etc.)

```prompt
<the full, copy-paste-ready prompt text>
```
````

### Step 7 — Meta-Prompt (Bonus)

As the final item, generate one **meta-prompt** — a prompt that helps the user *discover more prompts* on this topic by asking Claude to scan for new community insights itself:

````
## Meta-Prompt: Stay Current on $ARGUMENTS

```prompt
Search recent Reddit and X discussions (last 30 days) about $ARGUMENTS. Identify the top 5 things the community has figured out that most tutorials still don't cover. For each insight, write me a copy-paste-ready prompt I can use immediately.
```
````

---

## Quality Rules

- **No hallucinated sources.** Only reference URLs and discussions you actually fetched.
- **No stale advice.** If a technique was common 6 months ago but the community has moved on, flag it as outdated.
- **Ground every prompt in evidence.** Each prompt title and rationale must trace back to a real post or thread.
- **Be specific.** "Use structured output" is weak. "Set `response_format: json_schema` with a strict schema — the community found this cuts hallucinated field names by ~80%" is strong.
- **Match the community's vocabulary.** Use the exact terms, jargon, and framings the community uses — not textbook language.
