# TypeScript Strict Mode Migration

## Status
TypeScript strict mode has been enabled in `tsconfig.json` on 2026-02-28.

## Current State
- **strict**: true (enabled)
- **noUnusedLocals**: true (enabled)
- **noUnusedParameters**: true (enabled)
- **Total errors**: 131+ (detected during initial check)

## Next Steps (Gradual Migration)

The codebase will gradually be migrated to pass strict mode checks. Key areas to address:

### 1. Component Props Type Annotations (High Priority)
- Add proper types to destructured component parameters
- Files affected: `ErrorBoundary.tsx`, `ServiceCard.tsx`, `CategoryIcon.tsx`, `CodeBlock.tsx`, `CopyButton.tsx`, `DocsSidebar.tsx`, `FAQ.tsx`, and others
- Example fix:
  ```typescript
  // Before
  function MyComponent({ name, count }) { ... }

  // After
  interface MyComponentProps {
    name: string;
    count: number;
  }
  function MyComponent({ name, count }: MyComponentProps) { ... }
  ```

### 2. Vite Environment Types (High Priority)
- Add ambient type declaration for `import.meta.env`
- Create `src/vite-env.d.ts` with proper types
- Files affected: `config.ts`, `main.tsx`, `ErrorBoundary.tsx`

### 3. useReveal Hook Return Types (Medium Priority)
- Fix ref type mismatches (useReveal returns `RefObject<HTMLElement>` but refs expect `RefObject<HTMLDivElement>`)
- Files affected: Multiple pages (Creators.tsx, CreatorOnboarding.tsx, Demos.tsx, etc.)

### 4. ErrorBoundary Component (Medium Priority)
- Add proper React.Component type parameters
- Add state interface for hasError and children props
- File: `src/components/ErrorBoundary.tsx`

### 5. Unused Locals & Parameters
- Remove or use unused variables (enabled by noUnusedLocals and noUnusedParameters)

## Checking Progress
Run the following to see remaining errors:
```bash
npx tsc --noEmit
```

## Notes
- Gradual migration allows the app to continue building/running
- Fix errors in priority order (props types first, then types for environment/hooks)
- Prioritize frequently-used components first
