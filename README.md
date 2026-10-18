# Character and Word Counter

A live text-analysis tool built with **HTML5, CSS3, and JavaScript**.
This project is part of my Web Development Internship at **Veda Technology** (Task 18).


## 📌 About the Project

Users type or paste text into a text area, and the page counts characters, words, and sentences as they type. It also shows reading time, speaking time, and the most used words.

## 🎯 Objective

To practice input events, string methods, and live DOM updates.

## ✨ Features

- Live character, word, and sentence counts
- Paragraph count and characters without spaces
- Reading time (200 words per minute) and speaking time (130 words per minute)
- Longest word and average word length
- Top 5 most used words (common words like "the" and "and" are ignored)
- Optional character limit with a progress bar (SMS, X post, or LinkedIn post)
- Warning colour near the limit and red when over it
- Sample text, Copy text, and Clear buttons
- Handles empty text, extra spaces, tabs, new lines, emoji, and non-English text
- Responsive layout (side by side on desktop, stacked on mobile)

## 🧠 How It Works

**Counting words**

Trim the text first, then split it on any run of whitespace. If the text is empty, the count is 0.

```js
function getWords(text) {
  const trimmed = text.trim();
  return trimmed === "" ? [] : trimmed.split(/\s+/);
}
```

- **Why trim?** Without it, leading or trailing spaces create empty pieces and the count is wrong.
- **Why `/\s+/`?** It treats multiple spaces, tabs, and new lines between words as one separator.

**Counting sentences**

A sentence ends with `.`, `!`, or `?` followed by a space or the end of the text. Requiring the space means a decimal like `3.14` is not split in two.

```js
text.split(/[.!?]+(?=\s|$)/).filter((part) => part.trim() !== "").length;
```

**Counting characters**

`Array.from(text).length` counts real characters, so an emoji counts as 1 instead of 2.

**Live updates**

The `input` event on the textarea runs on every keystroke, paste, cut, and delete, so the numbers always match the text.

```js
textEl.addEventListener("input", update);
```

### Known limitation

Abbreviations such as "Dr." are counted as the end of a sentence. Most online counters have the same limitation.

## 🛠️ Technologies Used

- HTML5 (textarea, select, definition list)
- CSS3 (Grid, Flexbox, CSS variables, animations)
- JavaScript (string methods, regular expressions, DOM, events, Clipboard API)

## 📚 What I Learned

- Using the `input` event for live updates
- String methods: `trim()`, `split()`, `replace()`, and `filter()`
- Writing regular expressions for whitespace and sentence endings
- Why trimming and splitting on `/\s+/` gives accurate word counts
- Handling edge cases like empty text, emoji, and extra spaces
- Updating many parts of the page from one `update()` function

## 📁 Project Structure

```
word-counter/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🚀 How to Run

1. Download or clone this repository.
2. Open the folder.
3. Double-click `index.html` to open it in your browser.

## 👩‍💻 Author

**Priya Vijay Tambe**

