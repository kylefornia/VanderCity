import * as THREE from "three";

import { BuildingCategory, useResume } from "@/context/ResumeContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import { FiBriefcase, FiCalendar, FiMapPin, FiX } from "react-icons/fi";
import {
  HiOutlineAcademicCap,
  HiOutlineLightBulb,
} from "react-icons/hi";
import { Html, useGLTF } from "@react-three/drei";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import { IoBasketballOutline } from "react-icons/io5";
import { MdOutlinePalette } from "react-icons/md";
import PolyPizzaModel from "./PolyPizzaModel";

// Helper function to ensure colors are excellent and vibrant
const toPastel = (color: string): THREE.Color => {
  const tempColor = new THREE.Color(color);
  const hsl = { h: 0, s: 0, l: 0 };
  tempColor.getHSL(hsl);

  // Make colors excellent, vibrant and colorful
  hsl.l = Math.min(0.72, Math.max(0.58, hsl.l * 0.9 + 0.08)); // Optimal lightness for vibrant colors
  hsl.s = Math.max(0.7, Math.min(0.9, hsl.s * 1.8 + 0.4)); // Maximum saturation for excellent color

  const pastelColor = new THREE.Color();
  pastelColor.setHSL(hsl.h, hsl.s, hsl.l);
  return pastelColor;
};

// Helper function to generate a very colorful palette based on base color
const getPastelPalette = (
  baseColor: string,
  buildingId?: string
): THREE.Color[] => {
  const base = new THREE.Color(baseColor);
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);

  // Add a small offset based on building ID to ensure each building is unique
  let hueOffset = 0;
  if (buildingId) {
    const hash = buildingId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    hueOffset = (hash % 20) / 100; // 0-0.2 offset for variety
  }

  // Generate a very vibrant and colorful palette
  const palette: THREE.Color[] = [];

  const baseHue = (hsl.h + hueOffset) % 1;

  // Main color - maximum vibrancy
  const main = new THREE.Color();
  main.setHSL(baseHue, 0.8, 0.65);
  palette.push(main);

  // Bright, saturated variation
  const bright = new THREE.Color();
  bright.setHSL(baseHue, 0.75, 0.7);
  palette.push(bright);

  // Lighter, highly saturated
  const light = new THREE.Color();
  light.setHSL(baseHue, 0.7, 0.75);
  palette.push(light);

  // Adjacent hue - very vibrant
  const variation1 = new THREE.Color();
  variation1.setHSL((baseHue + 0.12) % 1, 0.8, 0.63);
  palette.push(variation1);

  // Another adjacent hue
  const variation2 = new THREE.Color();
  variation2.setHSL((baseHue - 0.12 + 1) % 1, 0.78, 0.67);
  palette.push(variation2);

  // Triadic color 1 - maximum vibrancy
  const triadic1 = new THREE.Color();
  triadic1.setHSL((baseHue + 0.33) % 1, 0.8, 0.65);
  palette.push(triadic1);

  // Triadic color 2
  const triadic2 = new THREE.Color();
  triadic2.setHSL((baseHue - 0.33 + 1) % 1, 0.78, 0.68);
  palette.push(triadic2);

  // Complementary - very vibrant
  const complement = new THREE.Color();
  complement.setHSL((baseHue + 0.5) % 1, 0.75, 0.67);
  palette.push(complement);

  // Analogous color - vibrant
  const analogous1 = new THREE.Color();
  analogous1.setHSL((baseHue + 0.2) % 1, 0.8, 0.66);
  palette.push(analogous1);

  // Another analogous
  const analogous2 = new THREE.Color();
  analogous2.setHSL((baseHue - 0.2 + 1) % 1, 0.78, 0.64);
  palette.push(analogous2);

  // Split complementary 1
  const splitComp1 = new THREE.Color();
  splitComp1.setHSL((baseHue + 0.45) % 1, 0.75, 0.69);
  palette.push(splitComp1);

  // Split complementary 2
  const splitComp2 = new THREE.Color();
  splitComp2.setHSL((baseHue - 0.45 + 1) % 1, 0.8, 0.66);
  palette.push(splitComp2);

  // Tetradic color
  const tetradic = new THREE.Color();
  tetradic.setHSL((baseHue + 0.25) % 1, 0.78, 0.67);
  palette.push(tetradic);

  return palette;
};

// Helper function to check if a color is red (strict check - only exact red hex codes)
const isRedColor = (color: string): boolean => {
  if (!color) return false;
  const colorLower = color.toLowerCase().trim();
  // Only check for exact red color codes used in the work colors
  // These are the only red colors that should get white walls
  const redColors = [
    "#e74c3c", // Red from workColors
    "#ff6b6b", // Coral red from workColors
  ];
  return redColors.includes(colorLower);
};

// Helper function to update all materials in a scene to use pastel colors
const updateSceneMaterials = (
  scene: THREE.Object3D,
  baseColor: string,
  buildingId?: string,
  isSkyscraper?: boolean
) => {
  const palette = getPastelPalette(baseColor, buildingId);
  const isRed = isRedColor(baseColor);
  let materialIndex = 0;

  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.material) {
        // Handle both single materials and material arrays
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshPhongMaterial ||
            material instanceof THREE.MeshLambertMaterial
          ) {
            // For red buildings ONLY, make walls white (first 3-4 materials), keep accents red
            // Non-red buildings always use their normal palette colors
            let finalColor: THREE.Color;
            if (isRed === true && materialIndex < 4) {
              // ONLY for red buildings: First few materials (likely walls) = white
              finalColor = new THREE.Color("#FFFFFF");
            } else {
              // All other cases: use normal palette (for both red and non-red buildings)
              finalColor = palette[materialIndex % palette.length];
            }

            // Keep original colors for skyscrapers - don't modify them
            // The shiny effect comes from material properties only
            material.color.copy(finalColor);
            materialIndex++;

            // Ensure materials have nice properties for pastel look
            // Skyscrapers should look like glass (very low roughness, zero metalness)
            if (material instanceof THREE.MeshStandardMaterial) {
              if (isSkyscraper) {
                // Make skyscrapers look like glass - smooth, highly reflective, non-metallic
                // Glass has very low roughness (close to 0) for maximum reflection and zero metalness
                material.roughness = 0.0;
                material.metalness = 0.0;
              } else {
                // Regular buildings keep matte pastel look
                material.roughness = 1.0;
                material.metalness = 0.0;
              }
            }
          }
        });
      }
    }
  });
};

