import { useEffect, useRef } from "react";

export function useDayButtonFocus(focused: boolean) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (focused) ref.current?.focus();
  }, [focused]);

  return ref;
}
