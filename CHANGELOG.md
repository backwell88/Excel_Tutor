# Changelog

## v0.3.2 (2026-09-10)

- Version: v0.3.2
- Summary: Consolidated reader documentation into README, renamed the desktop deployment troubleshooting guide in Chinese, and added a minimal Chinese quick-use guide.
- Changed files: `README.md`, `无脑使用步骤.md`, `部署阶段问题及相关说明.md`, `IMPLEMENTATION_GUIDE.md` (deleted), `DESKTOP_SIDELOAD_GUIDE.md` (deleted), `PERSISTENT_CATALOG_GUIDE.md` (deleted), `package.json`, `package-lock.json`, and `CHANGELOG.md`.
- Rollback: Run `git revert <v0.3.2 commit-hash>` after commit to restore the prior document structure.
## v0.3.1 (2026-09-10)

- Version: v0.3.1
- Summary: Added a reader-friendly retrospective explaining today’s desktop Excel add-in installation, manifest, cache, and persistent catalog troubleshooting.
- Changed files: `DESKTOP_EXCEL_TROUBLESHOOTING.md`, `package.json`, `package-lock.json`, and `CHANGELOG.md`.
- Rollback: Run `git revert <v0.3.1 commit-hash>` after commit, or remove `DESKTOP_EXCEL_TROUBLESHOOTING.md` and restore the previous version fields.
## v0.3.0 (2026-09-10)

- Version: v0.3.0
- Summary: Added a secure local trusted catalog workflow so Excel Tutor can be added to ordinary desktop workbooks instead of only a temporary debugging workbook.
- Changed files: `.gitignore`, `package.json`, `package-lock.json`, `scripts/refresh-local-catalog.ps1`, `scripts/create-local-catalog-share.ps1`, `scripts/trust-local-catalog.ps1`, `PERSISTENT_CATALOG_GUIDE.md`, and `CHANGELOG.md`.
- Rollback: Remove the `ExcelTutorCatalog` trusted catalog entry in Excel Trust Center, remove the local SMB share, then run `git revert <v0.3.0 commit-hash>` after commit.
## v0.2.1 (2026-09-10)

- Version: v0.2.1
- Summary: Restored required Office command icons with real localhost PNG assets after runtime logs showed desktop Excel rejected the sideloaded manifest without them.
- Changed files: `manifest.xml`, `public/assets/icon-16.png`, `public/assets/icon-32.png`, `public/assets/icon-80.png`, `package.json`, `package-lock.json`, and `CHANGELOG.md`.
- Rollback: Run `git revert <v0.2.1 commit-hash>` after commit, then rerun `npm.cmd run start:desktop`.
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