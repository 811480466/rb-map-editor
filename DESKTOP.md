# Desktop shell

This desktop version uses a Vue 3 + Electron shell. The Vue code is organized with a thin `App.vue`, global components under `desktop/src/components/`, and page modules under `desktop/src/views/`.

## Development

Install dependencies once:

```powershell
npm install
```

Start Vite and Electron:

```powershell
npm run dev
```

Vite serves the Vue shell at `http://127.0.0.1:5173`.

## Lint

```powershell
npm run lint
npm run lint:fix
```

ESLint checks the Vue, Electron, and Vite shell. The existing editor inside `legacy/` is intentionally excluded.

## Browser-only preview

```powershell
npm run vite
```

Then open `http://127.0.0.1:5173`.

## Build

```powershell
npm run build
```

The Vite build is written to `dist/`. The complete `legacy/` directory is still copied to `dist/legacy/` for later migration work.

## Package

Build an unpacked desktop app:

```powershell
npm run pack
```

Build Windows installer and portable app:

```powershell
npm run dist
```

The packaged output is written to `release/`.
