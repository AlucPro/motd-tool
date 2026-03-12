const os = require("os");
const path = require("path");

const shell = path.basename(process.env.SHELL || "");
const rcFile =
  shell === "bash"
    ? path.join(os.homedir(), ".bashrc")
    : shell === "fish"
      ? path.join(os.homedir(), ".config", "fish", "config.fish")
      : path.join(os.homedir(), ".zshrc");

console.log("motd-tool installed.");
console.log('Run "xmotd" to print a random message.');
console.log(`Run "xmotd init ${shell || "zsh"}" to enable once-per-day terminal messages in ${rcFile}.`);
console.log('Run "xmotd --help" to see add/remove/import/export commands.');
