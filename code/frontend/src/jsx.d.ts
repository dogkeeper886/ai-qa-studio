/* JSX types for the qa-* light-DOM custom elements (defined in the design
   framework, components.js) so they can be composed in React verbatim — the
   parity payoff. Attributes are passed through to the element. */
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CustomEl<Extra = Record<never, never>> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & Extra,
  HTMLElement
>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "qa-app": CustomEl;
      "qa-sidebar": CustomEl<{ active?: string; brand?: string }>;
      "qa-topbar": CustomEl<{ crumb?: string; "no-assistant"?: string }>;
      "qa-md-viewer": CustomEl;
    }
  }
}

declare global {
  interface Window {
    /** Set by qa-md-viewer when it upgrades. */
    qaDoc?: {
      open(doc: { name: string; rendered: string; source: string }): void;
      close(): void;
    };
  }
}

export {};
