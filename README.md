# motd-tool

Tiny CLI that prints a random message of the day in your terminal.

`xmotd` is built for developers who live in the shell and want something lighter than a dashboard, but more personal than a static prompt.

## Why people install it

- `xmotd` prints a random line from your own local message library
- `xmotd init` shows one message automatically on the first terminal session of each day
- `xmotd add`, `remove`, `list`, `import`, and `export` keep the message library simple
- It is local-first, fast, and dependency-light at runtime

## Quick look

```bash
$ xmotd
Stay hungry, stay foolish.
```

```bash
$ xmotd add "Code is poetry"
Added: Code is poetry
```

```bash
$ xmotd list
1. Stay hungry, stay foolish.
2. Code is poetry
```

```bash
$ xmotd remove 2
Removed #2: Code is poetry
```

## Install

Install from npm:

```bash
npm install -g motd-tool
```

Install from Homebrew:

```bash
brew install AlucPro/tap/motd-tool
```

The Homebrew formula downloads the release tarball from GitHub Releases.

For local development, this repository uses `pnpm` and TypeScript:

```bash
pnpm install
pnpm check
```

## Usage

Print a random message:

```bash
xmotd
```

Add a message:

```bash
xmotd add "Ship small, ship often"
```

Remove a message by index or exact text:

```bash
xmotd remove 2
xmotd remove "Ship small, ship often"
```

List all messages:

```bash
xmotd list
```

Import messages from `.txt` or `.json`:

```bash
xmotd import ./messages.txt
xmotd import ./messages.json
```

Export your current library:

```bash
xmotd export ./backup.json
xmotd export ./backup.txt
```

Enable once-per-day automatic output in your shell:

```bash
xmotd init
```

Preview the shell hook:

```bash
xmotd hook
```

See where files are stored:

```bash
xmotd paths
```

## Default behavior

After installation, `xmotd` starts with one built-in message:

```text
Stay hungry, stay foolish.
```

Every manual `xmotd` run selects a random message from your local library.

The automatic shell hook uses a separate state file so the message only appears once per local calendar day.

## Message storage

`xmotd` stores data in standard XDG-style locations:

- Config: `~/.config/motd-tool/messages.json`
- State: `~/.local/state/motd-tool/state.json`

You can override these with `XDG_CONFIG_HOME` and `XDG_STATE_HOME`.

## Release workflow

Project maintainers can use:

```bash
pnpm release:check
```

`pnpm release:check` runs build and tests, then updates the Homebrew formula SHA based on the npm tarball.

Release flow:

1. Update `package.json` version
2. Commit the release changes
3. Push `main`
4. Create and push a matching tag such as `v1.0.1`

```bash
git add .
git commit -m "release: v1.0.1"
git push origin main
git tag v1.0.1
git push origin v1.0.1
```

When the tag lands on GitHub, the `Release` workflow will:

- build and test the project
- publish `motd-tool` to npm with `NPM_TOKEN`
- rebuild the Homebrew formula with the new npm tarball SHA
- point the Homebrew formula at the matching GitHub Release asset
- push `Formula/motd-tool.rb` to `AlucPro/homebrew-tap` with `HOMEBREW_TAP_TOKEN`
- create a GitHub Release with the packaged tarball

GitHub Actions included in this repo:

- `CI`: install, build, test, and pack on pushes and pull requests
- `Release`: publish to npm, update the Homebrew tap, and attach the package tarball when a `v*` tag is pushed

## Contributing

Issues and pull requests are welcome.

The easiest way to contribute is to improve the default message set, shell support, and installation experience.

## License

MIT
