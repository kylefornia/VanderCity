"use client";

import * as THREE from "three";

import { BLOCK_SIZE, GRID_SIZE, STREET_WIDTH } from "./cityConstants";
import { EducationBuilding, WorkBuilding } from "./CustomBuildings";
import { FiX, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { HiOutlineCode } from "react-icons/hi";
import { Html, useGLTF } from "@react-three/drei";
import { memo, useEffect, useMemo, useRef, useState, Suspense } from "react";

import { useFrame } from "@react-three/fiber";
import { useResume } from "@/context/ResumeContext";

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

// Helper function to update all materials in a scene to use pastel colors
const updateSceneMaterials = (
  scene: THREE.Object3D,
  baseColor: string,
  buildingId?: string
) => {
  const palette = getPastelPalette(baseColor, buildingId);
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
            // Assign a pastel color from the palette
            const pastelColor = palette[materialIndex % palette.length];
            material.color.copy(pastelColor);
            materialIndex++;

            // Ensure materials have nice properties for pastel look
            if (material instanceof THREE.MeshStandardMaterial) {
              material.roughness = 1.0;
              material.metalness = 0.0;
            }
          }
        });
      }
    }
  });
};

// Models load on-demand per building for independent loading (like tree shaking)
// Preloads removed to allow each building to load independently

// Model arrays for building blocks
const SMALL_BUILDING_MODELS = [
  "/models/Small Building 1.glb",
  "/models/Small Building 2.glb",
  "/models/Small Building 3.glb",
];

// Shared model cache to avoid redundant loading
const modelCache = new Map<string, THREE.Object3D>();

// Building block component using Small Buildings for empty blocks
interface BuildingBlockProps {
  position: [number, number, number];
  buildingId?: string;
  scale?: number;
}

const BuildingBlock = memo(
  ({ position, buildingId, scale = 1 }: BuildingBlockProps) => {
    // Select model based on buildingId for consistency, or random if not provided
    const modelIndex = useMemo(() => {
      if (buildingId) {
        const hash = buildingId
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return hash % SMALL_BUILDING_MODELS.length;
      }
      // Random selection if no buildingId
      return Math.floor(Math.random() * SMALL_BUILDING_MODELS.length);
    }, [buildingId]);

    const modelPath = SMALL_BUILDING_MODELS[modelIndex];

    const { scene } = useGLTF(modelPath);
    
    // Use cached clone or create new one
    const clonedScene = useMemo(() => {
      const cacheKey = `building-block-${modelPath}`;
      if (!modelCache.has(cacheKey)) {
        const cloned = scene.clone();
        modelCache.set(cacheKey, cloned);
        return cloned;
      }
      // Clone from cache to avoid sharing geometry/material references
      return modelCache.get(cacheKey)!.clone();
    }, [scene, modelPath]);

    return (
      <group position={position} scale={scale}>
        <primitive object={clonedScene} />
      </group>
    );
  }
);

// Generic building component using GLB models (kept for backward compatibility)
interface GenericBuildingProps {
  position: [number, number, number];
  modelIndex: number; // 0, 1, or 2 for the three building models
  scale?: number;
}

