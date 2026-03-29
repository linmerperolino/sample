/**
 * Plagiarism Checker
 * Uses n-gram overlap (Jaccard similarity) to detect text reuse between documents.
 * Score of 0.0 = completely original, 1.0 = identical.
 */

/**
 * Tokenise text into lowercase word tokens, stripping punctuation.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Build a Set of n-grams from a token array.
 * @param {string[]} tokens
 * @param {number} n - n-gram size (default 3)
 * @returns {Set<string>}
 */
function buildNgrams(tokens, n = 3) {
  const ngrams = new Set();
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.add(tokens.slice(i, i + n).join(" "));
  }
  return ngrams;
}

/**
 * Jaccard similarity between two Sets.
 * @param {Set<string>} a
 * @param {Set<string>} b
 * @returns {number} 0.0–1.0
 */
function jaccardSimilarity(a, b) {
  if (a.size === 0 && b.size === 0) return 1.0;
  if (a.size === 0 || b.size === 0) return 0.0;

  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return intersection / union;
}

/**
 * Compare a candidate document against a list of reference documents.
 *
 * @param {string} candidate - The text to check for plagiarism.
 * @param {Array<{title: string, content: string}>} references - Known source documents.
 * @param {object} [options]
 * @param {number} [options.ngramSize=3] - n-gram window size.
 * @param {number} [options.threshold=0.15] - Similarity score above which text is flagged.
 * @returns {{ overallScore: number, matches: Array, verdict: string }}
 */
function checkPlagiarism(candidate, references, options = {}) {
  const { ngramSize = 3, threshold = 0.15 } = options;

  const candidateTokens = tokenize(candidate);
  const candidateNgrams = buildNgrams(candidateTokens, ngramSize);

  const matches = references.map(({ title, content }) => {
    const refTokens = tokenize(content);
    const refNgrams = buildNgrams(refTokens, ngramSize);
    const score = jaccardSimilarity(candidateNgrams, refNgrams);
    return { title, score: parseFloat(score.toFixed(4)), flagged: score >= threshold };
  });

  const overallScore =
    matches.length > 0 ? Math.max(...matches.map((m) => m.score)) : 0;

  let verdict;
  if (overallScore < 0.05) {
    verdict = "ORIGINAL — No significant similarity detected.";
  } else if (overallScore < threshold) {
    verdict = "MOSTLY ORIGINAL — Minor similarity, likely coincidental phrasing.";
  } else if (overallScore < 0.4) {
    verdict = "POTENTIALLY PLAGIARISED — Moderate similarity with one or more sources. Review flagged matches.";
  } else {
    verdict = "LIKELY PLAGIARISED — High similarity detected. Immediate review required.";
  }

  return {
    overallScore: parseFloat(overallScore.toFixed(4)),
    verdict,
    matches: matches.filter((m) => m.flagged),
    allMatches: matches,
  };
}

module.exports = { checkPlagiarism, tokenize, buildNgrams, jaccardSimilarity };
