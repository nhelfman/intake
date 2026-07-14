# GitHub Copilot Instructions

## Build requirement for UI changes

After making **any** change to source files (`src/`, `index.html`, `public/`, `vite.config.ts`, `tailwind.config.*`, or other files that affect the built output), you **must** rebuild the project and commit the updated build artifacts:

```bash
npm run build
```

This outputs the production build to `docs/`, which is the folder served by GitHub Pages. The updated `docs/` directory must be included in the same commit as the source changes so that the deployed site stays in sync with the code.

### Steps for every UI change

1. Make source changes.
2. Run `npm run build` — this runs TypeScript compilation (`tsc -b`) followed by Vite build.
   - `vite.config.ts` sets `emptyOutDir: true`, so the build **automatically deletes all previous artifacts** in `docs/` before writing fresh ones. You do not need to manually clear `docs/` first.
3. Stage and commit both the source changes **and** the entire updated `docs/` directory together (including any deleted files, via `git add docs/`).

### Why

- GitHub Pages is configured to deploy from the `docs/` folder on the `main` branch (see `vite.config.ts` `outDir: 'docs'`).
- There is no CI build step that regenerates `docs/` automatically; the committed artifacts are what gets served.
- Failing to rebuild means the live site will be out of date with the source code.
- The `emptyOutDir: true` option ensures stale files from previous builds are never left behind.
