import { useSceneSettings } from "@/context/SceneSettingsContext";
import { IoPeopleOutline, IoLeafOutline, IoMoonOutline } from "react-icons/io5";

const SceneControls = () => {
  const {
    shadowsEnabled,
    setShadowsEnabled,
    peopleCount,
    setPeopleCount,
    treesMultiplier,
    setTreesMultiplier,
    controlsVisible,
  } = useSceneSettings();

  const handleShadowToggle = () => {
    setShadowsEnabled(!shadowsEnabled);
  };

  const handlePeopleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setPeopleCount(value);
    }
  };

  const handleTreesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 3) {
      setTreesMultiplier(value);
    }
  };

  return (
    <div className={`fixed right-4 md:top-20 md:right-4 bg-white/95 backdrop-blur-md text-gray-900 rounded-xl shadow-2xl border border-gray-200 z-30 w-[200px] md:w-[220px] max-w-[calc(100vw-2rem)] overflow-hidden transition-all duration-200 flex flex-col ${
      controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
    }`}>
      <div className="px-3 py-2 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
          <IoMoonOutline className="w-3 h-3" />
          <span className="text-[11px]">Scene Settings</span>
        </h3>
      </div>
      
      <div className="px-3 py-2.5 flex flex-col gap-2.5">
        {/* Shadows Toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={shadowsEnabled}
                onChange={handleShadowToggle}
                className="sr-only"
                aria-label="Toggle shadows"
              />
              <div
                className={`w-8 h-4 rounded-full transition-all duration-200 ${
                  shadowsEnabled ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full shadow-md transform transition-transform duration-200 mt-0.5 ${
                    shadowsEnabled ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </div>
            <span className="text-[11px] text-gray-700 font-medium select-none group-hover:text-gray-900 transition-colors">
              Shadows
            </span>
          </label>
        </div>

        {/* People Slider */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <IoPeopleOutline className="w-3 h-3" />
              <span className="font-medium">People</span>
            </label>
            <span className="text-[11px] font-mono text-blue-600 font-semibold">
              {peopleCount}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={peopleCount}
            onChange={handlePeopleChange}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600 transition-colors touch-manipulation slider"
            style={{
              background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${peopleCount}%, rgb(229 231 235) ${peopleCount}%, rgb(229 231 235) 100%)`
            }}
            aria-label="People count"
          />
        </div>

        {/* Trees Slider */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <IoLeafOutline className="w-3 h-3" />
              <span className="font-medium">Trees</span>
            </label>
            <span className="text-[11px] font-mono text-green-600 font-semibold">
              {(treesMultiplier * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={treesMultiplier}
            onChange={handleTreesChange}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-600 transition-colors touch-manipulation slider"
            style={{
              background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${(treesMultiplier / 3) * 100}%, rgb(229 231 235) ${(treesMultiplier / 3) * 100}%, rgb(229 231 235) 100%)`
            }}
            aria-label="Trees multiplier"
          />
        </div>
      </div>
    </div>
  );
};

export default SceneControls;

