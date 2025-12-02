import { createContext, useContext, useState, ReactNode } from "react";

interface SceneSettings {
  shadowsEnabled: boolean;
  setShadowsEnabled: (enabled: boolean) => void;
  peopleCount: number;
  setPeopleCount: (count: number) => void;
  treesMultiplier: number;
  setTreesMultiplier: (multiplier: number) => void;
  controlsVisible: boolean;
  setControlsVisible: (visible: boolean) => void;
}

const SceneSettingsContext = createContext<SceneSettings | undefined>(undefined);

export const SceneSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [shadowsEnabled, setShadowsEnabled] = useState(true);
  const [peopleCount, setPeopleCount] = useState(30);
  const [treesMultiplier, setTreesMultiplier] = useState(1.0);
  const [controlsVisible, setControlsVisible] = useState(false);

  return (
    <SceneSettingsContext.Provider
      value={{
        shadowsEnabled,
        setShadowsEnabled,
        peopleCount,
        setPeopleCount,
        treesMultiplier,
        setTreesMultiplier,
        controlsVisible,
        setControlsVisible,
      }}
    >
      {children}
    </SceneSettingsContext.Provider>
  );
};

export const useSceneSettings = () => {
  const context = useContext(SceneSettingsContext);
  if (context === undefined) {
    throw new Error("useSceneSettings must be used within a SceneSettingsProvider");
  }
  return context;
};

