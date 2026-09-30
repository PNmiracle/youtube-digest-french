const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.resolve(__dirname, "..", "sidepanel.js"), "utf8");

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function createPanel() {
  const requests = new Map();
  const saved = [];
  const nodes = new Map();
  const node = (id) => {
    if (!nodes.has(id)) {
      nodes.set(id, {
        style: {},
        classList: { toggle() {} },
        innerHTML: "",
        textContent: "",
      });
    }
    return nodes.get(id);
  };
  const events = { addListener() {} };
  const sandbox = vm.createContext({
    console,
    URL,
    setTimeout() { return 1; },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    document: {
      addEventListener() {},
      getElementById: node,
      querySelectorAll() { return []; },
    },
    window: { close() {} },
    chrome: {
      runtime: {
        onMessage: events,
        sendMessage(message) {
          const request = deferred();
          requests.set(`${message.action}:${message.videoId || ""}`, request);
          return request.promise;
        },
      },
      tabs: { onUpdated: events, onActivated: events },
      windows: { getCurrent: async () => ({ id: 1 }) },
      storage: { local: {
        get: async () => ({}),
        set: async (value) => saved.push(value),
        remove: async () => {},
      } },
    },
  });
  vm.runInContext(source, sandbox);
  vm.runInContext(`
    loadTranscriptViewState = async () => null;
    loadDisplayLanguageMode = async () => "original";
    renderTranscript = () => {};
    showState = () => {};
    updateLoading = () => {};
    restorePendingTranscriptViewState = () => {};
    loadNotes = () => {};
    setupExplainFeature = () => {};
    resultTabIsActive = () => false;
    evictOldCacheEntries = async () => {};
  `, sandbox);
  return { sandbox, requests, saved, nodes };
}

async function waitForRequest(requests, key) {
  for (let i = 0; i < 20 && !requests.has(key); i += 1) {
    await Promise.resolve();
  }
  assert.ok(requests.has(key), `request ${key} was sent`);
}

test("late transcript response cannot replace the next video's transcript or cache", async () => {
  const panel = createPanel();
  const a = "AAAAAAAAAAA";
  const b = "BBBBBBBBBBB";
  const first = vm.runInContext(`startDigest("${a}", "https://www.youtube.com/watch?v=${a}")`, panel.sandbox);
  await waitForRequest(panel.requests, `fetchTranscript:${a}`);
  const second = vm.runInContext(`startDigest("${b}", "https://www.youtube.com/watch?v=${b}")`, panel.sandbox);
  await waitForRequest(panel.requests, `fetchTranscript:${b}`);

  panel.requests.get(`fetchTranscript:${b}`).resolve({
    success: true,
    transcript: [{ start: 0, text: "Video B" }],
    transcriptText: "Video B",
    transcriptTextTimestamped: "[0:00] Video B",
  });
  await second;
  panel.requests.get(`fetchTranscript:${a}`).resolve({
    success: true,
    transcript: [{ start: 0, text: "Video A" }],
    transcriptText: "Video A",
    transcriptTextTimestamped: "[0:00] Video A",
  });
  await first;

  assert.equal(vm.runInContext("currentVideoId", panel.sandbox), b);
  assert.equal(vm.runInContext("currentTranscriptText", panel.sandbox), "Video B");
  assert.equal(panel.saved.length, 1);
  assert.equal(panel.saved[0][`digest_${b}`].transcriptText, "Video B");
});

test("legacy cache without video identity is refetched", async () => {
  const panel = createPanel();
  const videoId = "BBBBBBBBBBB";
  panel.sandbox.chrome.storage.local.get = async () => ({
    [`digest_${videoId}`]: { transcriptText: "wrong video", timestamp: Date.now() },
  });
  let removed;
  panel.sandbox.chrome.storage.local.remove = async (key) => { removed = key; };
  const result = await vm.runInContext(`loadFromCache("${videoId}")`, panel.sandbox);
  assert.equal(result, null);
  assert.equal(removed, `digest_${videoId}`);
});

test("late Overview response cannot appear under the next video", async () => {
  const panel = createPanel();
  vm.runInContext(`
    currentVideoId = "AAAAAAAAAAA";
    currentTranscriptTimestamped = "[0:00] Video A";
    currentTranscript = [{ start: 0, text: "Video A" }];
    renderAnalysisResults = () => { throw new Error("stale Overview rendered"); };
    highlightMomentsOnPage = () => {};
  `, panel.sandbox);
  const analysis = vm.runInContext("triggerAnalysis()", panel.sandbox);
  await waitForRequest(panel.requests, "analyzeTranscript:");
  vm.runInContext(`digestGeneration += 1; currentVideoId = "BBBBBBBBBBB"; currentAnalysis = null;`, panel.sandbox);
  panel.requests.get("analyzeTranscript:").resolve({
    success: true,
    analysis: { chapters: [{ title: "Video A" }] },
  });
  await analysis;
  assert.equal(vm.runInContext("currentAnalysis", panel.sandbox), null);
  assert.equal(panel.saved.length, 0);
});
