const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function loadVocabularyHelpers() {
  const listeners = { addListener() {} };
  const sandbox = {
    console,
    URL,
    TextDecoder,
    TextEncoder,
    setTimeout: () => 0,
    clearTimeout() {},
    setInterval() {},
    clearInterval() {},
    IntersectionObserver: class {},
    CSS: { escape: (value) => value },
    window: { getSelection: () => null, close() {} },
    document: {
      addEventListener() {},
      querySelectorAll: () => [],
      querySelector: () => null,
      getElementById: () => null,
      createElement: () => {
        let value = "";
        return {
          set textContent(text) {
            value = String(text);
          },
          get innerHTML() {
            return value
              .replaceAll("&", "&amp;")
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll('"', "&quot;");
          },
        };
      },
    },
    chrome: {
      runtime: { onMessage: listeners, sendMessage: () => Promise.resolve({}) },
      windows: { getCurrent: () => Promise.resolve({ id: 1 }) },
      tabs: { onUpdated: listeners, onActivated: listeners },
    },
    YTD_SETTINGS: {},
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(read("sidepanel.js"), sandbox);
  return sandbox.__YTD_TRANSCRIPT_TESTING__;
}

test("vocabulary matching ignores case and protects word boundaries", () => {
  const { findVocabularyMatches } = loadVocabularyHelpers();
  const result = findVocabularyMatches("Agent agents agentic AGENT", [
    { id: "word-1", term: "agent" },
  ]);

  assert.deepEqual(
    JSON.parse(JSON.stringify(result.map(({ start, end }) => ({ start, end })))),
    [
      { start: 0, end: 5 },
      { start: 21, end: 26 },
    ],
  );
});

test("longer saved phrases win over overlapping individual words", () => {
  const { findVocabularyMatches } = loadVocabularyHelpers();
  const result = findVocabularyMatches("machine learning helps learning", [
    { id: "word-1", term: "learning" },
    { id: "word-2", term: "machine learning" },
  ]);

  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        result.map(({ start, end, entry }) => ({ start, end, id: entry.id })),
      ),
    ),
    [
      { start: 0, end: 16, id: "word-2" },
      { start: 23, end: 31, id: "word-1" },
    ],
  );
});

test("vocabulary UI and local-storage message flow are wired", () => {
  const html = read("sidepanel.html");
  const panel = read("sidepanel.js");
  const background = read("background.js");

  assert.match(html, /data-tab="vocabulary"[\s\S]*id="vocabularyList"/);
  assert.match(panel, /class="selection-vocabulary-btn"[\s\S]*Save word/);
  assert.match(panel, /event\.key\?\.toLocaleLowerCase\(\) === "w"/);
  assert.match(panel, /tooltip\.style\.display === "none"/);
  assert.match(panel, /input, textarea, select, \[contenteditable='true'\]/);
  assert.match(panel, /action:\s*"saveVocabulary"/);
  assert.match(panel, /applyVocabularyHighlights\(transcriptList\)/);
  assert.match(background, /VOCABULARY_STORAGE_KEY = "ytd_vocabulary"/);
  assert.match(background, /action === "deleteVocabulary"/);
});
