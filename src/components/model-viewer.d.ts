import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean;
          "ar-modes"?: string;
          "ar-scale"?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          "touch-action"?: string;
          "shadow-intensity"?: string;
          exposure?: string;
          poster?: string;
          "environment-image"?: string;
          "disable-tap"?: boolean;
        };
      }
    }
  }
}

export {};