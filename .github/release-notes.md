Chaves is a local-first Windows, macOS, and Linux vault for API keys, links, and notes.

## What's new in 0.4.0

This release is about the feel of the app: the same vault, but it now reads as a
physical object instead of a form.

### Fixed

- **The item action menu never appeared.** The `...` button on a card depended on
  a `group-hover/card` class that no ancestor defined, so it stayed invisible and
  hover-only users could not edit or delete an item. Hovering a card now reveals
  the menu, as intended.
- **`border-border-strong` compiled to nothing.** The utility was used for hover
  borders but the `--border-strong` token did not exist, so the class had no
  effect. The token is defined and the hover hairline is visible.
- **Copy failures were silent.** The new copy confirmation replaced the toast, so
  a failed clipboard write is now reported instead of looking like success.

### Interface

- Paper grain across the whole window: one tiled SVG turbulence, a few hundred
  bytes, no image file and no network request. It disables itself when the system
  asks for more contrast.
- Selection is a single surface that slides between options instead of two
  backgrounds trading places: view switcher, type filter, folder chips, the active
  project rail, and the key/link switch in the item dialog.
- Copying a key or link confirms in place, where the eye already is: the icon
  crossfades into a check in 80ms and the toast is reserved for failures.
- A wrong master password shakes the card once, for 280ms, and stops.
- Unlocking shows a hairline sweeping across the base of the card while the key
  is derived, instead of an indefinite spinner.
- Notes got a ruled margin and a quiet "Saving…" / "Saved" indicator.
- Deleting is a two-beat: the button arms into "Confirm deletion" and waits four
  seconds, instead of a single irreversible click.
- `Ctrl K` (or `⌘K`) focuses search; `Esc` clears it.
- Empty states are drawn as dashed cards with the action you need inside them.

### Tray

- The tray icon is now its own glyph, drawn at runtime (signed distance field,
  4x4 supersampling, 32px): same key, no plate, no terracotta dot, and a stroke
  thick enough to survive a 16px slot. It follows the taskbar colour on Windows
  and flips with the menu bar on macOS.

### Motion

- One motion scale for the whole app, taken from the transitions.dev token set
  and mapped onto this app's vocabulary, replacing per-file durations.
- A global `MotionConfig` now honours the OS reduced-motion setting. Every new
  animation also has its own guard; the app stays fully legible with motion off.

### Under the hood

- Four Rust tests cover the generated tray glyph: size, shape topology, colour,
  and that it still has mass at 16px.
- `npx tsc --noEmit`, `npm run build` and `cargo test` (11 tests) pass.

## Downloads

| Platform | File |
| --- | --- |
| Windows 10/11 x64 | `Chaves_*_x64-setup.exe` |
| Windows 11 ARM64 | `Chaves_*_arm64-setup.exe` |
| macOS Apple Silicon | `Chaves_*_aarch64.dmg` |
| macOS Intel | `Chaves_*_x64.dmg` |
| Linux x64 | `*.AppImage` or `*.deb` |

Portable binaries are included for Windows, Linux, and macOS. `SHA256SUMS.txt` contains the checksums for every asset.

## Notes

- The Windows builds are not code-signed. SmartScreen may show a warning; choose **More info** → **Run anyway**.
- The macOS builds are unsigned and not notarized. On first launch, right-click Chaves in Finder and choose **Open**, or run `sudo xattr -dr com.apple.quarantine /Applications/Chaves.app`.
- The Linux AppImage needs WebKitGTK 4.1 and the Ayatana app indicator. On Debian/Ubuntu: `sudo apt install libwebkit2gtk-4.1-0 libayatana-appindicator3-1`.
- Windows Hello is available only on Windows.

## Security

The vault is encrypted with AES-256-GCM. The key is derived from the master password with Argon2id (64 MiB, 3 iterations, 1 lane). Chaves does not use an account, cloud sync, telemetry, or network requests.

## Links

- [English README](https://github.com/ricarossetto/chaves/blob/main/README.md)
- [README em português](https://github.com/ricarossetto/chaves/blob/main/README.pt-BR.md)
- [中文说明](https://github.com/ricarossetto/chaves/blob/main/README.zh-CN.md)
