import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function createTempHomes(): { root: string; config: string; state: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "xmotd-"));
  const config = path.join(root, "config");
  const state = path.join(root, "state");
  process.env.XDG_CONFIG_HOME = config;
  process.env.XDG_STATE_HOME = state;
  return { root, config, state };
}

test("store initializes with a default message", async () => {
  createTempHomes();
  const { getMessages } = await import("../src/store");
  const messages = getMessages();

  assert.equal(messages.length, 1);
  assert.equal(messages[0], "Stay hungry, stay foolish.");
});

test("add appends messages to the local store", async () => {
  createTempHomes();
  const { addMessage, getMessages } = await import("../src/store");

  addMessage("Code is poetry");
  const messages = getMessages();

  assert.deepEqual(messages, ["Stay hungry, stay foolish.", "Code is poetry"]);
});

test("remove accepts an index", async () => {
  createTempHomes();
  const { addMessage, getMessages, removeMessage } = await import("../src/store");

  addMessage("Code is poetry");
  const removed = removeMessage("2");

  assert.equal(removed.removed, "Code is poetry");
  assert.deepEqual(getMessages(), ["Stay hungry, stay foolish."]);
});

test("import/export handles text files", async () => {
  const { root } = createTempHomes();
  const { exportMessages, importMessages, getMessages } = await import("../src/store");
  const importFile = path.join(root, "messages.txt");
  const exportFile = path.join(root, "export.json");

  fs.writeFileSync(importFile, "Code is poetry\nShip it\n", "utf8");
  const imported = importMessages(importFile);
  const exported = exportMessages(exportFile);

  assert.equal(imported.imported, 2);
  assert.equal(exported.count, getMessages().length);
  assert.deepEqual(JSON.parse(fs.readFileSync(exportFile, "utf8")), getMessages());
});

test("auto mode only prints once per day", async () => {
  createTempHomes();
  const { maybePrintAutoMessage } = await import("../src/cli");
  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (value?: unknown) => logs.push(String(value));

  try {
    assert.equal(maybePrintAutoMessage(), true);
    assert.equal(maybePrintAutoMessage(), false);
  } finally {
    console.log = originalLog;
  }

  assert.equal(logs.length, 1);
});
