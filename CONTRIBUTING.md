# Contributing to x402 Bazaar Frontend

Thanks for your interest in contributing!

## Quick Start

1. Fork the repo
2. Clone your fork
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`

## Project Structure

- `src/pages/` -- Page components (Home, Services, Register, etc.)
- `src/components/` -- Reusable components (Navbar, ServiceCard, etc.)
- `src/i18n/` -- Translations (EN + FR)
- `src/hooks/` -- Custom React hooks
- `public/` -- Static assets (sitemap, robots.txt, etc.)

## Guidelines

- All user-facing text must use translation keys (see `src/i18n/translations.js`)
- Add translations for BOTH English and French
- Follow existing Tailwind patterns and color scheme
- Test responsive design (mobile + desktop)
- Run `npm run build` before submitting

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
