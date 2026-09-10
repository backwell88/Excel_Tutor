# Changelog

## v0.2.0 (2026-09-10)

- Version: v0.2.0
- Summary: Added Microsoft Office automatic desktop sideloading commands and a Chinese usage guide, avoiding the incorrect Developer XML Tools import path.
- Changed files: `package.json`, `package-lock.json`, `DESKTOP_SIDELOAD_GUIDE.md`, and `CHANGELOG.md`.
- Rollback: Run `npm.cmd uninstall --save-dev office-addin-debugging`, remove `start:desktop` and `stop:desktop` from `package.json`, restore the version to v0.1.2, then run `npm.cmd install`.
## v0.1.2 (2026-09-10)

- Version: v0.1.2
- Summary: Removed manifest icon references that pointed to non-existent localhost PNG assets and blocked reliable Excel installation.
- Changed files: `manifest.xml`, `package.json`, `package-lock.json`, and `CHANGELOG.md`.
- Rollback: Run `git revert <v0.1.2 commit-hash>` after commit, or restore `manifest.xml`, `package.json`, and `package-lock.json` from v0.1.1.
## v0.1.1 (2026-09-09)

- Version: v0.1.1
- Summary: Use trusted Office development certificates for the local HTTPS server, so desktop Excel can load the XML add-in.
- Changed files: `package.json`, `package-lock.json`, `vite.config.ts`, `README.md`, `IMPLEMENTATION_GUIDE.md`, and `CHANGELOG.md`.
- Rollback: Run `npm.cmd uninstall --save-dev office-addin-dev-certs`, restore `vite.config.ts` from v0.1.0, then run `npm.cmd install`.

## v0.1.0 (2026-09-09)

- Version: v0.1.0
- Summary: Implemented the Excel Tutor MVP as a local Excel 365 Office Add-in with a DeepSeek proxy, minimal context reading, and workbook-local notes.
- Changed files: `.env.example`, `.gitignore`, `CHANGELOG.md`, `IMPLEMENTATION_GUIDE.md`, `README.md`, `index.html`, `manifest.xml`, `package.json`, `package-lock.json`, `server/index.ts`, `src/**`, `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts`.
- Rollback: After the initial Git commit, run `git revert <commit-hash>`. Before committing, remove this working tree with `git clean -fd` and restore tracked files with `git restore .`.