// Preload skyscraper and low building models for work buildings
useGLTF.preload("/models/Skyscraper 1.glb");
useGLTF.preload("/models/Skyscraper 2.glb");
useGLTF.preload("/models/Skyscraper 3.glb");
useGLTF.preload("/models/Low Building 1.glb");
useGLTF.preload("/models/Low Building 2.glb");
useGLTF.preload("/models/Low Building 3.glb");
useGLTF.preload("/models/Low Building 4.glb");
useGLTF.preload("/models/Low Building 5.glb");
useGLTF.preload("/models/Low Building 6.glb");
// Preload schoolhouse model for education buildings
useGLTF.preload("/models/Schoolhouse.glb");


interface CustomBuildingProps {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  color: string;
  buildingId: string;
  category: BuildingCategory;
}

// Work Building - Using Skyscraper GLB models
const WorkBuildingComponent = ({
  position,
  width,
  depth,
  height,
  color,
  buildingId,
}: Omit<CustomBuildingProps, "category">) => {
  const { setSelectedBuilding, resume, selectedBuilding, isLeftPanelVisible } = useResume();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [tooltipOffset, setTooltipOffset] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [boundingBox, setBoundingBox] = useState<{
    width: number;
    height: number;
    depth: number;
    center: THREE.Vector3;
  } | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modelGroupRef = useRef<THREE.Group>(null);
  const hitboxRef = useRef<THREE.Mesh>(null);

  const experience = useMemo(
    () => resume.experiences.find((exp) => exp.id === buildingId),
    [resume, buildingId]
  );

  const isSelected = useMemo(
    () =>
      selectedBuilding?.category === "work" &&
      selectedBuilding?.id === buildingId,
    [selectedBuilding, buildingId]
  );

  // Check if any building is selected (for translucency effect)
  const hasSelection = selectedBuilding !== null;

  const handleClick = () => {
    setSelectedBuilding({ id: buildingId, category: "work" });
  };

  // Show tooltip when selected from sidebar
  useEffect(() => {
    if (isSelected) {
      // Clear any pending timeouts
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      setIsHovered(true);
      setIsFadingOut(false);
    } else {
      // When deselected, immediately hide tooltip
      setIsHovered(false);
      setIsFadingOut(false);
      // Clear any pending timeouts
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    }
  }, [isSelected]);

  const handleHover = (hovered: boolean) => {
    // Clear any existing timeouts
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    if (hovered) {
      // Cancel any fade-out
      setIsFadingOut(false);
      // Small delay to prevent flickering when moving quickly
      showTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        showTimeoutRef.current = null;
      }, 150); // Reduced delay for better responsiveness
    } else {
      // If tooltip hasn't shown yet, cancel it
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
        return;
      }
      // Start fade-out animation
      setIsFadingOut(true);
      // After fade-out completes, hide the tooltip
      fadeTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        setIsFadingOut(false);
        fadeTimeoutRef.current = null;
      }, 200); // Match fade-out animation duration
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  // Select model from both skyscrapers and low buildings based on buildingId for consistency
  const skyscraperModels = [
    "/models/Skyscraper 1.glb",
    "/models/Skyscraper 2.glb",
    "/models/Skyscraper 3.glb",
  ];
  const lowBuildingModels = [
    "/models/Low Building 1.glb",
    "/models/Low Building 2.glb",
    "/models/Low Building 3.glb",
    "/models/Low Building 4.glb",
    "/models/Low Building 5.glb",
    "/models/Low Building 6.glb",
  ];

  // Determine whether to use skyscraper or low building, and which specific model
  const modelSelection = useMemo(() => {
    const hash = buildingId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Use hash to determine building type (60% skyscrapers, 40% low buildings)
    const useSkyscraper = hash % 100 < 60;
    if (useSkyscraper) {
      return {
        useSkyscraper: true,
        modelIndex: hash % skyscraperModels.length,
      };
    } else {
      return {
        useSkyscraper: false,
        modelIndex: hash % lowBuildingModels.length,
      };
    }
  }, [buildingId]);

  const { useSkyscraper, modelIndex } = modelSelection;
  const modelPath = useSkyscraper
    ? skyscraperModels[modelIndex]
    : lowBuildingModels[modelIndex];

  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();

    // Clone materials to ensure each building instance has unique materials
    // This prevents materials from being shared between building instances
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          // Clone each material in the array
          child.material = child.material.map((mat) => mat.clone());
        } else {
          // Clone single material
          child.material = child.material.clone();
        }
      }
    });

    // Update materials to use pastel colors
    // Pass useSkyscraper flag to make skyscrapers shiny
    updateSceneMaterials(cloned, color, buildingId, useSkyscraper);
    // Disable raycasting on all meshes in the cloned scene so only the hitbox receives clicks
    // Enable shadows on all meshes
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.raycast = () => {}; // Disable raycasting on model meshes
        // Add userData to identify this building
        child.userData.buildingId = buildingId;
        child.userData.category = "work";
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene, color, buildingId, useSkyscraper]);

  // Ensure raycasting stays disabled on all meshes (in case scene is modified)
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.raycast = () => {}; // Keep raycasting disabled
        }
      });
    }
  }, [clonedScene]);

  // Update material translucency when selection changes - use useEffect for performance
  useEffect(() => {
    if (!clonedScene) return;

    const currentIsSelected =
      selectedBuilding?.category === "work" &&
      selectedBuilding?.id === buildingId;
    const currentHasSelection = selectedBuilding !== null;
    const currentShouldBeTranslucent =
      currentHasSelection && !currentIsSelected;

    const targetOpacity = currentShouldBeTranslucent ? 0.3 : 1.0;
    const targetTransparent = currentShouldBeTranslucent;
    const targetDepthWrite = !currentShouldBeTranslucent;
    const targetSide = currentShouldBeTranslucent
      ? THREE.DoubleSide
      : THREE.FrontSide;
    const targetPolygonOffset = currentShouldBeTranslucent;
    const targetPolygonOffsetFactor = currentShouldBeTranslucent ? 1 : 0;
    const targetPolygonOffsetUnits = currentShouldBeTranslucent ? 1 : 0;

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshPhongMaterial ||
            material instanceof THREE.MeshLambertMaterial
          ) {
            // Only update if values have changed
            if (
              material.opacity !== targetOpacity ||
              material.transparent !== targetTransparent ||
              material.depthWrite !== targetDepthWrite ||
              material.side !== targetSide ||
              material.polygonOffset !== targetPolygonOffset ||
              material.polygonOffsetFactor !== targetPolygonOffsetFactor ||
              material.polygonOffsetUnits !== targetPolygonOffsetUnits
            ) {
              material.opacity = targetOpacity;
              material.transparent = targetTransparent;
              material.depthWrite = targetDepthWrite;
              material.side = targetSide;
              material.polygonOffset = targetPolygonOffset;
              material.polygonOffsetFactor = targetPolygonOffsetFactor;
              material.polygonOffsetUnits = targetPolygonOffsetUnits;
              material.needsUpdate = true;
            }
          }
        });
      }
    });
  }, [clonedScene, selectedBuilding, buildingId]);

  // Scale the building model to fit the building dimensions
  // Adjust scale based on model type (skyscraper vs low building)
  // Note: Plot size reduced but model size maintained by compensating scale
  const scaleX = width / 10; // Assuming model is ~10 units wide
  const scaleZ = depth / 10; // Assuming model is ~10 units deep

  // Different height scaling for skyscrapers vs low buildings
  const modelHeight = useSkyscraper ? 1.5 : 2.0; // Low buildings are typically taller relative to their footprint
  const scaleY = height / modelHeight;

  // Compensate for reduced plot size (10 -> 7 = 0.7x, so multiply by 1/0.7 = 1.43 to maintain model size)
  const plotSizeCompensation = 10 / 7; // Maintain model size despite smaller plot
  // Different size multipliers for skyscrapers (smaller) vs low buildings (bigger)
  const sizeMultiplier = useSkyscraper ? 1.4 : 3.5; // Skyscrapers: 1.4x, Low buildings: 3.5x (increased from 2.8x)
  // Base scale factor - smaller for skyscrapers, bigger for low buildings
  const baseScaleFactor = useSkyscraper ? 6.5 : 13.5; // Low buildings increased from 11.0 to 13.5
  const uniformScale =
    Math.min(scaleX, scaleZ, scaleY) *
    baseScaleFactor *
    plotSizeCompensation *
    sizeMultiplier;

  // Calculate bounding box from the actual model after it's loaded and scaled
  useEffect(() => {
    if (modelGroupRef.current) {
      // Use requestAnimationFrame to ensure the model is rendered before calculating bounding box
      requestAnimationFrame(() => {
        if (modelGroupRef.current) {
          const box = new THREE.Box3();
          box.setFromObject(modelGroupRef.current);

          if (!box.isEmpty()) {
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            setBoundingBox({
              width: size.x,
              height: size.y,
              depth: size.z,
              center: center.clone(),
            });
          }
        }
      });
    }
  }, [clonedScene, uniformScale]);

  return (
    <group position={position}>
      {/* Transparent hitbox matching model bounding box exactly */}
      <mesh
        ref={hitboxRef}
        position={[0, boundingBox?.center.y || height / 2, 0]}
        userData={{ buildingId, category: "work" }}
        renderOrder={1000}
        onPointerEnter={(e) => {
          e.stopPropagation();
          handleHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          // Ensure hover stays active when moving
          handleHover(true);
          // Calculate offset based on intersection point
          if (e.intersections && e.intersections.length > 0) {
            const intersection = e.intersections[0];
            const localPoint = intersection.point.clone();
            // Get the mesh's world position and subtract to get local coordinates
            const meshWorldPos = new THREE.Vector3();
            e.object.getWorldPosition(meshWorldPos);
            localPoint.sub(meshWorldPos);
            const hitboxCenterY = boundingBox?.center.y || height / 2;
            // Use a smaller multiplier for subtle movement
            const offsetX = Math.max(-2, Math.min(2, localPoint.x * 0.2));
            const offsetY = Math.max(
              -1,
              Math.min(1, (localPoint.y - hitboxCenterY) * 0.15)
            );
            const offsetZ = Math.max(-2, Math.min(2, localPoint.z * 0.2));
            setTooltipOffset([offsetX, offsetY, offsetZ]);
          }
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          handleHover(false);
          document.body.style.cursor = "default";
          setTooltipOffset([0, 0, 0]);
        }}
        onClick={(e) => {
          e.stopPropagation();
          // Since we disabled raycasting on model meshes, this click must be on our hitbox
          handleClick();
        }}
      >
        <boxGeometry
          args={[
            (boundingBox?.width || width) * 1.1, // Add 10% buffer to ensure clicks are caught
            (boundingBox?.height || height) * 1.1,
            (boundingBox?.depth || depth) * 1.1,
          ]}
        />
        <meshBasicMaterial
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          visible={true}
        />
      </mesh>

      <group ref={modelGroupRef} scale={uniformScale}>
        <primitive object={clonedScene} />
      </group>

      {/* Enhanced Tooltip */}
      {(isHovered || isSelected) && experience && !(isMobile && isLeftPanelVisible) && (
        <Html
          position={[
            tooltipOffset[0],
            (boundingBox
              ? boundingBox.center.y + boundingBox.height / 2
              : height) +
              2 +
              tooltipOffset[1],
            tooltipOffset[2],
          ]}
          center
          style={{ pointerEvents: "auto" }}
          occlude={false}
        >
          <div
            className={`bg-white text-gray-900 px-5 py-4 rounded-xl shadow-xl border border-gray-200 min-w-[320px] max-w-[380px] relative ${
              isFadingOut ? "animate-fade-out" : "animate-bounce-in-up"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsHovered(false);
                if (isSelected) {
                  setSelectedBuilding(null);
                }
              }}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100/80"
              aria-label="Close tooltip"
            >
              <FiX className="w-4 h-4" />
            </button>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-200/50">
                    <FiBriefcase className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 leading-tight">
                    {experience.company}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-0.5 ml-11">
                  {experience.position}
                </div>
              </div>
              {experience.description && (
                <div className="text-xs text-gray-600 leading-relaxed pt-1.5 border-t border-gray-100">
                  {experience.description}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-1.5 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" />
                  <span>
                    {experience.startDate} – {experience.endDate}
                  </span>
                </div>
                {experience.location && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5" />
                      <span>{experience.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export const WorkBuilding = memo(WorkBuildingComponent);

// Education Building - Classical architecture with columns and dome
const EducationBuildingComponent = ({
  position,
  width,
  depth,
  height,
  color,
  buildingId,
}: Omit<CustomBuildingProps, "category">) => {
  const { setSelectedBuilding, resume, selectedBuilding, isLeftPanelVisible } = useResume();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [tooltipOffset, setTooltipOffset] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hitboxRef = useRef<THREE.Mesh>(null);

  const education = useMemo(
    () => resume.education.find((edu) => edu.id === buildingId),
    [resume, buildingId]
  );

  const isSelected = useMemo(
    () =>
      selectedBuilding?.category === "education" &&
      selectedBuilding?.id === buildingId,
    [selectedBuilding, buildingId]
  );

  // Check if any building is selected (for translucency effect)
  // Selected buildings should NEVER be translucent
  const hasSelection = selectedBuilding !== null;

  // Track translucency state for renderOrder
  const [isTranslucent, setIsTranslucent] = useState(false);

  const handleClick = () => {
    setSelectedBuilding({ id: buildingId, category: "education" });
  };

  // Show tooltip when selected from sidebar
  useEffect(() => {
    if (isSelected) {
      // Clear any pending timeouts
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      setIsHovered(true);
      setIsFadingOut(false);
    } else {
      // When deselected, immediately hide tooltip
      setIsHovered(false);
      setIsFadingOut(false);
      // Clear any pending timeouts
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    }
  }, [isSelected]);

  const handleHover = (hovered: boolean) => {
    // Clear any existing timeouts
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    if (hovered) {
      // Cancel any fade-out
      setIsFadingOut(false);
      // Delay showing tooltip to prevent flickering when moving quickly
      showTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        showTimeoutRef.current = null;
      }, 300); // 300ms delay before showing
    } else {
      // If tooltip hasn't shown yet, cancel it
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
        return;
      }
      // Start fade-out animation
      setIsFadingOut(true);
      // After fade-out completes, hide the tooltip
      fadeTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        setIsFadingOut(false);
        fadeTimeoutRef.current = null;
      }, 200); // Match fade-out animation duration
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  // Load Schoolhouse GLB model
  const { scene } = useGLTF("/models/Schoolhouse.glb");
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();

    // Clone materials to ensure each building instance has unique materials
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => mat.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });

    // Update materials to use school colors - first school is green, second is red
    const schoolIndex = resume.education.findIndex(
      (edu) => edu.id === buildingId
    );
    const schoolColor = schoolIndex === 0 ? "#2ECC71" : "#E74C3C"; // First school: green, Second school: red

    // Apply school color only to wall materials (first 1-2 materials), keep roof and other materials untouched
    let materialIndex = 0;
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshPhongMaterial ||
            material instanceof THREE.MeshLambertMaterial
          ) {
            // Check material name to identify walls vs roof/other parts
            const materialName = material.name?.toLowerCase() || "";
            const isRoof =
              materialName.includes("roof") ||
              materialName.includes("rooftop") ||
              materialName.includes("dome") ||
              materialName.includes("bell");

            // Only apply school color to wall materials (first 1-2 materials, excluding roof)
            // Roof and other decorative materials keep their original colors
            if (!isRoof && materialIndex < 2) {
              // Walls get the school color directly
              material.color.set(schoolColor);
              if (material instanceof THREE.MeshStandardMaterial) {
                material.roughness = 1.0;
                material.metalness = 0.0;
              }
            }
            // All other materials (roof, etc.) are left untouched - keep original colors
            materialIndex++;
          }
        });
      }
    });

    // Disable raycasting on all meshes in the cloned scene so only the hitbox receives clicks
    // Enable shadows on all meshes
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.raycast = () => {}; // Disable raycasting on model meshes
        child.userData.buildingId = buildingId;
        child.userData.category = "education";
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene, resume, buildingId]);

  // Ensure raycasting stays disabled on all meshes
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.raycast = () => {}; // Keep raycasting disabled
        }
      });
    }
  }, [clonedScene]);

  // Calculate bounding box from the actual model
  const [boundingBox, setBoundingBox] = useState<{
    width: number;
    height: number;
    depth: number;
    center: THREE.Vector3;
  } | null>(null);
  const modelGroupRef = useRef<THREE.Group>(null);

  // Calculate bounding box from the actual model after it's loaded and scaled
  useEffect(() => {
    if (modelGroupRef.current) {
      requestAnimationFrame(() => {
        if (modelGroupRef.current) {
          const box = new THREE.Box3();
          box.setFromObject(modelGroupRef.current);

          if (!box.isEmpty()) {
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            setBoundingBox({
              width: size.x,
              height: size.y,
              depth: size.z,
              center: center.clone(),
            });
          }
        }
      });
    }
  }, [clonedScene]);

  // Update material translucency when selection changes - use useEffect for performance
  useEffect(() => {
    if (!clonedScene) return;

    const currentIsSelected =
      selectedBuilding?.category === "education" &&
      selectedBuilding?.id === buildingId;
    const currentHasSelection = selectedBuilding !== null;
    const currentShouldBeTranslucent =
      currentHasSelection && !currentIsSelected;

    // Update translucency state for renderOrder
    if (isTranslucent !== currentShouldBeTranslucent) {
      setIsTranslucent(currentShouldBeTranslucent);
    }

    const targetOpacity = currentShouldBeTranslucent ? 0.3 : 1.0;
    const targetTransparent = currentShouldBeTranslucent;
    const targetDepthWrite = !currentShouldBeTranslucent;
    const targetSide = currentShouldBeTranslucent
      ? THREE.DoubleSide
      : THREE.FrontSide;
    const targetPolygonOffset = currentShouldBeTranslucent;
    // Use higher polygonOffset values to prevent z-fighting at base
    const targetPolygonOffsetFactor = currentShouldBeTranslucent ? 4 : 0;
    const targetPolygonOffsetUnits = currentShouldBeTranslucent ? 4 : 0;

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshPhongMaterial ||
            material instanceof THREE.MeshLambertMaterial
          ) {
            if (
              material.opacity !== targetOpacity ||
              material.transparent !== targetTransparent ||
              material.depthWrite !== targetDepthWrite ||
              material.side !== targetSide ||
              material.polygonOffset !== targetPolygonOffset ||
              material.polygonOffsetFactor !== targetPolygonOffsetFactor ||
              material.polygonOffsetUnits !== targetPolygonOffsetUnits
            ) {
              material.opacity = targetOpacity;
              material.transparent = targetTransparent;
              material.depthWrite = targetDepthWrite;
              material.side = targetSide;
              material.polygonOffset = targetPolygonOffset;
              material.polygonOffsetFactor = targetPolygonOffsetFactor;
              material.polygonOffsetUnits = targetPolygonOffsetUnits;
              material.needsUpdate = true;
            }
          }
        });
      }
    });
  }, [clonedScene, selectedBuilding, buildingId, isTranslucent]);

  // Scale the building model to fit the building dimensions
  const scaleX = width / 10; // Assuming model is ~10 units wide
  const scaleZ = depth / 10; // Assuming model is ~10 units deep
  const modelHeight = 2.0; // Model height in units
  const scaleY = height / modelHeight;

  // Compensate for reduced plot size and apply size multiplier
  const plotSizeCompensation = 12 / 8;
  const sizeMultiplier = 0.6; // Reduced from 1.3 to make it smaller
  const baseScaleFactor = 3; // Set to 3
  const uniformScale =
    Math.min(scaleX, scaleZ, scaleY) *
    baseScaleFactor *
    plotSizeCompensation *
    sizeMultiplier;

  return (
    <group position={position}>
      {/* Transparent hitbox matching model bounding box */}
      <mesh
        ref={hitboxRef}
        position={[0, boundingBox?.center.y || height / 2, 0]}
        userData={{ buildingId, category: "education" }}
        renderOrder={1000}
        onPointerEnter={(e) => {
          e.stopPropagation();
          handleHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          handleHover(true);
          if (e.intersections && e.intersections.length > 0) {
            const intersection = e.intersections[0];
            const localPoint = intersection.point.clone();
            const meshWorldPos = new THREE.Vector3();
            e.object.getWorldPosition(meshWorldPos);
            localPoint.sub(meshWorldPos);
            const hitboxCenterY = boundingBox?.center.y || height / 2;
            const offsetX = Math.max(-1, Math.min(1, localPoint.x * 0.1));
            const offsetY = Math.max(
              -0.5,
              Math.min(0.5, (localPoint.y - hitboxCenterY) * 0.08)
            );
            const offsetZ = Math.max(-1, Math.min(1, localPoint.z * 0.1));
            setTooltipOffset([offsetX, offsetY, offsetZ]);
          }
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          handleHover(false);
          document.body.style.cursor = "default";
          setTooltipOffset([0, 0, 0]);
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <boxGeometry
          args={[
            (boundingBox?.width || width) * 1.1,
            (boundingBox?.height || height) * 1.1,
            (boundingBox?.depth || depth) * 1.1,
          ]}
        />
        <meshBasicMaterial
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          visible={true}
        />
      </mesh>

      {/* Schoolhouse GLB model with colored walls */}
      <group
        ref={modelGroupRef}
        scale={uniformScale}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <primitive object={clonedScene} />
      </group>

      {/* Enhanced Tooltip */}
      {(isHovered || isSelected) && education && !(isMobile && isLeftPanelVisible) && (
        <Html
          position={[
            tooltipOffset[0],
            height + 3 + tooltipOffset[1],
            tooltipOffset[2],
          ]}
          center
          style={{ pointerEvents: "auto" }}
          occlude={false}
        >
          <div
            className={`bg-white text-gray-900 px-5 py-4 rounded-xl shadow-xl border border-gray-200 min-w-[320px] max-w-[380px] relative ${
              isFadingOut ? "animate-fade-out" : "animate-bounce-in-up"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsHovered(false);
                if (isSelected) {
                  setSelectedBuilding(null);
                }
              }}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100/80"
              aria-label="Close tooltip"
            >
              <FiX className="w-4 h-4" />
            </button>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-200/50">
                    <HiOutlineAcademicCap className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 leading-tight">
                    {education.school}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-0.5 ml-11">
                  {education.degree}
                </div>
                {education.field && (
                  <div className="text-xs text-gray-500 mt-1 ml-11">
                    {education.field}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 pt-1.5 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" />
                  <span>Graduated {education.graduationDate}</span>
                </div>
                {education.location && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5" />
                      <span>{education.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export const EducationBuilding = memo(EducationBuildingComponent);

// Interest Building - Sports facility style (basketball court, etc.)
const InterestBuildingComponent = ({
  position,
  width,
  depth,
  height,
  color,
  buildingId,
}: Omit<CustomBuildingProps, "category">) => {
  const { setSelectedBuilding, resume, selectedBuilding } = useResume();
  const [isHovered, setIsHovered] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [tooltipOffset, setTooltipOffset] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [boundingBox, setBoundingBox] = useState<{
    width: number;
    height: number;
    depth: number;
    center: THREE.Vector3;
  } | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modelGroupRef = useRef<THREE.Group>(null);
  const hitboxRef = useRef<THREE.Mesh>(null);

  const interest = useMemo(
    () => resume.interests.find((int) => int.id === buildingId),
    [resume, buildingId]
  );

  const isSelected = useMemo(
    () =>
      selectedBuilding?.category === "interest" &&
      selectedBuilding?.id === buildingId,
    [selectedBuilding, buildingId]
  );

  // Check if any building is selected (for translucency effect)
  // Selected buildings should NEVER be translucent
  const hasSelection = selectedBuilding !== null;

  const handleClick = () => {
    setSelectedBuilding({ id: buildingId, category: "interest" });
  };

  // Show tooltip when selected from sidebar
  useEffect(() => {
    if (isSelected) {
      // Clear any pending timeouts
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      setIsHovered(true);
      setIsFadingOut(false);
    } else {
      // When deselected, immediately hide tooltip
      setIsHovered(false);
      setIsFadingOut(false);
      // Clear any pending timeouts
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    }
  }, [isSelected]);

  const handleHover = (hovered: boolean) => {
    // Clear any existing timeouts
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    if (hovered) {
      // Cancel any fade-out
      setIsFadingOut(false);
      // Delay showing tooltip to prevent flickering when moving quickly
      showTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        showTimeoutRef.current = null;
      }, 300); // 300ms delay before showing
    } else {
      // If tooltip hasn't shown yet, cancel it
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
        return;
      }
      // Start fade-out animation
      setIsFadingOut(true);
      // After fade-out completes, hide the tooltip
      fadeTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        setIsFadingOut(false);
        fadeTimeoutRef.current = null;
      }, 200); // Match fade-out animation duration
    }
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);


  const materials = useMemo(() => {
    const pastelColor = toPastel(color);
    // Start with full opacity - will be updated in useEffect
    const opacity = 1.0;
    const transparent = false;
    const depthWrite = true;
    return {
      main: new THREE.MeshStandardMaterial({
        color: pastelColor,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
        transparent,
        opacity,
        depthWrite,
        side: transparent ? THREE.DoubleSide : THREE.FrontSide,
      }),
      roof: new THREE.MeshStandardMaterial({
        color: "#B8B8B8", // Lighter gray for pastel theme
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
        transparent,
        opacity,
        depthWrite,
        side: transparent ? THREE.DoubleSide : THREE.FrontSide,
      }),
      court: new THREE.MeshStandardMaterial({
        color: "#F8F8F8", // Softer white for pastel theme
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
        transparent,
        opacity,
        depthWrite,
        side: transparent ? THREE.DoubleSide : THREE.FrontSide,
      }),
      lines: new THREE.MeshStandardMaterial({
        color: "#E8E8E8", // Soft gray-white for pastel theme
        emissive: "#E8E8E8",
        emissiveIntensity: 0.15,
        flatShading: true,
        transparent,
        opacity,
        depthWrite,
        side: transparent ? THREE.DoubleSide : THREE.FrontSide,
      }),
      hoop: new THREE.MeshStandardMaterial({
        color: "#FFB380", // Pastel orange
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
        transparent,
        opacity,
        depthWrite,
        side: transparent ? THREE.DoubleSide : THREE.FrontSide,
      }),
      fence: new THREE.MeshStandardMaterial({
        color: "#D4A574", // Pastel brown
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
        transparent,
        opacity,
        depthWrite,
        side: transparent ? THREE.DoubleSide : THREE.FrontSide,
      }),
      pole: new THREE.MeshStandardMaterial({
        color: "#D0D0D0", // Lighter silver
        roughness: 1.0,
        metalness: 0.2,
        flatShading: true,
        transparent,
        opacity,
        depthWrite,
        side: transparent ? THREE.DoubleSide : THREE.FrontSide,
      }),
    };
  }, [color]);

  // Update material translucency when selection changes - use useEffect for performance
  useEffect(() => {
    const currentIsSelected =
      selectedBuilding?.category === "interest" &&
      selectedBuilding?.id === buildingId;
    const currentHasSelection = selectedBuilding !== null;
    const currentShouldBeTranslucent =
      currentHasSelection && !currentIsSelected;

    const targetOpacity = currentShouldBeTranslucent ? 0.3 : 1.0;
    const targetTransparent = currentShouldBeTranslucent;
    const targetDepthWrite = !currentShouldBeTranslucent;
    const targetSide = currentShouldBeTranslucent
      ? THREE.DoubleSide
      : THREE.FrontSide;
    const targetPolygonOffset = currentShouldBeTranslucent;
    // Use higher polygonOffset values to prevent z-fighting at base
    const targetPolygonOffsetFactor = currentShouldBeTranslucent ? 4 : 0;
    const targetPolygonOffsetUnits = currentShouldBeTranslucent ? 4 : 0;

    Object.values(materials).forEach((material) => {
      if (material instanceof THREE.MeshStandardMaterial) {
        // Only update if values have changed
        if (
          material.opacity !== targetOpacity ||
          material.transparent !== targetTransparent ||
          material.depthWrite !== targetDepthWrite ||
          material.side !== targetSide ||
          material.polygonOffset !== targetPolygonOffset ||
          material.polygonOffsetFactor !== targetPolygonOffsetFactor ||
          material.polygonOffsetUnits !== targetPolygonOffsetUnits
        ) {
          material.opacity = targetOpacity;
          material.transparent = targetTransparent;
          material.depthWrite = targetDepthWrite;
          material.side = targetSide;
          material.polygonOffset = targetPolygonOffset;
          material.polygonOffsetFactor = targetPolygonOffsetFactor;
          material.polygonOffsetUnits = targetPolygonOffsetUnits;
          material.needsUpdate = true;
        }
      }
    });
  }, [selectedBuilding, buildingId, materials]);

  const isBasketball = interest?.name.toLowerCase() === "basketball";

  // Render outdoor basketball court for basketball interests
  if (isBasketball) {
    const courtWidth = width * 0.95;
    const courtDepth = depth * 0.95;
    const hoopHeight = 3.05; // Standard basketball hoop height (10 feet)
    const poleHeight = 4.5;

    // Poly.pizza model URL - using Basketball court.glb from public/models
    const courtModelUrl = "/models/Basketball court.glb";
    const usePolyPizzaModels = true;

    // Calculate scale to maintain rectangular aspect ratio while fitting in available space
    // Basketball courts are rectangular (typically ~1.88:1 length:width ratio)
    // Standard basketball court: ~15m wide × ~28m long (1.87:1 ratio)
    const modelWidth = 10; // Model width in units
    const modelDepth = 28; // Model depth in units

    // Calculate scale factors for both dimensions
    const scaleX = courtWidth / modelWidth;
    const scaleZ = courtDepth / modelDepth;

    // Use the smaller scale to ensure the model fits in both dimensions
    // This maintains aspect ratio while ensuring it doesn't exceed the space
    // Reduced scale significantly to ensure it fits within the plot with proper margins
    const uniformScale = Math.min(scaleX, scaleZ) * 0.69; // 35% margin to ensure it fits within plot boundaries

    // Use uniform scale to maintain aspect ratio
    const finalScaleX = uniformScale * 1.1;
    const finalScaleZ = uniformScale;

    // Calculate bounding box from the actual model after it's loaded and scaled
    useEffect(() => {
      if (modelGroupRef.current) {
        // Use requestAnimationFrame to ensure the model is rendered before calculating bounding box
        requestAnimationFrame(() => {
          if (modelGroupRef.current) {
            const box = new THREE.Box3();
            box.setFromObject(modelGroupRef.current);

            if (!box.isEmpty()) {
              const size = box.getSize(new THREE.Vector3());
              const center = box.getCenter(new THREE.Vector3());
              setBoundingBox({
                width: size.x,
                height: size.y,
                depth: size.z,
                center: center.clone(),
              });
            }
          }
        });
      }
    }, [finalScaleX, finalScaleZ]);

    return (
      <group position={position}>
        {/* Transparent hitbox to catch pointer events - matches model bounding box */}
        <mesh
          ref={hitboxRef}
          position={[0, boundingBox?.center.y || height / 2, 0]}
          userData={{ buildingId, category: "interest" }}
          renderOrder={1000}
          onPointerEnter={(e) => {
            e.stopPropagation();
            handleHover(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            // Ensure hover stays active when moving
            handleHover(true);
            // Calculate offset based on intersection point in local space
            if (e.intersections && e.intersections.length > 0) {
              const intersection = e.intersections[0];
              const localPoint = intersection.point.clone();
              // Get the mesh's world position and subtract to get local coordinates
              const meshWorldPos = new THREE.Vector3();
              e.object.getWorldPosition(meshWorldPos);
              localPoint.sub(meshWorldPos);
              const hitboxCenterY = boundingBox?.center.y || height / 2;
              // Use a smaller multiplier for subtle movement (0.2 = 20% of distance from center)
              // Include vertical offset based on Y position
              const offsetX = Math.max(-2, Math.min(2, localPoint.x * 0.2));
              const offsetY = Math.max(
                -1,
                Math.min(1, (localPoint.y - hitboxCenterY) * 0.15)
              );
              const offsetZ = Math.max(-2, Math.min(2, localPoint.z * 0.2));
              setTooltipOffset([offsetX, offsetY, offsetZ]);
            }
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            handleHover(false);
            document.body.style.cursor = "default";
            setTooltipOffset([0, 0, 0]);
          }}
          onClick={(e) => {
            e.stopPropagation();
            // Verify this click is on our specific hitbox by checking userData
            const clickedBuildingId =
              e.object.userData?.buildingId ||
              e.eventObject?.userData?.buildingId;
            if (
              clickedBuildingId === buildingId ||
              e.object === hitboxRef.current ||
              e.eventObject === hitboxRef.current
            ) {
              handleClick();
            }
          }}
        >
          <boxGeometry
            args={[
              boundingBox?.width || width,
              boundingBox?.height || height,
              boundingBox?.depth || depth,
            ]}
          />
          <meshBasicMaterial
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            visible={true}
          />
        </mesh>

        {usePolyPizzaModels ? (
          // Use poly.pizza Basketball court model
          <group ref={modelGroupRef}>
            <PolyPizzaModel
              url={courtModelUrl}
              position={[0, 0, 0]}
              scale={[finalScaleX, 1, finalScaleZ]} // Uniform scale to maintain aspect ratio and fit within space
              color={color}
              shouldBeTranslucent={
                selectedBuilding !== null &&
                !(
                  selectedBuilding?.category === "interest" &&
                  selectedBuilding?.id === buildingId
                )
              }
            />
          </group>
        ) : (
          // Fallback: Procedural court with low-poly style
          <>
            {/* Court surface */}
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[courtWidth, courtDepth]} />
              <primitive object={materials.court} attach="material" />
            </mesh>

            {/* Court border lines */}
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[courtWidth / 2 - 0.1, courtWidth / 2, 64]} />
              <primitive object={materials.lines} attach="material" />
            </mesh>

            {/* Center line */}
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.15, courtDepth]} />
              <primitive object={materials.lines} attach="material" />
            </mesh>

            {/* Center circle */}
            <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.5, 2.65, 64]} />
              <primitive object={materials.lines} attach="material" />
            </mesh>

            {/* Free throw lines and key areas */}
            {[-1, 1].map((side) => (
              <group key={`key-${side}`}>
                {/* Free throw line */}
                <mesh
                  position={[0, 0.06, side * (courtDepth / 2 - 5.8)]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <planeGeometry args={[4.9, 0.15]} />
                  <primitive object={materials.lines} attach="material" />
                </mesh>
                {/* Key/Paint area */}
                <mesh
                  position={[0, 0.06, side * (courtDepth / 2 - 3.6)]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <planeGeometry args={[4.9, 5.8]} />
                  <meshStandardMaterial
                    color="#FF6B00"
                    opacity={0.3}
                    transparent
                    roughness={1.0}
                    metalness={0.0}
                    flatShading={true}
                  />
                </mesh>
                {/* Key border */}
                <mesh
                  position={[0, 0.06, side * (courtDepth / 2 - 3.6)]}
                  rotation={[-Math.PI / 2, 0, 0]}
                >
                  <ringGeometry args={[2.45, 2.5, 64, 1, 0, Math.PI]} />
                  <primitive object={materials.lines} attach="material" />
                </mesh>
              </group>
            ))}

            {/* Basketball hoops */}
            {[-1, 1].map((side) => (
              <group
                key={`hoop-${side}`}
                position={[0, 0, side * (courtDepth / 2 - 1.2)]}
              >
                {/* Pole */}
                <mesh position={[0, poleHeight / 2, 0]}>
                  <cylinderGeometry args={[0.08, 0.08, poleHeight, 8]} />
                  <primitive object={materials.pole} attach="material" />
                </mesh>
                {/* Backboard */}
                <mesh position={[0, hoopHeight + 0.5, -0.3]}>
                  <boxGeometry args={[3.5, 2.5, 0.1]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    roughness={1.0}
                    metalness={0.0}
                    flatShading={true}
                  />
                </mesh>
                {/* Rim */}
                <mesh
                  position={[0, hoopHeight, -0.5]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <torusGeometry args={[0.75, 0.05, 8, 16]} />
                  <primitive object={materials.hoop} attach="material" />
                </mesh>
                {/* Net (simplified) */}
                <mesh position={[0, hoopHeight - 0.3, -0.5]}>
                  <cylinderGeometry args={[0.75, 0.75, 0.6, 8]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    wireframe
                    opacity={0.6}
                    transparent
                  />
                </mesh>
              </group>
            ))}
          </>
        )}

        {/* Fence around court - only render if not using poly.pizza model (model includes fence) */}
        {!usePolyPizzaModels && (
          <>
            {[
              {
                pos: [0, 0.5, courtDepth / 2 + 0.1] as [number, number, number],
                size: [courtWidth + 0.4, 1, 0.1] as [number, number, number],
              },
              {
                pos: [0, 0.5, -courtDepth / 2 - 0.1] as [
                  number,
                  number,
                  number
                ],
                size: [courtWidth + 0.4, 1, 0.1] as [number, number, number],
              },
              {
                pos: [courtWidth / 2 + 0.1, 0.5, 0] as [number, number, number],
                size: [0.1, 1, courtDepth + 0.4] as [number, number, number],
              },
              {
                pos: [-courtWidth / 2 - 0.1, 0.5, 0] as [
                  number,
                  number,
                  number
                ],
                size: [0.1, 1, courtDepth + 0.4] as [number, number, number],
              },
            ].map((fence, i) => (
              <mesh key={`fence-${i}`} position={fence.pos}>
                <boxGeometry args={fence.size} />
                <primitive object={materials.fence} attach="material" />
              </mesh>
            ))}
          </>
        )}

        {/* Enhanced Tooltip */}
        {(isHovered || isSelected) && interest && (
          <Html
            position={[
              tooltipOffset[0],
              (boundingBox
                ? boundingBox.center.y + boundingBox.height / 2
                : 3) + tooltipOffset[1],
              tooltipOffset[2],
            ]}
            center
            style={{ pointerEvents: "auto" }}
            occlude={false}
          >
            <div
              className={`bg-white text-gray-900 px-5 py-4 rounded-xl shadow-xl border border-gray-200 min-w-[300px] max-w-[360px] relative ${
                isFadingOut ? "animate-fade-out" : "animate-bounce-in-up"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHovered(false);
                  if (isSelected) {
                    setSelectedBuilding(null);
                  }
                }}
                className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100/80"
                aria-label="Close tooltip"
              >
                <FiX className="w-4 h-4" />
              </button>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-200/50">
                      {interest.category === "sports" ? (
                        <IoBasketballOutline className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      ) : interest.category === "hobby" ? (
                        <MdOutlinePalette className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      ) : (
                        <HiOutlineLightBulb className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 leading-tight">
                      {interest.name}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-0.5 rounded-md inline-block mt-1.5 ml-11 ${
                      interest.category === "sports"
                        ? "bg-red-50 text-red-700 border border-red-100"
                        : interest.category === "hobby"
                        ? "bg-teal-50 text-teal-700 border border-teal-100"
                        : "bg-gray-50 text-gray-700 border border-gray-100"
                    }`}
                  >
                    {interest.category === "sports"
                      ? "Sports"
                      : interest.category === "hobby"
                      ? "Hobby"
                      : "Interest"}
                  </div>
                </div>
                {interest.description && (
                  <div className="text-xs text-gray-600 leading-relaxed pt-1.5 border-t border-gray-100">
                    {interest.description}
                  </div>
                )}
              </div>
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Original indoor sports facility for other interests
  return (
    <group position={position}>
      {/* Transparent hitbox to catch pointer events */}
      <mesh
        ref={hitboxRef}
        position={[0, height / 2, 0]}
        userData={{ buildingId, category: "education" }}
        renderOrder={1000}
        onPointerEnter={(e) => {
          e.stopPropagation();
          handleHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          // Ensure hover stays active when moving
          handleHover(true);
          // Calculate offset based on intersection point in local space
          if (e.intersections && e.intersections.length > 0) {
            const intersection = e.intersections[0];
            const localPoint = intersection.point.clone();
            // Get the mesh's world position and subtract to get local coordinates
            const meshWorldPos = new THREE.Vector3();
            e.object.getWorldPosition(meshWorldPos);
            localPoint.sub(meshWorldPos);
            // Use a smaller multiplier for subtle movement (0.2 = 20% of distance from center)
            // Include vertical offset based on Y position
            const offsetX = Math.max(-2, Math.min(2, localPoint.x * 0.2));
            const offsetY = Math.max(
              -1,
              Math.min(1, (localPoint.y - height / 2) * 0.15)
            );
            const offsetZ = Math.max(-2, Math.min(2, localPoint.z * 0.2));
            setTooltipOffset([offsetX, offsetY, offsetZ]);
          }
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          handleHover(false);
          document.body.style.cursor = "default";
          setTooltipOffset([0, 0, 0]);
        }}
        onClick={(e) => {
          e.stopPropagation();
          // Since we disabled raycasting on model meshes, this click must be on our hitbox
          handleClick();
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          visible={true}
        />
      </mesh>

      {/* Main structure - lower, more spread out */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={materials.main} attach="material" />
      </mesh>

      {/* Court floor visible from above (if building is transparent/dome style) */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width * 0.9, depth * 0.9]} />
        <primitive object={materials.court} attach="material" />
      </mesh>

      {/* Court lines */}
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, depth * 0.9]} />
        <primitive object={materials.lines} attach="material" />
      </mesh>

      {/* Basketball hoops on sides */}
      {[-1, 1].map((side) => (
        <group key={`hoop-${side}`}>
          {/* Backboard */}
          <mesh position={[side * (width / 2 - 0.5), height * 0.6, 0]}>
            <boxGeometry args={[0.1, 3, 4]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={1.0}
              metalness={0.0}
              flatShading={true}
            />
          </mesh>
          {/* Rim */}
          <mesh
            position={[side * (width / 2 - 0.6), height * 0.5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[0.75, 0.05, 8, 16]} />
            <primitive object={materials.hoop} attach="material" />
          </mesh>
          {/* Net (simplified) */}
          <mesh position={[side * (width / 2 - 0.6), height * 0.45, 0]}>
            <cylinderGeometry args={[0.75, 0.75, 0.5, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              wireframe
              opacity={0.5}
              transparent
            />
          </mesh>
        </group>
      ))}

      {/* Smaller windows for sports facility */}
      {[-1, 1].flatMap((side) => {
        const windowRows = Math.max(2, Math.floor((height - 1) / 2.5));
        const windowCols = Math.max(2, Math.floor((depth * 0.8) / 2.0));
        return Array.from({ length: windowRows }).flatMap((_, row) =>
          Array.from({ length: windowCols }).map((_, col) => {
            const z = (col - (windowCols - 1) / 2) * 2.0;
            const y = 1 + row * 2.5;
            const x = side * (width / 2 - 0.05);
            const isLit =
              (row * windowCols + col + seed + side * 100) % 2 === 0;
            return (
              <mesh key={`glass-${side}-${row}-${col}`} position={[x, y, z]}>
                <boxGeometry args={[0.1, 1.5, 1.2]} />
                <meshStandardMaterial
                  color={isLit ? "#FFE082" : "#81D4FA"}
                  emissive={isLit ? "#FFE082" : "#000000"}
                  emissiveIntensity={isLit ? 0.3 : 0}
                  metalness={0.0}
                  roughness={1.0}
                  flatShading={true}
                />
              </mesh>
            );
          })
        );
      })}

      {/* Entrance */}
      <mesh position={[0, 2.5, depth / 2 + 0.02]}>
        <boxGeometry args={[5, 5, 0.2]} />
        <meshStandardMaterial
          color="#424242"
          roughness={1.0}
          metalness={0.0}
          flatShading={true}
        />
      </mesh>

      {/* Roof - can be flat or slightly angled */}
      <mesh position={[0, height + 0.2, 0]}>
        <boxGeometry args={[width + 0.5, 0.4, depth + 0.5]} />
        <primitive object={materials.roof} attach="material" />
      </mesh>

      {/* Enhanced Tooltip */}
      {isHovered && interest && (
        <Html
          position={[
            tooltipOffset[0],
            height + 2 + tooltipOffset[1],
            tooltipOffset[2],
          ]}
          center
          style={{ pointerEvents: "auto" }}
          occlude={false}
        >
          <div
            className={`bg-white text-gray-900 px-5 py-4 rounded-xl shadow-xl border border-gray-200 min-w-[300px] max-w-[360px] relative ${
              isFadingOut ? "animate-fade-out" : "animate-bounce-in-up"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsHovered(false);
              }}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100/80"
              aria-label="Close tooltip"
            >
              <FiX className="w-4 h-4" />
            </button>
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-200/50">
                    {interest.category === "sports" ? (
                      <IoBasketballOutline className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    ) : interest.category === "hobby" ? (
                      <MdOutlinePalette className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    ) : (
                      <HiOutlineLightBulb className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 leading-tight">
                    {interest.name}
                  </div>
                </div>
                <div
                  className={`text-xs font-medium px-2 py-0.5 rounded-md inline-block mt-1.5 ml-11 ${
                    interest.category === "sports"
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : interest.category === "hobby"
                      ? "bg-teal-50 text-teal-700 border border-teal-100"
                      : "bg-gray-50 text-gray-700 border border-gray-100"
                  }`}
                >
                  {interest.category === "sports"
                    ? "Sports"
                    : interest.category === "hobby"
                    ? "Hobby"
                    : "Interest"}
                </div>
              </div>
              {interest.description && (
                <div className="text-xs text-gray-600 leading-relaxed pt-1.5 border-t border-gray-100">
                  {interest.description}
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export const InterestBuilding = memo(InterestBuildingComponent);
