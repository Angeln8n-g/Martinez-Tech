/// <reference types="vite/client" />

declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }
  function confetti(options?: ConfettiOptions): Promise<null>;
  export default confetti;
}

declare module 'react-dom/client' {
  import { ReactNode } from 'react';
  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
  export function hydrateRoot(container: Element | DocumentFragment, initialChildren: ReactNode): Root;
}
