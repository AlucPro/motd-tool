import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HOOK_BEGIN = "# >>> xmotd >>>";
const HOOK_END = "# <<< xmotd <<<";

export function resolveRcFile(shellName?: string): string {
  const home = os.homedir();
  const shell = shellName || path.basename(process.env.SHELL || "");

  if (shell === "bash") {
    const bashProfile = path.join(home, ".bash_profile");
    return fs.existsSync(bashProfile) ? bashProfile : path.join(home, ".bashrc");
  }

  if (shell === "fish") {
    return path.join(home, ".config", "fish", "config.fish");
  }

  return path.join(home, ".zshrc");
}

export function getHookScript(shellName?: string): string {
  const shell = shellName || path.basename(process.env.SHELL || "");

  if (shell === "fish") {
    return [
      HOOK_BEGIN,
      "if status is-interactive",
      "  xmotd --auto 2>/dev/null; or true",
      "end",
      HOOK_END
    ].join("\n");
  }

  return [
    HOOK_BEGIN,
    'if [ -n "$PS1" ]; then',
    "  xmotd --auto 2>/dev/null || true",
    "fi",
    HOOK_END
  ].join("\n");
}

export function installHook(shellName?: string): { rcFile: string; changed: boolean } {
  const rcFile = resolveRcFile(shellName);
  const hook = getHookScript(shellName);
  const existing = fs.existsSync(rcFile) ? fs.readFileSync(rcFile, "utf8") : "";

  if (existing.includes(HOOK_BEGIN)) {
    return { rcFile, changed: false };
  }

  fs.mkdirSync(path.dirname(rcFile), { recursive: true });
  const prefix = existing && !existing.endsWith("\n") ? "\n" : "";
  fs.writeFileSync(rcFile, `${existing}${prefix}${hook}\n`, "utf8");

  return { rcFile, changed: true };
}
