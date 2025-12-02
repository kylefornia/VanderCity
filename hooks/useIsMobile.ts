import { useEffect, useState } from "react";

export const useIsMobile = (): boolean => {
  // Initialize with actual value to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768; // md breakpoint
    }
    return false;
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const checkMobile = () => {
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Debounce resize events to improve performance
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768); // md breakpoint
      }, 150);
    };

    // Check on mount in case SSR/hydration mismatch
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
};





