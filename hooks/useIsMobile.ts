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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount in case SSR/hydration mismatch
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
};





