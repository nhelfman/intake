import { useEffect, useState } from 'react';

export default function useVisualKeyboardOffset() {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateKeyboardOffset = () => {
      // Only use viewport.height (not offsetTop) so that visual-viewport scroll
      // events triggered by tapping stepper buttons don't shift the sheet position.
      const offset = Math.max(0, window.innerHeight - viewport.height);
      setKeyboardOffset(Math.round(offset));
    };

    updateKeyboardOffset();
    viewport.addEventListener('resize', updateKeyboardOffset);
    window.addEventListener('orientationchange', updateKeyboardOffset);

    return () => {
      viewport.removeEventListener('resize', updateKeyboardOffset);
      window.removeEventListener('orientationchange', updateKeyboardOffset);
    };
  }, []);

  return keyboardOffset;
}