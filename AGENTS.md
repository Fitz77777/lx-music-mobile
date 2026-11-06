# AGENTS.md

LX Music mobile app (洛雪音乐移动版): React Native 0.73 + TypeScript + Redux, Android only (Android 5+; iOS is not supported despite the `ios/` dir existing — don't touch it or expect `npm run ios` to work).

## Layout

- Entry: `index.js` → `shim.js` (Node polyfills) → `src/app.ts`.
- Screens are registered via `react-native-navigation` (native screens), not react-navigation.
- `src/` top level: `screens/`, `components/`, `store/` (Redux per-domain slices), `core/` (music/player/sync logic), `plugins/` (player, lyric, sync), `theme/`, `lang/`, `types/`.
- Path alias `@/` → `./src/*` is configured in **both** `babel.config.js` (module-resolver) and `tsconfig.json` — update both if it changes.

## Workflow

- All development happens on the `dev` branch; open PRs against `dev`, not `master`. README says new-feature PRs should start with an Issue first.
- CI on PRs to `dev`: `npm run lint` then `npm run build-test`. Match that locally before finishing work.
- No test suite exists — `npm run build-test` (Metro bundles the JS for Android) is the "does it compile" check. `test.js` at repo root is a scratch crypto playground, not a test.

## Commands

```
npm ci            # install (node >= 18, pinned to v18 in .nvmrc)
npm run lint      # eslint; use lint:fix for autofix
npm run build-test
npm run start     # metro; npm run sc = start with cache reset
npm run dev       # react-native run-android --active-arch-only
```

There is no `typecheck` script; if needed run `npx tsc --noEmit` manually.

Gotchas:

- `"pack:android"`, `"clear"` etc. call `gradlew.bat` — **Windows-only**. On Linux/macOS run `./gradlew <task>` inside `android/` instead.
- `npm run clear:full` permanently deletes build dirs and node_modules via `git clean -fdx` (preserving only `android/keystore.properties` and `android/app/*.keystore`).
- Version and versionCode live in `package.json` (`version`, `versionCode`); `android/app/build.gradle` derives `versionName`/`versionCode` and the app id from it — change it there, not in Gradle.

## Codegen

- `npm run build:theme` regenerates the theme index after editing theme configs in `src/theme/themes/createThemes.js` (see the header comment in that file).

## Dependencies

- Several runtime deps are pinned to commits in the author's GitHub forks (`react-native-track-player`, `react-native-background-timer`, `react-native-file-system`, `react-native-local-media-metadata`). `npm ci`/the lockfile is required — don't re-resolve or "upgrade" these to upstream.
- `.ncurc.js` `reject` lists many intentionally frozen deps (react, react-native, react-native-navigation, …) — respect it when using `npx ncu`.
- `dependencies-patch.js` is a stand-alone node script for string-patching node_modules before builds (the author runs it manually). Its patch list is currently empty, so it's a no-op — but if a native-module build breaks mysteriously, check whether it's supposed to be patched here.

## Localization

- `src/lang/` has exactly three locale JSONs: `zh-cn.json` (fallback), `zh-tw.json`, `en-us.json`. TypeScript enforces the same key set across all three; adding a key means adding it to all of them in one commit.

## Android build

- `android/app/build.gradle` release signing reads `android/keystore.properties` (+ keystore files), which only exist locally/CI — release builds fail without them. Debug builds use the bundled `debug.keystore`.
- Release APKs are produced by `.github/workflows/release.yml` (`DISABLE_SVG: 1` env, `./gradlew assembleRelease` in `android/`); `publish/` is a release tooling script (`npm run publish` = changelog update), not related to npm.
