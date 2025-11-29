"use client";

import { useState, useEffect, ReactNode, memo } from "react";
import { Suspense } from "react";

interface IndividualBuildingLoaderProps {
  children: ReactNode;
  delay?: number;
  fallback?: ReactNode;
  priority?: number;
}

const IndividualBuildingLoader = memo(({
  children,
  delay = 0,
  fallback = null,
  priority = 0,
}: IndividualBuildingLoaderProps) => {
  const [shouldRender, setShouldRender] = useState(priority === 0 && delay === 0);

  useEffect(() => {
    if (shouldRender) {
      return;
    }

    // Load quickly and independently - use microtask for immediate load
    const loadBuilding = () => {
      if (delay === 0) {
        // Use Promise.resolve to load in next microtask (very fast)
        Promise.resolve().then(() => {
          setShouldRender(true);
        });
      } else {
        // Minimal delay if specified
        setTimeout(() => {
          setShouldRender(true);
        }, delay);
      }
    };

    loadBuilding();
  }, [delay, shouldRender]);

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
});

IndividualBuildingLoader.displayName = "IndividualBuildingLoader";

export default IndividualBuildingLoader;

