const express = require("express");
const fs = require("fs");
const path = require("path");
const { checkPlagiarism } = require("./plagiarismChecker");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ─── Existing routes ────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("Hello from sample app on the server!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Blog route ──────────────────────────────────────────────────────────────

/**
 * GET /blog
 * Returns the latest trending blog post as plain text (Markdown).
 */
app.get("/blog", (req, res) => {
  const blogPath = path.join(__dirname, "blog", "ai-agents-2026.md");
  fs.readFile(blogPath, "utf8", (err, content) => {
    if (err) {
      return res.status(500).json({ error: "Could not load blog post." });
    }
    res.type("text/markdown").send(content);
  });
});

// ─── Plagiarism-check route ───────────────────────────────────────────────────

/**
 * POST /plagiarism-check
 * Body: {
 *   text: string,           // candidate text to check
 *   references?: Array<{title: string, content: string}>,  // optional custom sources
 *   ngramSize?: number,     // default 3
 *   threshold?: number      // default 0.15
 * }
 *
 * To self-check the blog post, omit `text` (or pass text: "blog").
 */
app.post("/plagiarism-check", (req, res) => {
  let { text, references, ngramSize, threshold } = req.body || {};

  // Default: check the blog post itself
  if (!text || text === "blog") {
    const blogPath = path.join(__dirname, "blog", "ai-agents-2026.md");
    try {
      text = fs.readFileSync(blogPath, "utf8");
    } catch {
      return res.status(500).json({ error: "Could not load blog post for checking." });
    }
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Provide a non-empty `text` string to check." });
  }

  // Default reference corpus — common phrases / publicly known text snippets
  // In production this would query an external plagiarism database.
  const defaultReferences = [
    {
      title: "Sample reference A — generic AI overview",
      content:
        "Artificial intelligence is transforming industries by automating tasks and providing insights from large datasets. Machine learning models are trained on data to make predictions.",
    },
    {
      title: "Sample reference B — agent definition",
      content:
        "An AI agent is a software system that perceives its environment and takes actions to achieve a goal. Agents can be reactive or deliberative depending on their architecture.",
    },
    {
      title: "Sample reference C — enterprise AI adoption",
      content:
        "Enterprises are adopting artificial intelligence to improve operational efficiency. Studies show significant reductions in manual work time through automation technologies.",
    },
  ];

  const refs = Array.isArray(references) && references.length > 0
    ? references
    : defaultReferences;

  const options = {};
  if (typeof ngramSize === "number") options.ngramSize = ngramSize;
  if (typeof threshold === "number") options.threshold = threshold;

  const result = checkPlagiarism(text, refs, options);

  res.json({
    checkedAt: new Date().toISOString(),
    textLength: text.length,
    ...result,
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Sample app running on port ${PORT}`);
  console.log(`  GET  /blog               — view trending blog post`);
  console.log(`  POST /plagiarism-check   — check text for plagiarism`);
});
