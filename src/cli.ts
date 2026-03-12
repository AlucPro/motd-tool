import path from "node:path";
import { getHookScript, installHook, resolveRcFile } from "./hook";
import {
  addMessage,
  ensureStore,
  exportMessages,
  getMessages,
  getPaths,
  getState,
  importMessages,
  pickRandomMessage,
  removeMessage,
  setLastShownOn
} from "./store";

function printHelp(): void {
  console.log(`xmotd - tiny message of the day CLI

Usage:
  xmotd
  xmotd add "Your message"
  xmotd remove <index|exact message>
  xmotd list
  xmotd import <file.json|file.txt>
  xmotd export <file.json|file.txt>
  xmotd init [zsh|bash|fish]
  xmotd hook [zsh|bash|fish]
  xmotd paths

Options:
  --auto    Print only on the first terminal session of the day
  -h, --help
  -v, --version`);
}

function printVersion(): void {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require(path.join(__dirname, "..", "..", "package.json")) as { version: string };
  console.log(pkg.version);
}

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function printRandomMessage(): void {
  ensureStore();
  console.log(pickRandomMessage());
}

export function maybePrintAutoMessage(): boolean {
  ensureStore();
  const today = todayIsoDate();
  const state = getState();

  if (state.lastShownOn === today) {
    return false;
  }

  console.log(pickRandomMessage());
  setLastShownOn(today);
  return true;
}

function printMessages(): void {
  getMessages().forEach((message, index) => {
    console.log(`${index + 1}. ${message}`);
  });
}

function handleInit(shellName?: string): void {
  const shell = shellName || path.basename(process.env.SHELL || "");
  const result = installHook(shell);

  if (result.changed) {
    console.log(`Installed xmotd shell hook in ${result.rcFile}`);
    console.log("Open a new terminal to see the first message of each day.");
    return;
  }

  console.log(`xmotd shell hook already exists in ${result.rcFile}`);
}

function handlePaths(): void {
  const paths = getPaths();
  console.log(`config: ${paths.configDir}`);
  console.log(`messages: ${paths.messagesFile}`);
  console.log(`state: ${paths.stateFile}`);
  console.log(`shellrc: ${resolveRcFile()}`);
}

export async function run(argv: string[]): Promise<void> {
  const [command, ...rest] = argv;

  if (!command) {
    printRandomMessage();
    return;
  }

  if (command === "--auto") {
    maybePrintAutoMessage();
    return;
  }

  if (command === "-h" || command === "--help" || command === "help") {
    printHelp();
    return;
  }

  if (command === "-v" || command === "--version" || command === "version") {
    printVersion();
    return;
  }

  if (command === "add") {
    const added = addMessage(rest.join(" ").trim());
    console.log(`Added: ${added}`);
    return;
  }

  if (command === "remove") {
    const target = rest.join(" ").trim();
    const result = removeMessage(target);
    console.log(`Removed #${result.index + 1}: ${result.removed}`);
    return;
  }

  if (command === "list") {
    printMessages();
    return;
  }

  if (command === "import") {
    const filePath = rest[0];
    if (!filePath) {
      throw new Error("import requires a file path");
    }

    const result = importMessages(filePath);
    console.log(`Imported ${result.imported} message(s). Total: ${result.total}`);
    return;
  }

  if (command === "export") {
    const filePath = rest[0];
    if (!filePath) {
      throw new Error("export requires a file path");
    }

    const result = exportMessages(filePath);
    console.log(`Exported ${result.count} message(s) to ${result.filePath}`);
    return;
  }

  if (command === "init") {
    handleInit(rest[0]);
    return;
  }

  if (command === "hook") {
    console.log(getHookScript(rest[0]));
    return;
  }

  if (command === "paths") {
    handlePaths();
    return;
  }

  throw new Error(`unknown command "${command}"`);
}
