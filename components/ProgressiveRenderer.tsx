import { Suspense, useState, useEffect, ReactNode, memo } from "react";

interface ProgressiveRendererProps {
  children: ReactNode;
  priority: number;
  delay?: number;
  fallback?: ReactNode;
}

const ProgressiveRenderer = memo(({
  children,
  priority,
  delay = 0,
  fallback = null,
}: ProgressiveRendererProps) => {
  const [shouldRender, setShouldRender] = useState(priority === 0);

  useEffect(() => {
    if (priority === 0) {
      return;
    }

    const loadComponent = () => {
      // Use requestIdleCallback for better performance, fallback to setTimeout
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            setShouldRender(true);
          },
          { timeout: delay + priority * 100 }
        );
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
          setShouldRender(true);
        }, delay + priority * 50);
      }
    };

    loadComponent();
  }, [priority, delay]);

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
});

ProgressiveRenderer.displayName = "ProgressiveRenderer";

export default ProgressiveRenderer;

