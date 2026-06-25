import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A tiny transient "it happened" pulse. Call `flash()` to flip `on` to true for
 * `ms`, then back. Used for one-shot confirmations (copied, saved, PDF written)
 * without leaving sticky state. Respects component unmount.
 *
 * SEAM (F3 Save-PDF flash / trust): reused by the PDF success pulse later.
 */
export function useFlash(ms = 1500): [boolean, () => void] {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback(() => {
    setOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), ms);
  }, [ms]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return [on, flash];
}
