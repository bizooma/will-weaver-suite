/**
 * TurnstileWidget
 * ---------------
 * Renders a Cloudflare Turnstile challenge and hands the resulting token to the
 * parent form. The token must be sent to our backend, which calls Cloudflare's
 * /siteverify endpoint before trusting the submission.
 *
 * Implementation notes for future engineers:
 *  - The Turnstile script is loaded lazily (once per page) instead of being put
 *    in index.html, so marketing pages without a protected form pay no cost.
 *  - We use explicit rendering (`turnstile.render`) so React controls the
 *    lifecycle and we can reset the widget after a failed submit.
 *  - `data-action` / the `action` option is set to "turnstile-spin-v2" so
 *    Cloudflare analytics can attribute this integration.
 */
import { useEffect, useRef } from "react";

// Public site key — safe to ship in client code (the secret lives server-side).
const TURNSTILE_SITE_KEY = "0x4AAAAAAEH-uDaU0H_ei76V";
const TURNSTILE_ACTION = "turnstile-spin-v2";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

/** Loads the Turnstile API script once and resolves when it is ready. */
let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cloudflare Turnstile"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export interface TurnstileWidgetProps {
  /** Called with a fresh token on success, or null when it expires/errors. */
  onVerify: (token: string | null) => void;
  /** Bump this number to force the widget to reset (e.g. after a failed submit). */
  resetSignal?: number;
  className?: string;
}

const TurnstileWidget = ({ onVerify, resetSignal = 0, className }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Keep the latest callback in a ref so we never re-render the widget.
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  // Mount the widget once.
  useEffect(() => {
    let cancelled = false;
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action: TURNSTILE_ACTION,
          callback: (token: string) => onVerifyRef.current(token),
          "expired-callback": () => onVerifyRef.current(null),
          "error-callback": () => onVerifyRef.current(null),
        });
      })
      .catch(() => onVerifyRef.current(null));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  // Reset the challenge whenever the parent asks (tokens are single-use).
  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onVerifyRef.current(null);
    }
  }, [resetSignal]);

  return (
    <div
      ref={containerRef}
      // data-action is required so Cloudflare analytics attributes this widget.
      data-action={TURNSTILE_ACTION}
      className={`cf-turnstile ${className ?? ""}`}
    />
  );
};

export default TurnstileWidget;
