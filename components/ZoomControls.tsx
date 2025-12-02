import { IoAddOutline, IoRemoveOutline, IoHomeOutline } from "react-icons/io5";
import { useCamera } from "@/context/CameraContext";
import { useSceneSettings } from "@/context/SceneSettingsContext";

const ZoomControls = () => {
  const { zoomIn, zoomOut, resetZoom } = useCamera();
  const { controlsVisible } = useSceneSettings();

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleResetZoom = () => {
    resetZoom();
  };

  const handleKeyDownZoomIn = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleZoomIn();
    }
  };

  const handleKeyDownZoomOut = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleZoomOut();
    }
  };

  const handleKeyDownReset = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleResetZoom();
    }
  };

  return (
    <div className={`fixed top-[240px] right-4 md:top-20 md:right-[240px] bg-white/95 backdrop-blur-md text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-[90] overflow-hidden transition-all duration-200 flex flex-col ${
      controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
    }`}>
      <div className="flex flex-col p-1.5">
        <button
          onClick={handleZoomIn}
          onKeyDown={handleKeyDownZoomIn}
          className="flex items-center justify-center w-8 h-8 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 group"
          aria-label="Zoom in"
          tabIndex={0}
        >
          <IoAddOutline className="w-4 h-4 text-gray-700 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
        </button>
        
        <div className="w-full h-px bg-gray-200 my-0.5" />
        
        <button
          onClick={handleZoomOut}
          onKeyDown={handleKeyDownZoomOut}
          className="flex items-center justify-center w-8 h-8 hover:bg-blue-50 active:bg-blue-100 rounded-lg transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 group"
          aria-label="Zoom out"
          tabIndex={0}
        >
          <IoRemoveOutline className="w-4 h-4 text-gray-700 group-hover:text-blue-600 group-hover:scale-110 transition-all" />
        </button>
        
        <div className="w-full h-px bg-gray-200 my-0.5" />
        
        <button
          onClick={handleResetZoom}
          onKeyDown={handleKeyDownReset}
          className="flex items-center justify-center w-8 h-8 hover:bg-purple-50 active:bg-purple-100 rounded-lg transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500 group"
          aria-label="Reset view"
          tabIndex={0}
        >
          <IoHomeOutline className="w-3.5 h-3.5 text-gray-700 group-hover:text-purple-600 group-hover:scale-110 transition-all" />
        </button>
      </div>
    </div>
  );
};

export default ZoomControls;
