# React Showcase — web

React 19 + Vite + TypeScript. See the [root README](../README.md) for the feature tour.

```bash
npm install
npm run dev        # dev server with HMR
npm test           # Vitest in watch mode (npm test -- --run for CI)
npm run lint       # oxlint
npm run build      # tsc + vite build → dist/ (includes PWA service worker)
npm run preview    # serve the production build (test "Install app" here)
```

Layout:

```
src/
  api/          in-memory fake backend with latency
  components/   Layout, Demo card, Modal (portal), ErrorBoundary, Spinner
  context/      ThemeContext
  hooks/        useLocalStorage, useDebounce, useMediaQuery, useOnlineStatus, useFetch
  lib/          pure logic (reducers, validation) + unit tests
  pages/        one lazily-loaded page per topic
  routes.ts     route table (code-split with React.lazy)
```
