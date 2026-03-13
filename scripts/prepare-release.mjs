import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const formulaPath = path.join(root, "Formula", "motd-tool.rb");
const version = packageJson.version;
const tarballName = `motd-tool-${version}.tgz`;
const tarballPath = path.join(root, tarballName);

if (!fs.existsSync(tarballPath)) {
  console.log(`Tarball not found: ${tarballName}`);
  console.log("Run: pnpm pack");
  process.exit(1);
}

const sha256 = crypto.createHash("sha256").update(fs.readFileSync(tarballPath)).digest("hex");
const formula = fs.readFileSync(formulaPath, "utf8")
  .replace(
    /https:\/\/github\.com\/AlucPro\/motd-tool\/releases\/download\/v\d+\.\d+\.\d+\/motd-tool-\d+\.\d+\.\d+\.tgz|https:\/\/registry\.npmjs\.org\/motd-tool\/-\/motd-tool-\d+\.\d+\.\d+\.tgz/,
    `https://github.com/AlucPro/motd-tool/releases/download/v${version}/motd-tool-${version}.tgz`
  )
  .replace(/sha256 "[^"]+"/, `sha256 "${sha256}"`);

fs.writeFileSync(formulaPath, formula, "utf8");

console.log(`Updated Formula/motd-tool.rb for v${version}`);
console.log(`sha256: ${sha256}`);
