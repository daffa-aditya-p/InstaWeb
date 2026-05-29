import { useEffect } from "react";

export function useShortcut(handler) {
  useEffect(() => {
    const onKeyDown = (event) => handler(event);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}