const GenericBuilding = ({
  position,
  modelIndex,
  scale = 1,
}: GenericBuildingProps) => {
  const buildingModels = [
    "/models/Small Building 1.glb",
    "/models/Small Building 2.glb",
    "/models/Small Building 3.glb",
  ];

  const { scene } = useGLTF(buildingModels[modelIndex]);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return (
    <group position={position} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
};

// House Building using House.glb model with hover tooltip
interface HouseBuildingProps {
  position: [number, number, number];
}

const HouseBuilding = memo(({ position }: HouseBuildingProps) => {
  const { resume } = useResume();
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
  const hitboxRef = useRef<THREE.Mesh>(null);
  const modelGroupRef = useRef<THREE.Group>(null);
  const tooltipHoverRef = useRef(false);

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
      // Only hide if not hovering over tooltip
      if (!tooltipHoverRef.current) {
        // Start fade-out animation
        setIsFadingOut(true);
        // After fade-out completes, hide the tooltip
        fadeTimeoutRef.current = setTimeout(() => {
          if (!tooltipHoverRef.current) {
            setIsHovered(false);
            setIsFadingOut(false);
          }
          fadeTimeoutRef.current = null;
        }, 300); // Increased delay to allow moving to tooltip
      }
    }
  };

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  const { scene } = useGLTF("/models/House.glb");
  
  // Scale the house model to fit nicely in the grid cell - larger scale to match other buildings
  // Use a scale similar to BuildingBlock (which uses 4.5-7.5)
  const houseScale = 8.0;
  
  // Calculate ground offset to place house on ground (similar to Trees component)
  const groundOffset = useMemo(() => {
    const box = new THREE.Box3();
    box.setFromObject(scene);
    // Return the offset needed to move the bottom of the model to Y=0
    return -box.min.y;
  }, [scene]);
  
  // Use cached clone or create new one
  const clonedScene = useMemo(() => {
    const cacheKey = "house-model";
    if (!modelCache.has(cacheKey)) {
      const cloned = scene.clone();
      modelCache.set(cacheKey, cloned);
      return cloned;
    }
    // Clone from cache to avoid sharing geometry/material references
    return modelCache.get(cacheKey)!.clone();
  }, [scene]);
  
  // Calculate bounding box from the actual model after it's loaded and scaled
  useEffect(() => {
    if (modelGroupRef.current) {
      // Wait for next frame to ensure scale is applied
      requestAnimationFrame(() => {
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
      });
    }
  }, [clonedScene, houseScale]);
  const hitboxWidth = boundingBox?.width || 18;
  const hitboxHeight = boundingBox?.height || 15;
  const hitboxDepth = boundingBox?.depth || 18;
  // Adjust hitbox center Y to account for ground offset
  const hitboxCenterY = boundingBox 
    ? boundingBox.center.y + groundOffset * houseScale
    : 7.5 + groundOffset * houseScale;

  return (
    <group position={position}>
      {/* Transparent hitbox for interaction - extended upward to cover tooltip area */}
      <mesh
        ref={hitboxRef}
        position={[0, hitboxCenterY + 8, 0]}
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
            const offsetX = Math.max(-2, Math.min(2, localPoint.x * 0.2));
            const offsetY = Math.max(
              -1,
              Math.min(1, (localPoint.y - (hitboxCenterY + 8)) * 0.15)
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
      >
        <boxGeometry args={[hitboxWidth, hitboxHeight + 20, hitboxDepth]} />
        <meshBasicMaterial
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          visible={true}
        />
      </mesh>

      {/* The actual house model - offset upward so it sits on the ground */}
      <group 
        ref={modelGroupRef} 
        scale={houseScale}
        position={[0, groundOffset * houseScale, 0]}
      >
        <primitive object={clonedScene} />
      </group>

      {/* Invisible hitbox at tooltip position to maintain hover when moving to tooltip */}
      {isHovered && (
        <mesh
          position={[
            tooltipOffset[0],
            (boundingBox
              ? boundingBox.center.y + boundingBox.height / 2
              : hitboxHeight) +
              2 +
              tooltipOffset[1],
            tooltipOffset[2],
          ]}
          onPointerEnter={(e) => {
            e.stopPropagation();
            handleHover(true);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            handleHover(true);
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            handleHover(false);
          }}
        >
          <boxGeometry args={[15, 10, 15]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            visible={false}
          />
        </mesh>
      )}

      {/* Simple Profile Card Tooltip */}
      {isHovered && (
        <Html
          position={[
            tooltipOffset[0],
            (boundingBox
              ? boundingBox.center.y + boundingBox.height / 2
              : hitboxHeight) +
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
            onMouseEnter={() => {
              tooltipHoverRef.current = true;
              if (fadeTimeoutRef.current) {
                clearTimeout(fadeTimeoutRef.current);
                fadeTimeoutRef.current = null;
              }
              setIsFadingOut(false);
              setIsHovered(true);
            }}
            onMouseLeave={() => {
              tooltipHoverRef.current = false;
              handleHover(false);
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsHovered(false);
              }}
              className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              aria-label="Close tooltip"
            >
              <FiX className="w-4 h-4" />
            </button>
            
            <div className="space-y-3">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full mb-2 shadow-sm overflow-hidden">
                  <img
                    src="/dp.jpg"
                    alt={resume.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className = 'w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-sm';
                        parent.textContent = resume.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase();
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900 leading-tight">
                  {resume.name}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  {resume.title}
                </div>
              </div>
              
              {/* Location */}
              {resume.location && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 pt-1.5 border-t border-gray-100">
                  <FiMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>{resume.location}</span>
                </div>
              )}
              
              {/* Introduction */}
              {resume.summary && (
                <div className="pt-1.5 border-t border-gray-100">
                  <div className="text-xs text-gray-600 leading-relaxed text-center">
                    <span className="font-medium text-gray-900">
                      Hi, I'm {resume.name.split(" ")[0]}! 👋
                    </span>{" "}
                    <span>
                      {resume.summary.split(".")[0]}.
                    </span>
                  </div>
                </div>
              )}
              
              {/* Contact Info */}
              <div className="space-y-2 pt-1.5 border-t border-gray-100">
                {resume.email && (
                  <a
                    href={`mailto:${resume.email}`}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <FiMail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{resume.email}</span>
                  </a>
                )}
                {resume.phone && (
                  <a
                    href={`tel:${resume.phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <FiPhone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{resume.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
});

HouseBuilding.displayName = "HouseBuilding";

// Personal Project Building using kit-bashed GenericBuilding models with interactivity
interface ProjectBuildingProps {
  position: [number, number, number];
  buildingId: string;
  color: string;
}

const ProjectBuilding = memo(
  ({ position, buildingId, color }: ProjectBuildingProps) => {
    const { setSelectedBuilding, resume, selectedBuilding } = useResume();
    const [isHovered, setIsHovered] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [tooltipOffset, setTooltipOffset] = useState<
      [number, number, number]
    >([0, 0, 0]);
    const [boundingBox, setBoundingBox] = useState<{
      width: number;
      height: number;
      depth: number;
      center: THREE.Vector3;
    } | null>(null);
    const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hitboxRef = useRef<THREE.Mesh>(null);
    const modelGroupRef = useRef<THREE.Group>(null);

    const project = useMemo(
      () => resume.personalProjects.find((proj) => proj.id === buildingId),
      [resume, buildingId]
    );

    const isSelected = useMemo(
      () =>
        selectedBuilding?.category === "project" &&
        selectedBuilding?.id === buildingId,
      [selectedBuilding, buildingId]
    );

    // Check if any building is selected (for translucency effect)
    // Selected buildings should NEVER be translucent
    const hasSelection = selectedBuilding !== null;
    const shouldBeTranslucent = hasSelection && !isSelected;

    const buildingScale = useMemo(() => {
      const hash = buildingId
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return 12.0 + (hash % 50) * 0.16; // Scale between 12.0 and 20.0 (increased from 8.0-14.0)
    }, [buildingId]);

    // Fallback to estimated height if bounding box not calculated yet
    const estimatedHeight = boundingBox?.height || buildingScale * 1.5;

    const handleClick = () => {
      setSelectedBuilding({ id: buildingId, category: "project" });
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
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }

      if (hovered) {
        setIsFadingOut(false);
        showTimeoutRef.current = setTimeout(() => {
          setIsHovered(true);
          showTimeoutRef.current = null;
        }, 150);
      } else {
        if (showTimeoutRef.current) {
          clearTimeout(showTimeoutRef.current);
          showTimeoutRef.current = null;
          return;
        }
        setIsFadingOut(true);
        fadeTimeoutRef.current = setTimeout(() => {
          setIsHovered(false);
          setIsFadingOut(false);
          fadeTimeoutRef.current = null;
        }, 200);
      }
    };

    useEffect(() => {
      return () => {
        if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
        if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
      };
    }, []);

    // Use Low Building models for personal projects
    const buildingModels = [
      "/models/Low Building 1.glb",
      "/models/Low Building 2.glb",
      "/models/Low Building 3.glb",
      "/models/Low Building 4.glb",
      "/models/Low Building 5.glb",
      "/models/Low Building 6.glb",
    ];

    // Select from 6 low building models instead of 3
    const lowBuildingModelIndex = useMemo(() => {
      const hash = buildingId
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return hash % buildingModels.length;
    }, [buildingId]);

    const { scene } = useGLTF(buildingModels[lowBuildingModelIndex]);
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
      updateSceneMaterials(cloned, color, buildingId);
      return cloned;
    }, [scene, color, buildingId]);

    // Update material translucency when selection changes - use useEffect for performance
    useEffect(() => {
      if (!clonedScene) return;
      
      const currentIsSelected =
        selectedBuilding?.category === "project" &&
        selectedBuilding?.id === buildingId;
      const currentHasSelection = selectedBuilding !== null;
      const currentShouldBeTranslucent = currentHasSelection && !currentIsSelected;
      
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
              // Only update if values have changed to avoid unnecessary updates
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
    }, [clonedScene, buildingScale]);

    // Use bounding box dimensions for hitbox, fallback to estimated if not available
    const hitboxWidth = boundingBox?.width || buildingScale * 1.2;
    const hitboxHeight = boundingBox?.height || estimatedHeight;
    const hitboxDepth = boundingBox?.depth || buildingScale * 1.2;
    const hitboxCenterY = boundingBox?.center.y || estimatedHeight / 2;

    return (
      <group position={position}>
        {/* Transparent hitbox for interaction - matches model bounding box */}
        <mesh
          ref={hitboxRef}
          position={[0, hitboxCenterY, 0]}
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
            handleClick();
          }}
        >
          <boxGeometry args={[hitboxWidth, hitboxHeight, hitboxDepth]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            visible={true}
          />
        </mesh>

        {/* The actual building model */}
        <group ref={modelGroupRef} scale={buildingScale}>
          <primitive object={clonedScene} />
        </group>

        {/* Tooltip */}
        {(isHovered || isSelected) && project && (
          <Html
            position={[
              tooltipOffset[0],
              (boundingBox
                ? boundingBox.center.y + boundingBox.height / 2
                : estimatedHeight) +
                2 +
                tooltipOffset[1],
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
                      <HiOutlineCode className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 leading-tight">
                      {project.name}
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-0.5 rounded-md inline-block mt-1.5 ml-11 bg-purple-50 text-purple-700 border border-purple-100">
                    Personal Project
                  </div>
                </div>
                {project.description && (
                  <div className="text-xs text-gray-600 leading-relaxed pt-1.5 border-t border-gray-100">
                    {project.description}
                  </div>
                )}
              </div>
            </div>
          </Html>
        )}
      </group>
    );
  }
);

interface BuildingProps {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  color: string;
  isResumeBuilding?: boolean;
  buildingId?: string;
  buildingType?: "modern" | "classic" | "tower";
}

// Instanced windows component for performance
const InstancedWindows = ({
  width,
  depth,
  height,
  isResumeBuilding,
  seed,
}: {
  width: number;
  depth: number;
  height: number;
  isResumeBuilding: boolean;
  seed: number;
}) => {
  const windowMeshRef = useRef<THREE.InstancedMesh>(null);
  const windowSize = 0.9;
  const spacing = 2.2;
  const rows = Math.floor((height - 2) / spacing);
  const colsX = Math.floor((width - 1) / spacing);
  const colsZ = Math.floor((depth - 1) / spacing);

  const { litWindows, unlitWindows } = useMemo(() => {
    const lit: Array<{ position: [number, number, number]; rotation: number }> =
      [];
    const unlit: Array<{
      position: [number, number, number];
      rotation: number;
    }> = [];
    const rng = (n: number) => {
      const x = Math.sin(n * 12.9898 + seed) * 43758.5453;
      return x - Math.floor(x);
    };

    const addWindow = (
      pos: [number, number, number],
      rot: number,
      isLit: boolean
    ) => {
      if (isLit) {
        lit.push({ position: pos, rotation: rot });
      } else {
        unlit.push({ position: pos, rotation: rot });
      }
    };

    // Front face - always add at least one window
    const actualRows = Math.max(1, rows);
    const actualColsX = Math.max(1, colsX);

    for (let row = 0; row < actualRows; row++) {
      for (let col = 0; col < actualColsX; col++) {
        const x = actualColsX > 1 ? (col - (actualColsX - 1) / 2) * spacing : 0;
        const y =
          actualRows > 1
            ? Math.max(1, 1 + row * spacing)
            : Math.max(1, height / 2);
        const z = depth / 2 + 0.01;
        addWindow([x, y, z], 0, rng(row * actualColsX + col) > 0.4);
      }
    }

    if (isResumeBuilding) {
      // Back face
      for (let row = 0; row < actualRows; row++) {
        for (let col = 0; col < actualColsX; col++) {
          const x =
            actualColsX > 1 ? (col - (actualColsX - 1) / 2) * spacing : 0;
          const y =
            actualRows > 1
              ? Math.max(1, 1 + row * spacing)
              : Math.max(1, height / 2);
          const z = -depth / 2 - 0.01;
          addWindow(
            [x, y, z],
            Math.PI,
            rng(row * actualColsX + col + 100) > 0.4
          );
        }
      }

      // Side faces (only for resume buildings)
      const actualColsZ = Math.max(1, colsZ);
      for (let row = 0; row < actualRows; row++) {
        for (let col = 0; col < actualColsZ; col++) {
          const z =
            actualColsZ > 1 ? (col - (actualColsZ - 1) / 2) * spacing : 0;
          const y =
            actualRows > 1
              ? Math.max(1, 1 + row * spacing)
              : Math.max(1, height / 2);

          // Left side
          const x = -width / 2 - 0.01;
          addWindow(
            [x, y, z],
            Math.PI / 2,
            rng(row * actualColsZ + col + 200) > 0.4
          );

          // Right side
          const x2 = width / 2 + 0.01;
          addWindow(
            [x2, y, z],
            -Math.PI / 2,
            rng(row * actualColsZ + col + 300) > 0.4
          );
        }
      }
    } else {
      // Regular buildings - add windows to all sides for better realism
      // Back face
      for (let row = 0; row < actualRows; row++) {
        for (let col = 0; col < actualColsX; col++) {
          const x =
            actualColsX > 1 ? (col - (actualColsX - 1) / 2) * spacing : 0;
          const y =
            actualRows > 1
              ? Math.max(1, 1 + row * spacing)
              : Math.max(1, height / 2);
          const z = -depth / 2 - 0.01;
          addWindow(
            [x, y, z],
            Math.PI,
            rng(row * actualColsX + col + 100) > 0.4
          );
        }
      }

      // Both side faces
      const actualColsZ = Math.max(1, colsZ);
      for (let row = 0; row < actualRows; row++) {
        for (let col = 0; col < actualColsZ; col++) {
          const z =
            actualColsZ > 1 ? (col - (actualColsZ - 1) / 2) * spacing : 0;
          const y =
            actualRows > 1
              ? Math.max(1, 1 + row * spacing)
              : Math.max(1, height / 2);

          // Left side
          const x = -width / 2 - 0.01;
          addWindow(
            [x, y, z],
            Math.PI / 2,
            rng(row * actualColsZ + col + 200) > 0.4
          );

          // Right side
          const x2 = width / 2 + 0.01;
          addWindow(
            [x2, y, z],
            -Math.PI / 2,
            rng(row * actualColsZ + col + 300) > 0.4
          );
        }
      }
    }

    return { litWindows: lit, unlitWindows: unlit };
  }, [width, depth, height, rows, colsX, colsZ, isResumeBuilding, seed]);

  useFrame(() => {
    if (windowMeshRef.current) {
      let index = 0;
      // Add all lit windows
      litWindows.forEach((window) => {
        const matrix = new THREE.Matrix4();
        matrix.makeRotationY(window.rotation);
        matrix.setPosition(
          window.position[0],
          window.position[1],
          window.position[2]
        );
        windowMeshRef.current!.setMatrixAt(index, matrix);
        index++;
      });
      // Add all unlit windows
      unlitWindows.forEach((window) => {
        const matrix = new THREE.Matrix4();
        matrix.makeRotationY(window.rotation);
        matrix.setPosition(
          window.position[0],
          window.position[1],
          window.position[2]
        );
        windowMeshRef.current!.setMatrixAt(index, matrix);
        index++;
      });
      windowMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const totalWindows = litWindows.length + unlitWindows.length;

  return (
    <>
      {/* All windows use the same daytime glass material */}
      {totalWindows > 0 && (
        <instancedMesh
          ref={windowMeshRef}
          args={[undefined, undefined, totalWindows]}
        >
          <planeGeometry args={[windowSize, windowSize]} />
          <meshStandardMaterial
            color="#B3E5FC"
            metalness={0.0}
            roughness={1.0}
            flatShading={true}
            transparent={true}
            opacity={0.8}
          />
        </instancedMesh>
      )}
    </>
  );
};

const Building = ({
  position,
  width,
  depth,
  height,
  color,
  isResumeBuilding = false,
  buildingId,
  buildingType = "modern",
}: BuildingProps) => {
  const seed = useMemo(() => Math.random() * 1000, []);

  // Regular buildings are not clickable
  const handleClick = () => {
    // Regular buildings don't have interactive features
  };

  // Material variations for realism with pastel colors
  const materials = useMemo(() => {
    const pastelColor = toPastel(color);
    const darkerPastel = pastelColor.clone().multiplyScalar(0.9);
    const lighterPastel = pastelColor.clone().multiplyScalar(1.1);

    return {
      main: new THREE.MeshStandardMaterial({
        color: pastelColor,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: darkerPastel,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
      }),
      base: new THREE.MeshStandardMaterial({
        color: lighterPastel,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
      }),
      roof: new THREE.MeshStandardMaterial({
        color: "#B8B8B8", // Lighter gray for pastel theme
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
      }),
      ledge: new THREE.MeshStandardMaterial({
        color: darkerPastel,
        roughness: 1.0,
        metalness: 0.0,
        flatShading: true,
      }),
    };
  }, [color]);

  // Building style variations
  const hasLedges = buildingType === "classic" || isResumeBuilding;
  const hasBaseFloor = buildingType !== "tower" || isResumeBuilding;
  const ledgeCount = hasLedges ? Math.floor(height / 8) : 0;

  return (
    <group position={position}>
      {/* Base floor - darker, more detailed */}
      {hasBaseFloor && (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[width, 3, depth]} />
          <primitive object={materials.base} attach="material" />
        </mesh>
      )}

      {/* Main building body */}
      <mesh position={[0, hasBaseFloor ? 3 + (height - 3) / 2 : height / 2, 0]}>
        <boxGeometry args={[width, height - (hasBaseFloor ? 3 : 0), depth]} />
        <primitive object={materials.main} attach="material" />
      </mesh>

      {/* Architectural ledges/cornices */}
      {hasLedges &&
        Array.from({ length: ledgeCount }).map((_, i) => {
          const mainBodyBottom = hasBaseFloor ? 3 : 0;
          const mainBodyHeight = height - (hasBaseFloor ? 3 : 0);
          const ledgeY =
            mainBodyBottom + (i + 1) * (mainBodyHeight / (ledgeCount + 1));
          return (
            <mesh
              key={`ledge-${i}`}
              position={[0, ledgeY, 0]}
              castShadow={false}
            >
              <boxGeometry args={[width + 0.15, 0.2, depth + 0.15]} />
              <primitive object={materials.ledge} attach="material" />
            </mesh>
          );
        })}

      {/* Windows - instanced for performance */}
      <InstancedWindows
        width={width}
        depth={depth}
        height={height - (hasBaseFloor ? 3 : 0)}
        isResumeBuilding={isResumeBuilding}
        seed={seed}
      />

      {/* Roof details - positioned correctly on top of building */}
      <mesh position={[0, height + 0.2, 0]} castShadow={false}>
        <boxGeometry args={[width + 0.3, 0.4, depth + 0.3]} />
        <primitive object={materials.roof} attach="material" />
      </mesh>

      {/* Roof accent (for taller buildings) */}
      {height > 15 && (
        <mesh position={[0, height + 0.4, 0]} castShadow={false}>
          <boxGeometry args={[width + 0.5, 0.2, depth + 0.5]} />
          <primitive object={materials.accent} attach="material" />
        </mesh>
      )}
    </group>
  );
};

const Buildings = () => {
  const { resume } = useResume();

  const buildings = useMemo(() => {
    const buildingElements: JSX.Element[] = [];
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
    const startPos = -totalSize / 2;
    let buildingIndex = 0;

    // Helper function to calculate grid cell center position
    const getGridPosition = (
      row: number,
      col: number
    ): [number, number, number] => {
      const x =
        startPos +
        col * (BLOCK_SIZE + STREET_WIDTH) +
        STREET_WIDTH +
        BLOCK_SIZE / 2;
      const z =
        startPos +
        row * (BLOCK_SIZE + STREET_WIDTH) +
        STREET_WIDTH +
        BLOCK_SIZE / 2;
      return [x, 0, z];
    };

    // Helper function to snap a position to the nearest grid cell
    const snapToGrid = (
      position: [number, number, number]
    ): [number, number, number] => {
      const [x, y, z] = position;
      const col = Math.round(
        (x - startPos - STREET_WIDTH - BLOCK_SIZE / 2) /
          (BLOCK_SIZE + STREET_WIDTH)
      );
      const row = Math.round(
        (z - startPos - STREET_WIDTH - BLOCK_SIZE / 2) /
          (BLOCK_SIZE + STREET_WIDTH)
      );

      // Clamp to valid grid bounds
      const clampedCol = Math.max(0, Math.min(GRID_SIZE - 1, col));
      const clampedRow = Math.max(0, Math.min(GRID_SIZE - 1, row));

      return getGridPosition(clampedRow, clampedCol);
    };

    // Park positions (must match Parks.tsx) - center park at (2,2)
    const parkPositions = new Set(["2,2"]);

    // Track which grid cells are occupied by resume buildings
    const occupiedGridCells = new Set<string>();

    // First, render all resume buildings at their exact positions (snapped to grid)
    // Each building loads independently with Suspense
    resume.experiences.forEach((exp) => {
      const [x, y, z] = snapToGrid(exp.buildingPosition);
      buildingElements.push(
        <Suspense key={`suspense-work-${exp.id}`} fallback={null}>
          <WorkBuilding
            key={`work-${exp.id}`}
            position={[x, y, z]}
            width={7}
            depth={7}
            height={24 + Math.random() * 6}
            color={exp.buildingColor}
            buildingId={exp.id}
          />
        </Suspense>
      );
      buildingIndex++;
      // Mark nearby grid cells as occupied (col, row format)
      const col = Math.round(
        (x - startPos - STREET_WIDTH - BLOCK_SIZE / 2) /
          (BLOCK_SIZE + STREET_WIDTH)
      );
      const row = Math.round(
        (z - startPos - STREET_WIDTH - BLOCK_SIZE / 2) /
          (BLOCK_SIZE + STREET_WIDTH)
      );
      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        occupiedGridCells.add(`${row},${col}`);
      }
    });

    resume.education.forEach((edu) => {
      const [x, y, z] = snapToGrid(edu.buildingPosition);
      buildingElements.push(
        <Suspense key={`suspense-edu-${edu.id}`} fallback={null}>
          <EducationBuilding
            key={`edu-${edu.id}`}
            position={[x, y, z]}
            width={8}
            depth={8}
            height={20 + Math.random() * 6}
            color={edu.buildingColor}
            buildingId={edu.id}
          />
        </Suspense>
      );
      buildingIndex++;
      // Mark nearby grid cells as occupied (col, row format)
      const col = Math.round(
        (x - startPos - STREET_WIDTH - BLOCK_SIZE / 2) /
          (BLOCK_SIZE + STREET_WIDTH)
      );
      const row = Math.round(
        (z - startPos - STREET_WIDTH - BLOCK_SIZE / 2) /
          (BLOCK_SIZE + STREET_WIDTH)
      );
      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        occupiedGridCells.add(`${row},${col}`);
      }
    });

    resume.personalProjects.forEach((project) => {
      const [x, y, z] = snapToGrid(project.buildingPosition);
      // Use kit-bashed GenericBuilding models for personal projects
      buildingElements.push(
        <Suspense key={`suspense-project-${project.id}`} fallback={null}>
          <ProjectBuilding
            key={`project-${project.id}`}
            position={[x, y, z]}
            buildingId={project.id}
            color={project.buildingColor}
          />
        </Suspense>
      );
      buildingIndex++;
      // Mark nearby grid cells as occupied (col, row format)
      const col = Math.round(
        (x - startPos - STREET_WIDTH - BLOCK_SIZE / 2) /
          (BLOCK_SIZE + STREET_WIDTH)
      );
      const row = Math.round(
        (z - startPos - STREET_WIDTH - BLOCK_SIZE / 2) /
          (BLOCK_SIZE + STREET_WIDTH)
      );
      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        occupiedGridCells.add(`${row},${col}`);
      }
    });

    // Add building blocks using Low Buildings and Skyscrapers in empty grid cells
    // Use House.glb for one specific grid tile - replace the first available BuildingBlock
    let housePlaced = false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const gridKey = `${row},${col}`;

        // Skip if this cell is occupied by a resume building or is a park
        if (occupiedGridCells.has(gridKey) || parkPositions.has(gridKey)) {
          continue;
        }

        const position = getGridPosition(row, col);

        // Place house at the first available position instead of a BuildingBlock (only once)
        if (!housePlaced) {
          buildingElements.push(
            <Suspense key={`suspense-house-${row}-${col}`} fallback={null}>
              <HouseBuilding
                key={`house-${row}-${col}`}
                position={position}
              />
            </Suspense>
          );
          housePlaced = true;
          buildingIndex++;
          continue;
        }

        // Create a deterministic seed for this position
        const seed = row * GRID_SIZE + col;
        const hash = seed
          .toString()
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Calculate scale based on position hash for variety
        const baseScale = 4.5 + (hash % 20) * 0.15; // Increased from 3.0-5.0 to 4.5-7.5

        // Create building block ID for consistency
        const buildingBlockId = `block-${row}-${col}`;

        buildingElements.push(
          <Suspense key={`suspense-${buildingBlockId}`} fallback={null}>
            <BuildingBlock
              key={buildingBlockId}
              position={position}
              buildingId={buildingBlockId}
              scale={baseScale}
            />
          </Suspense>
        );
        buildingIndex++;
      }
    }

    return buildingElements;
  }, [resume]);

  return <group>{buildings}</group>;
};

export default Buildings;
