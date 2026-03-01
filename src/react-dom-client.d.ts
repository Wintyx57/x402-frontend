declare module 'react-dom/client' {
  import { ReactElement } from 'react';

  interface Root {
    render(children: ReactElement): void;
    unmount(): void;
  }

  function createRoot(container: Element | Document): Root;
  function hydrateRoot(container: Element | Document, initialChildren: ReactElement): Root;
}
