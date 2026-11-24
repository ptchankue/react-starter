# REACT JS starter


![Screenshot1](/screens/screen1.png)

A hands-on tour of modern React (19), as a **web app** and a **native mobile app**.
Every screen is a set of small, live examples you can read next to the running UI.

| Folder | Stack | What it is |
| --- | --- | --- |
| [`web/`](web) | React 19 · Vite · TypeScript · React Router · Vitest | Responsive web app, installable as a PWA (works offline) |
| [`mobile/`](mobile) | React Native · Expo SDK 58 · Expo Router | Native iOS/Android app (also runs on the web) |

## Features covered

### Web (`web/src/pages`)

| Page | What it shows |
| --- | --- |
| **Basics** | JSX, props, `children`, conditional rendering, lists & keys, events and bubbling |
| **Hooks** | `useState`, `useEffect` (with cleanup), `useRef`, `useReducer`, `useId`, `useLayoutEffect`, `useImperativeHandle`, `ref` as a prop, custom hooks |
| **Context** | `createContext`, `use()`, a global cart store with Context + `useReducer`, nested providers |
| **Forms & Actions** | Controlled and uncontrolled forms, validation, `<form action>`, `useActionState`, `useFormStatus`, `useOptimistic` |
| **Data & Suspense** | Fetching with `AbortController`, `Suspense` + `use(promise)`, error boundaries, retry |
| **Performance** | `memo`, `useMemo`, `useCallback`, `useTransition`, `useDeferredValue`, `<Profiler>`, code splitting with `lazy` |
| **Patterns** | Portals (modal), compound components, render props, HOCs, the `Children` API, lifting state up |
| **Routing** | Nested routes, URL params, search params as state, programmatic navigation, 404s |
| **Mobile & PWA** | Install prompt, offline banner, swipe gestures, geolocation, vibration, Web Share, clipboard |

The web app also has a light/dark/system theme, a responsive layout with a mobile drawer, and a service worker for offline use.

### Mobile (`mobile/src/app`)

| Tab | What it shows |
| --- | --- |
| **Basics** | `View`/`Text`/`Image`, `StyleSheet`, `TextInput`, `Pressable`, `KeyboardAvoidingView`, `Platform` |
| **Hooks** | `useState`, `useEffect` with `AppState`, `useReducer` todos persisted with AsyncStorage |
| **Lists** | `FlatList` virtualization, pull to refresh, infinite scroll, search with `useDeferredValue`, navigating to a dynamic route |
| **Gestures** | Swipe cards with `PanResponder` + `Animated`, looping animations, haptics |
| **Device** | Window and safe-area info, dark mode, native `Alert`, `Share`, deep links |

It also includes Expo Router stack, tabs, a modal and a dynamic route (`user/[id]`), plus a theme context that follows the OS.

## Getting started

Requires Node.js 20+.

```bash
# Web
cd web
npm install
npm run dev          # http://localhost:5173
npm test             # Vitest + Testing Library
npm run build        # type-check + production build (with service worker)

# Mobile
cd mobile
npm install
npx expo start       # scan the QR code with Expo Go, or press i / a / w
```

## Docker

Both apps ship as small nginx images. They are built in multi-stage Dockerfiles that type-check (and, for the web app, run the tests) before building.

```bash
docker compose up -d --build
# web          → http://localhost:8080
# mobile (web) → http://localhost:8090
```

Override the host ports with `WEB_PORT=3000 MOBILE_WEB_PORT=3001 docker compose up -d`.
Each container exposes `/healthz`, and the nginx config (`docker/nginx.conf`) handles client-side routing, long-term caching of hashed assets, and `no-cache` for the service worker.

To build one image on its own:

```bash
docker build --build-context docker=./docker -t react-showcase-web ./web
```

> **Native mobile apps can't be built in Docker for the app stores.** The `mobile` image serves the Expo **web** build.
> For iOS/Android binaries use Expo's build service: `cd mobile && npx eas-cli@latest build --platform all`.
