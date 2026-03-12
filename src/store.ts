import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type StorePaths = {
  configDir: string;
  stateDir: string;
  messagesFile: string;
  stateFile: string;
};

type MessageStore = {
  messages: string[];
};

type DisplayState = {
  lastShownOn: string | null;
};

export const APP_NAME = "motd-tool";
export const DEFAULT_MESSAGE = "Stay hungry, stay foolish.";

function resolveConfigHome(): string {
  return process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config");
}

function resolveStateHome(): string {
  return process.env.XDG_STATE_HOME || path.join(os.homedir(), ".local", "state");
}

function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath: string, value: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson<T>(filePath: string, fallbackValue: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallbackValue;
  }
}

function normalizeMessages(messages: unknown[]): string[] {
  const normalized = messages
    .map((message) => String(message).trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : [DEFAULT_MESSAGE];
}

export function getPaths(): StorePaths {
  const configDir = path.join(resolveConfigHome(), APP_NAME);
  const stateDir = path.join(resolveStateHome(), APP_NAME);

  return {
    configDir,
    stateDir,
    messagesFile: path.join(configDir, "messages.json"),
    stateFile: path.join(stateDir, "state.json")
  };
}

export function ensureStore(): StorePaths {
  const paths = getPaths();
  ensureDir(paths.configDir);
  ensureDir(paths.stateDir);

  if (!fs.existsSync(paths.messagesFile)) {
    writeJson(paths.messagesFile, { messages: [DEFAULT_MESSAGE] } satisfies MessageStore);
  }

  if (!fs.existsSync(paths.stateFile)) {
    writeJson(paths.stateFile, { lastShownOn: null } satisfies DisplayState);
  }

  return paths;
}

export function getMessages(): string[] {
  const { messagesFile } = ensureStore();
  const data = readJson<MessageStore>(messagesFile, { messages: [DEFAULT_MESSAGE] });
  return normalizeMessages(Array.isArray(data.messages) ? data.messages : [DEFAULT_MESSAGE]);
}

function saveMessages(messages: string[]): void {
  const { messagesFile } = ensureStore();
  writeJson(messagesFile, { messages });
}

export function addMessage(message: string): string {
  const nextMessage = String(message).trim();
  if (!nextMessage) {
    throw new Error("message cannot be empty");
  }

  const messages = getMessages();
  messages.push(nextMessage);
  saveMessages(messages);
  return nextMessage;
}

export function removeMessage(input: string): { removed: string; index: number } {
  const target = String(input).trim();
  if (!target) {
    throw new Error("remove requires an index or exact message");
  }

  const messages = getMessages();
  let index = Number.NaN;

  if (/^\d+$/.test(target)) {
    index = Number(target) - 1;
  } else {
    index = messages.findIndex((message) => message === target);
  }

  if (index < 0 || index >= messages.length) {
    throw new Error(`message not found: ${target}`);
  }

  const [removed] = messages.splice(index, 1);
  saveMessages(messages.length > 0 ? messages : [DEFAULT_MESSAGE]);
  return { removed, index };
}

export function importMessages(filePath: string): { imported: number; total: number } {
  const sourcePath = path.resolve(filePath);
  const raw = fs.readFileSync(sourcePath, "utf8");
  const imported = sourcePath.endsWith(".json")
    ? parseJsonMessages(raw)
    : raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (imported.length === 0) {
    throw new Error("no messages found in import file");
  }

  const current = getMessages();
  const merged = Array.from(new Set([...current, ...imported]));
  saveMessages(merged);
  return { imported: merged.length - current.length, total: merged.length };
}

export function exportMessages(filePath: string): { filePath: string; count: number } {
  const destinationPath = path.resolve(filePath);
  const messages = getMessages();
  const content = destinationPath.endsWith(".json")
    ? `${JSON.stringify(messages, null, 2)}\n`
    : `${messages.join("\n")}\n`;

  ensureDir(path.dirname(destinationPath));
  fs.writeFileSync(destinationPath, content, "utf8");
  return { filePath: destinationPath, count: messages.length };
}

function parseJsonMessages(raw: string): string[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("JSON import file must be an array of strings");
  }

  return parsed.map((message) => String(message).trim()).filter(Boolean);
}

export function pickRandomMessage(): string {
  const messages = getMessages();
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

export function getState(): DisplayState {
  const { stateFile } = ensureStore();
  return readJson<DisplayState>(stateFile, { lastShownOn: null });
}

export function setLastShownOn(isoDate: string): void {
  const { stateFile } = ensureStore();
  writeJson(stateFile, { lastShownOn: isoDate } satisfies DisplayState);
}
