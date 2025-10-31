import { useEffect } from "react";

export function useDebouncedEffect(effect: () => void, deps: unknown[], delay = 150) {
  useEffect(() => {
    const id = setTimeout(effect, delay);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
