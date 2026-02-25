# Contributing to x402 Bazaar Frontend

Thanks for your interest in contributing!

## Getting Started

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Copy environment config: `cp .env.example .env`
4. Start dev server: `npm run dev`
5. Build for production: `npm run build`
6. Run tests: `npm test`

## Development

- **Stack**: React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4
- **Tests**: Vitest
- **Styling**: Tailwind utility classes, glassmorphism theme in `index.css`
- **i18n**: All user-facing strings in `src/i18n/translations.js` (EN + FR)

## Making Changes

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Ensure `npm run build` passes
4. Add translations for any new user-facing strings
5. Commit with a descriptive message
6. Open a Pull Request

## Code Conventions

- Use TypeScript (`.tsx` / `.ts`) for all new files
- Use React Query for API calls
- Use `useSEO` hook for page meta tags
- Follow existing component patterns

## Reporting Issues

Please include:
- Browser and version
- Steps to reproduce
- Screenshots if UI-related

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
