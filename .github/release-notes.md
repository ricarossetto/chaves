Chaves is a local-first Windows, macOS, and Linux vault for API keys, links, and notes.

## What's new in 0.3.1

- Window animations for opening, minimizing, restoring, closing to the tray, and quitting.
- Windows Hello now opens owned by the app window, so the prompt no longer appears behind Chaves.
- Page transitions between projects and notes, with reduced-motion support.
- Dialog entrances and exits slowed to 200ms for a less abrupt feel.

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
