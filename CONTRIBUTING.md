# Contributing to GitHub Assignments

Thanks for considering a contribution to **GitHub Assignments** — the Obsidian plugin that appends your assigned GitHub issues and pull requests to your notes.

## Project overview

- **Language / build:** TypeScript, bundled with [esbuild](https://esbuild.github.io), tested with [vitest](https://vitest.dev).
- **CI:** GitHub Actions runs build + lint on every push and PR (`lint.yml`). Merging to `main` requires an approved PR and a green status check — see [Repository rules](https://github.com/joewhitsitt/obsidian-github-assignments/rules).
- **Obsidian API:** targets the 1.13.0+ declarative settings API (`getSettingDefinitions` / `getControlValue` / `setControlValue`). Do not reintroduce the deprecated `display()` pattern.

## Setting up

```bash
git clone git@github.com:joewhitsitt/obsidian-github-assignments.git
cd obsidian-github-assignments
npm install
```

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Build once via esbuild (non-production) |
| `npm run build` | Type-check + production bundle (`main.js`) |
| `npm run test:run` | Run the vitest suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | ESLint (Obsidian community-plugin rules) |

## Development workflow

1. **Create a branch** off `main` (`git checkout -b feat/your-change`).
2. **TDD-first for feature work:** the repo uses RED-GREEN-REFACTOR. Write/extend tests in `__tests__/` before implementation, confirm they fail, then implement and confirm they pass.
   - Tests run in Node (vitest), **not** Obsidian — mock the `obsidian` module with `vi.mock()` (see `__tests__/helpers/obsidian-mock.ts`) and keep testable logic in pure functions where possible.
3. **Verify everything is green before pushing:**
   ```bash
   npm run lint && npm run build && npm run test:run
   ```
4. **Open a pull request** to `main`. The status check will run automatically.

## Pull request checklist

- [ ] Tests pass (`npm run test:run`) — new behavior is covered
- [ ] Lint and build are clean (`npm run lint && npm run build`)
- [ ] No stale/debug artifacts left behind (`console.log`, commented code, stray build output)
- [ ] `manifest.json` version untouched for feature PRs (version bumps happen at release)

## Releasing

Releases are cut by tag push. Version lives in **three** files that must stay in sync — `package.json`, `manifest.json`, and `versions.json` (the release tag must match `manifest.json` exactly, **no `v` prefix**). Release assets are uploaded and SLSA-attested by `.github/workflows/release.yml`.

## Creating an issue

If you've found a bug or have a feature idea, open a GitHub issue with a clear reproduction or description. Existing issues are tracked [on the repo](https://github.com/joewhitsitt/obsidian-github-assignments/issues).

## License

Please note this project is licensed under the terms in `LICENSE`.