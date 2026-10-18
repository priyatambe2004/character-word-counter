/* ---------- Counting functions ---------- */

// Words: trim first, then split on ANY run of whitespace (spaces, tabs, new lines).
// "\s+" treats several spaces in a row as one separator, so extra spaces never create fake words.
function getWords(text) {
  const trimmed = text.trim();
  return trimmed === "" ? [] : trimmed.split(/\s+/);
}

// Sentences: a sentence ends with . ! or ? followed by a space or the end of the text.
// Requiring the space means "3.14" is not split in two.
function countSentences(text) {
  return text.split(/[.!?]+(?=\s|$)/).filter((part) => part.trim() !== "").length;
}

// Paragraphs: blocks of text separated by one or more blank lines
function countParagraphs(text) {
  return text.split(/\n\s*\n/).filter((part) => part.trim() !== "").length;
}

// Array.from counts real characters, so an emoji counts as 1 instead of 2
function countChars(text) {
  return Array.from(text).length;
}

// Removes punctuation from the start and end of a word: "world!" -> "world"
function cleanWord(word) {
  return word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

const STOP_WORDS = new Set(["the", "and", "for", "that", "with", "you", "are", "was", "this", "have", "from", "not", "but", "your", "will", "can", "all", "they", "their", "has", "had", "its", "our", "were", "been", "who", "what", "when", "where", "how", "there", "than", "then", "also", "into", "just", "more"]);

function getTopWords(words, limit = 5) {
  const counts = {};
  words.map((w) => cleanWord(w).toLowerCase())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
    .forEach((w) => { counts[w] = (counts[w] || 0) + 1; });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

// Turns a number of seconds into "45 sec" or "2 min 10 sec"
function formatTime(seconds) {
  if (seconds < 1) return "0 sec";
  if (seconds < 60) return Math.round(seconds) + " sec";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  return rest === 0 ? minutes + " min" : `${minutes} min ${rest} sec`;
}

// Collects every statistic in one object
function analyze(text) {
  const words = getWords(text);
  const cleaned = words.map(cleanWord).filter((w) => w !== "");
  const longest = cleaned.reduce((a, b) => (Array.from(b).length > Array.from(a).length ? b : a), "");
  const totalLetters = cleaned.reduce((sum, w) => sum + Array.from(w).length, 0);

  return {
    chars: countChars(text),
    charsNoSpaces: countChars(text.replace(/\s/g, "")),
    words: words.length,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readSeconds: (words.length / 200) * 60,   // average reading speed: 200 words per minute
    speakSeconds: (words.length / 130) * 60,  // average speaking speed: 130 words per minute
    longest,
    avgLength: cleaned.length === 0 ? 0 : totalLetters / cleaned.length,
    topWords: getTopWords(words)
  };
}

/* ---------- Page elements ---------- */
const $ = (id) => document.getElementById(id);
const textEl = $("text"), limitEl = $("limit"), toastEl = $("toast");
let toastTimer;
let previous = { chars: 0, words: 0, sentences: 0, paragraphs: 0 };

/* ---------- Updating the screen ---------- */
function setNumber(id, value) {
  const el = $(id);
  const changed = el.textContent !== String(value);
  el.textContent = value;
  if (changed && el.parentElement.classList.contains("big")) {
    const box = el.parentElement;
    box.classList.remove("bump");
    void box.offsetWidth;          // restart the little animation
    box.classList.add("bump");
  }
}

function renderLimit(chars) {
  const limit = Number(limitEl.value);
  const bar = $("limit-bar"), fill = $("limit-fill"), message = $("limit-text");
  bar.hidden = limit === 0;
  textEl.classList.toggle("over", limit > 0 && chars > limit);
  if (limit === 0) return;

  const percent = Math.min(100, (chars / limit) * 100);
  fill.style.width = percent + "%";
  fill.classList.toggle("warn", chars >= limit * 0.9 && chars <= limit);
  fill.classList.toggle("over", chars > limit);
  message.classList.toggle("over", chars > limit);
  message.textContent = chars > limit
    ? `${(chars - limit).toLocaleString()} characters over the limit`
    : `${chars.toLocaleString()} / ${limit.toLocaleString()} · ${(limit - chars).toLocaleString()} left`;
}

function renderTopWords(topWords) {
  const list = $("top-words");
  list.innerHTML = "";
  $("top-empty").hidden = topWords.length > 0;
  topWords.forEach(([word, count]) => {
    const li = document.createElement("li");
    li.textContent = word + " ";
    const badge = document.createElement("span");
    badge.textContent = count;
    li.appendChild(badge);
    list.appendChild(li);
  });
}

// Runs every time the text changes
function update() {
  const s = analyze(textEl.value);

  setNumber("s-chars", s.chars.toLocaleString());
  setNumber("s-words", s.words.toLocaleString());
  setNumber("s-sentences", s.sentences.toLocaleString());
  setNumber("s-paragraphs", s.paragraphs.toLocaleString());
  $("s-nospace").textContent = s.charsNoSpaces.toLocaleString();
  $("s-read").textContent = formatTime(s.readSeconds);
  $("s-speak").textContent = formatTime(s.speakSeconds);
  $("s-longest").textContent = s.longest || "–";
  $("s-avg").textContent = s.avgLength.toFixed(1);

  renderTopWords(s.topWords);
  renderLimit(s.chars);
}

/* ---------- Events ---------- */
// The "input" event fires on every keystroke, paste, cut and delete
textEl.addEventListener("input", update);
limitEl.addEventListener("change", update);

$("clear").addEventListener("click", () => {
  textEl.value = "";
  update();
  textEl.focus();
});

$("sample").addEventListener("click", () => {
  textEl.value =
    "Learning web development is exciting. Every project teaches something new! " +
    "Today I built a counter that updates while I type. Can you guess how it works?\n\n" +
    "It listens for the input event, splits the text on whitespace, and updates the page. " +
    "Small projects like this make JavaScript feel much easier.";
  update();
  textEl.focus();
});

function showToast(message) {
  toastEl.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.textContent = ""), 2200);
}

$("copy").addEventListener("click", async () => {
  if (textEl.value === "") return showToast("There is no text to copy yet.");
  try {
    await navigator.clipboard.writeText(textEl.value);
    showToast("Text copied!");
  } catch {
    textEl.select();
    showToast(document.execCommand("copy") ? "Text copied!" : "Could not copy. Please copy it manually.");
  }
});

/* ---------- Start ---------- */
update();
