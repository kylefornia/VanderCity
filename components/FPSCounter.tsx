import { useEffect, useRef, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { useSceneSettings } from "@/context/SceneSettingsContext";

const FPSCounter = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const { controlsVisible, setControlsVisible } = useSceneSettings();

  useEffect(() => {
    let animationFrameId: number;

    const updateFps = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / deltaTime));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(updateFps);
    };

    animationFrameId = requestAnimationFrame(updateFps);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const handleToggle = () => {
    setControlsVisible(!controlsVisible);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="fixed top-4 right-4 md:right-4 bg-white/95 backdrop-blur-md text-gray-900 rounded-lg text-xs md:text-sm font-mono z-30 shadow-xl border border-gray-200 flex items-center gap-2 px-2.5 md:px-3 py-1.5 md:py-2">
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`flex items-center justify-center transition-all duration-200 p-1 rounded hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          controlsVisible ? "text-blue-600" : "text-gray-600"
        }`}
        aria-label={controlsVisible ? "Hide settings" : "Show settings"}
        tabIndex={0}
      >
        <IoSettingsOutline className="w-4 h-4 md:w-3.5 md:h-3.5" />
      </button>
      <span className="select-none text-gray-900">{fps} FPS</span>
    </div>
  );
};

export default FPSCounter;
