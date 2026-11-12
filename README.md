<div align="center">
  <img src="assets/logo.svg" width="104" height="104" alt="Chaves" />
  <h1>Chaves</h1>
  <p><strong>Your API keys, links, and notes. Local, encrypted, and quiet.</strong></p>
  <p>No account. No cloud. No telemetry.</p>
</div>

<p align="center">
  <a href="https://github.com/ricarossetto/chaves/releases/latest"><img src="https://img.shields.io/github/v/release/ricarossetto/chaves?style=flat-square&color=6f7f5b" alt="Latest release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ricarossetto/chaves?style=flat-square&color=6f7f5b" alt="MIT license" /></a>
  <img src="https://img.shields.io/badge/platform-Windows%2010%2F11-5f6f75?style=flat-square" alt="Windows 10 and 11" />
  <img src="https://img.shields.io/badge/built%20with-Tauri%202-1e201d?style=flat-square" alt="Built with Tauri 2" />
</p>

<p align="center">
  <a href="README.pt-BR.md">Português</a> · <a href="README.zh-CN.md">中文</a>
</p>

---

Chaves is a small desktop vault for the credentials you use every day. Keep API keys and important links inside projects and folders, write quick notes, and unlock everything with one master password.

It is built for people who want a local tool, not another subscription: the vault is a single encrypted file on your computer, and the app never talks to a server.

## Why Chaves

API keys usually end up scattered across notes apps, spreadsheets, `.env` files, and browser bookmarks. Chaves gives them one quiet place:

- **Keys and links together.** Store an API key with its account, notes, and project. Store a link with the same context.
- **Projects, not a flat list.** Group credentials by client, service, or environment. Nested folders keep larger vaults tidy.
- **Search that stays out of the way.** Press the search field and filter across every project by name, account, URL, or note.
- **Notes for the details that do not fit.** Runbooks, renewal dates, and reminders live next to the credentials.
- **A real desktop app.** Native window, tray icon, keyboard-friendly forms, and no browser tab to lose.

## Features

- AES-256-GCM encrypted vault with an Argon2id-derived key.
- Projects, project folders, item folders, and fast filtering.
- API keys with masked values, reveal, copy, and account labels.
- Links with host preview, open, and copy actions.
- Markdown-free notes with debounced autosave.
- Optional Windows Hello unlock. The master password is protected with Windows DPAPI and never leaves the machine.
- Lock from the app or the tray. Closing the window can keep Chaves running in the background.
- Portuguese, English, and Chinese interface, with the choice saved locally.
- Import of older Chaves vaults.
- No account, no sync, no analytics, no network requests.

## Screenshot

<img src="assets/screenshot.png" alt="Chaves project view" width="1200" />

## Install

### Installer

1. Open the [latest release](https://github.com/ricarossetto/chaves/releases/latest).
2. Download `Chaves_*_x64-setup.exe`.
3. Run the installer and open Chaves.

The current builds are not code-signed. Windows SmartScreen may show a warning; choose **More info** → **Run anyway** if you trust the build.

### Portable

The release also includes the standalone `chaves-api.exe`. It needs the Microsoft Edge WebView2 runtime, which is already present on Windows 10 and 11. The installer is the recommended option because it registers the app in the Start menu and handles upgrades.

### First run

1. Create a master password with at least 8 characters. It cannot be recovered, so store it in a password manager.
2. Optionally enable Windows Hello on this PC.
3. Create a project and add your first key or link.

## Security model

- The entire vault is serialized and encrypted with **AES-256-GCM**.
- The encryption key is derived from the master password with **Argon2id** using 64 MiB of memory, 3 iterations, and 1 lane.
- Every save uses a fresh 12-byte nonce. The 16-byte salt is stored in the vault envelope.
- The master password is never written to disk.
- Windows Hello is optional. When enabled, the master password is encrypted with the current Windows user's **DPAPI** and stored in `hello.bin` next to the vault. Windows Hello verifies presence; the cryptographic protection still comes from Windows.
- Chaves makes no network requests. Fonts and assets are bundled with the app.

Chaves protects a vault file at rest. It does not protect against a compromised computer, malware, keyloggers, or someone who already controls your Windows session.

## Where data lives

By default:

```text
%APPDATA%\ChavesAPI\vault.json
```

The Windows Hello file, when enabled, sits next to it as `hello.bin`.

To use another location, set the `CHAVES_VAULT_PATH` environment variable to the full path of the vault file before opening the app. Back up `vault.json` and `hello.bin` together if you use Windows Hello.

## Build from source

### Requirements

- Windows 10 or 11
- Node.js 20 or newer
- Rust stable
- Visual Studio Build Tools with the Desktop development with C++ workload
- WebView2 runtime

### Build

```bash
git clone https://github.com/ricarossetto/chaves.git
cd chaves
npm install
npx tauri build
```

The installer is written to `src-tauri/target/release/bundle/nsis/`. For UI work only:

```bash
npm install
npm run dev
```

The Vite server runs on `http://localhost:1420`.

## Stack

- [Tauri 2](https://tauri.app/) and Rust for the vault, Windows Hello, and the tray.
- [React 19](https://react.dev/), TypeScript, Vite, Tailwind CSS v4.
- [shadcn/ui](https://ui.shadcn.com/) primitives and beUI components (MIT).
- Source Serif 4 for headings, Inter for the interface, IBM Plex Mono for keys and URLs.

## Contributing

Issues and pull requests are welcome. Before opening a PR:

1. Keep the change focused and explain the user-facing behavior.
2. Run `npm run build` and `cargo test --manifest-path src-tauri/Cargo.toml`.
3. Never commit a real vault, `hello.bin`, API keys, or personal paths.

## License

MIT. See [LICENSE](LICENSE).
