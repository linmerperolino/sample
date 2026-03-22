const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const JOKES = [
  { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs." },
  { setup: "How many programmers does it take to change a light bulb?", punchline: "None. That's a hardware problem." },
  { setup: "Why did the developer go broke?", punchline: "Because they used up all their cache." },
  { setup: "What do you call a programmer from Finland?", punchline: "Nerdic." },
  { setup: "Why was the JavaScript developer sad?", punchline: "Because they didn't Node how to Express themselves." },
  { setup: "What's a computer's favorite snack?", punchline: "Microchips." },
  { setup: "Why do Java developers wear glasses?", punchline: "Because they don't C#." },
  { setup: "How do you comfort a JavaScript bug?", punchline: "You console it." },
];

const FACTS = [
  "The first computer bug was an actual bug — a moth found in a Harvard Mark II relay in 1947.",
  "The average person spends 6 months of their lifetime waiting for red lights to turn green.",
  "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.",
  "A group of flamingos is called a flamboyance.",
  "The longest English word you can type using only the top row of a keyboard is 'typewriter'.",
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
  "The total weight of all ants on Earth roughly equals the total weight of all humans.",
  "A day on Venus is longer than a year on Venus.",
];

const MAGIC8_RESPONSES = [
  { answer: "It is certain.", vibe: "positive" },
  { answer: "Without a doubt.", vibe: "positive" },
  { answer: "You may rely on it.", vibe: "positive" },
  { answer: "Yes, definitely.", vibe: "positive" },
  { answer: "As I see it, yes.", vibe: "positive" },
  { answer: "Most likely.", vibe: "positive" },
  { answer: "Outlook good.", vibe: "positive" },
  { answer: "Signs point to yes.", vibe: "positive" },
  { answer: "Reply hazy, try again.", vibe: "neutral" },
  { answer: "Ask again later.", vibe: "neutral" },
  { answer: "Better not tell you now.", vibe: "neutral" },
  { answer: "Cannot predict now.", vibe: "neutral" },
  { answer: "Concentrate and ask again.", vibe: "neutral" },
  { answer: "Don't count on it.", vibe: "negative" },
  { answer: "My reply is no.", vibe: "negative" },
  { answer: "My sources say no.", vibe: "negative" },
  { answer: "Outlook not so good.", vibe: "negative" },
  { answer: "Very doubtful.", vibe: "negative" },
];

const ASCII_ART = [
  `
    /\\_____/\\
   /  o   o  \\
  ( ==  ^  == )
   )         (
  (           )
 ( (  )   (  ) )
(__(__)___(__)__)
   [ I'm watching your code ]`,

  `
      ___
     /   \\
    | o o |
    |  ^  |
    | \\_/ |
     \\___/

  Node.js server
  hard at work!`,

  `
   +-----+
   | 1 0 |
   | 0 1 |
   | 1 1 |
   +--+--+
      |
   [server]
   sending
    bytes!`,

  `
     .---.
    /|6 6|\\
   | | ^ | |
    \\|___|/
   /|     |\\
  (_|_____|_)

  Bug-free since
  at least 5 min ago`,
];

const QUOTES = [
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" },
  { text: "Java is to JavaScript what car is to carpet.", author: "Chris Heilmann" },
  { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
  { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
  { text: "Fix the cause, not the symptom.", author: "Steve Maguire" },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── routes ───────────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("Hello from sample app on the server!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/joke", (req, res) => {
  const joke = pick(JOKES);
  res.json(joke);
});

app.get("/fact", (req, res) => {
  res.json({ fact: pick(FACTS) });
});

app.get("/magic8", (req, res) => {
  const { question } = req.query;
  const response = pick(MAGIC8_RESPONSES);
  res.json({
    question: question || "(you didn't ask one, but the 8-ball answers anyway)",
    ...response,
  });
});

app.get("/quote", (req, res) => {
  res.json(pick(QUOTES));
});

app.get("/ascii", (req, res) => {
  res.type("text/plain").send(pick(ASCII_ART));
});

app.get("/surprise", (req, res) => {
  const features = ["joke", "fact", "magic8", "quote", "ascii"];
  const chosen = pick(features);
  res.redirect(`/${chosen}`);
});

// ─── startup ──────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   Sample app running on port ${PORT}    ║
  ╠══════════════════════════════════════╣
  ║  GET /          → hello world        ║
  ║  GET /health    → health check       ║
  ║  GET /joke      → programming jokes  ║
  ║  GET /fact      → random facts       ║
  ║  GET /magic8    → ask the oracle     ║
  ║  GET /quote     → dev wisdom         ║
  ║  GET /ascii     → ASCII art          ║
  ║  GET /surprise  → ???                ║
  ╚══════════════════════════════════════╝
  `);
});
