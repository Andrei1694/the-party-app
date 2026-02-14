# Repository Guidelines

## Project Structure & Module Organization

- `src/` contains all application code. Entry points are `src/main.jsx` (bootstraps React, Router, and React Query) and `src/App.jsx` (top-level routes).
- `src/pages/` holds route-level pages (e.g., `Home.jsx`, `Users.jsx`).
- `src/assets/` stores static assets imported by components.
- `public/` is for static files served as-is by Vite.
- `index.html` is the Vite HTML entry; `vite.config.js` holds build/dev config.

## Build, Test, and Development Commands

- `npm install` installs dependencies.
- `npm run dev` starts the Vite dev server (defaults to `http://localhost:5173`).
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the project.

## Coding Style & Naming Conventions

- Use 2-space indentation, semicolons, and single quotes (match existing `*.jsx`).
- Components and pages use PascalCase filenames and exports (e.g., `UserList.jsx`).
- Hooks follow the `useX` naming pattern.
- Keep routing components in `src/pages/` and reusable UI in `src/` subfolders as needed.
- ESLint rules are defined in `eslint.config.js`; fix lint issues before committing.

## Testing Guidelines

- No test framework is configured yet. If you add tests, prefer a consistent setup (e.g., Vitest + React Testing Library) and document commands here.
- Name tests with `*.test.jsx` or `*.spec.jsx` and colocate with the module or under `src/__tests__/`.

## Commit & Pull Request Guidelines

- Git history is not available in this directory, so there is no established commit convention.
- Recommended: use clear, imperative commit messages (or Conventional Commits if your team prefers).
- PRs should include a short description, testing notes (commands run), and screenshots for UI changes. Link any relevant issues.

## Security & Configuration Tips

- Store environment values in `.env` files and prefix client-exposed variables with `VITE_`.
- Do not commit secrets or local `.env` files.
