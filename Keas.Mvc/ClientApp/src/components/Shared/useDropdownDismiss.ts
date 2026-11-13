import { useEffect, useRef } from 'react';

export const useDropdownDismiss = (open: boolean, onDismiss: () => void) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const dismissOutside = (event: Event) => {
      if (event.target instanceof Node && !container.current?.contains(event.target)) {
        onDismiss();
      }
    };
    const dismissWithKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onDismiss();
      } else if (event.key === 'Tab') {
        onDismiss();
      }
    };

    // Native scrollbar interaction can blur the input without focusing another
    // element. Dismiss on an actual outside interaction instead of that blur.
    document.addEventListener('pointerdown', dismissOutside, true);
    document.addEventListener('focusin', dismissOutside, true);
    document.addEventListener('keydown', dismissWithKeyboard);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true);
      document.removeEventListener('focusin', dismissOutside, true);
      document.removeEventListener('keydown', dismissWithKeyboard);
    };
  }, [open, onDismiss]);

  return container;
};
