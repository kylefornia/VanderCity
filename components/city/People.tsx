import { useMemo, useRef, memo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STREET_WIDTH, BLOCK_SIZE, GRID_SIZE } from "./cityConstants";

interface PersonProps {
  position: [number, number, number];
  speed: number;
  path: THREE.Vector3[];
  pathIndex: number;
  bodyColor?: string;
  skinColor?: string;
}

// Variety of clothing colors
const clothingColors = [
  "#4a5568", // Gray
  "#2d3748", // Dark gray
  "#1a202c", // Black
  "#2c5282", // Blue
  "#2c7a7b", // Teal
  "#744210", // Brown
  "#742a2a", // Red
  "#553c9a", // Purple
];

const skinColors = [
  "#fdbcb4", // Light
  "#f4a460", // Tan
  "#d2691e", // Medium
  "#cd853f", // Bronze
];

const Person = memo(({
  position,
  speed,
  path,
  pathIndex,
  bodyColor = "#4a5568",
  skinColor = "#fdbcb4",
}: PersonProps) => {
  const personRef = useRef<THREE.Group>(null);
  const currentPathIndex = useRef(pathIndex);
  const progress = useRef(0);

  // Per-person materials with variety - create new materials for each
  const personBodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true,
      }),
    [bodyColor]
  );

  const personSkinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true,
      }),
    [skinColor]
  );

  useFrame((_state, delta) => {
    if (!personRef.current || path.length === 0) return;

    const currentPoint = path[currentPathIndex.current];
    const nextIndex = (currentPathIndex.current + 1) % path.length;
    const nextPoint = path[nextIndex];

    progress.current += speed * delta;

    if (progress.current >= 1) {
      progress.current = 0;
      currentPathIndex.current = nextIndex;
    }

    // Always update position every frame for smooth movement
    const currentPos = new THREE.Vector3().lerpVectors(
      currentPoint,
      nextPoint,
      progress.current
    );

    personRef.current.position.set(currentPos.x, currentPos.y, currentPos.z);

    // Rotate to face direction of movement
    const direction = new THREE.Vector3()
      .subVectors(nextPoint, currentPoint)
      .normalize();
    if (direction.length() > 0.001) {
      const angle = Math.atan2(direction.x, direction.z);
      personRef.current.rotation.y = angle;
    }
  });

  return (
    <group ref={personRef} position={position}>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} material={personSkinMaterial}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
      </mesh>

      {/* Body/Torso */}
      <mesh position={[0, 0.9, 0]} material={personBodyMaterial}>
        <boxGeometry args={[0.4, 0.6, 0.25]} />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-0.35, 0.9, 0]} material={personSkinMaterial}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
      </mesh>

      {/* Right Arm */}
      <mesh position={[0.35, 0.9, 0]} material={personSkinMaterial}>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.15, 0.35, 0]} material={personBodyMaterial}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.15, 0.35, 0]} material={personBodyMaterial}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
      </mesh>
    </group>
  );
});

Person.displayName = 'Person';

import { useSceneSettings } from "@/context/SceneSettingsContext";

const People = () => {
  // Ground offset for voxel person - set to 0 to match basketball players
  const groundOffset = 0;
  const { peopleCount } = useSceneSettings();

  // Create people instances walking along sidewalks
  const people = useMemo(() => {
    const peopleElements: JSX.Element[] = [];
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
    const startPos = -totalSize / 2;
    const groundBound = 80;
    const numPeople = peopleCount;

    // Helper RNG function
    const rng = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    // Generate realistic sidewalk paths around building blocks
    const generateSidewalkPath = (
      blockRow: number,
      blockCol: number,
      seed: number
    ): THREE.Vector3[] => {
      const path: THREE.Vector3[] = [];
      const SIDEWALK_OFFSET = 1.2; // Distance from block edge to sidewalk

      const blockStartX =
        startPos + blockCol * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH;
      const blockEndX = blockStartX + BLOCK_SIZE;
      const blockStartZ =
        startPos + blockRow * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH;
      const blockEndZ = blockStartZ + BLOCK_SIZE;

      // Skip if outside bounds
      const blockCenterX = (blockStartX + blockEndX) / 2;
      const blockCenterZ = (blockStartZ + blockEndZ) / 2;
      if (
        Math.abs(blockCenterX) >= groundBound ||
        Math.abs(blockCenterZ) >= groundBound
      ) {
        return path;
      }

      // Create looping paths around blocks for continuous walking
      const pathType = Math.floor(rng(seed + 10) * 5);
      const stepSize = 2; // Smaller steps for more realistic walking

      switch (pathType) {
        case 0: // Full loop around block (most common for busy feel)
          // North side
          for (let x = blockStartX; x <= blockEndX; x += stepSize) {
            path.push(
              new THREE.Vector3(x, groundOffset, blockStartZ + SIDEWALK_OFFSET)
            );
          }
          // East side
          for (let z = blockStartZ; z <= blockEndZ; z += stepSize) {
            path.push(
              new THREE.Vector3(blockEndX - SIDEWALK_OFFSET, groundOffset, z)
            );
          }
          // South side
          for (let x = blockEndX; x >= blockStartX; x -= stepSize) {
            path.push(
              new THREE.Vector3(x, groundOffset, blockEndZ - SIDEWALK_OFFSET)
            );
          }
          // West side
          for (let z = blockEndZ; z >= blockStartZ; z -= stepSize) {
            path.push(
              new THREE.Vector3(blockStartX + SIDEWALK_OFFSET, groundOffset, z)
            );
          }
          break;

        case 1: // North + East sides (L-shaped path)
          // North side (left to right)
          for (let x = blockStartX; x <= blockEndX; x += stepSize) {
            path.push(
              new THREE.Vector3(x, groundOffset, blockStartZ + SIDEWALK_OFFSET)
            );
          }
          // East side (top to bottom)
          for (let z = blockStartZ; z <= blockEndZ; z += stepSize) {
            path.push(
              new THREE.Vector3(blockEndX - SIDEWALK_OFFSET, groundOffset, z)
            );
          }
          // Return along same path in reverse to create loop
          for (let z = blockEndZ; z >= blockStartZ; z -= stepSize) {
            path.push(
              new THREE.Vector3(blockEndX - SIDEWALK_OFFSET, groundOffset, z)
            );
          }
          for (let x = blockEndX; x >= blockStartX; x -= stepSize) {
            path.push(
              new THREE.Vector3(x, groundOffset, blockStartZ + SIDEWALK_OFFSET)
            );
          }
          break;

        case 2: { // Long horizontal path across multiple blocks
          const horizontalStart = Math.max(blockStartX - BLOCK_SIZE, -groundBound);
          const horizontalEnd = Math.min(blockEndX + BLOCK_SIZE, groundBound);
          for (let x = horizontalStart; x <= horizontalEnd; x += stepSize) {
            path.push(
              new THREE.Vector3(
                Math.max(horizontalStart, Math.min(x, horizontalEnd)),
                groundOffset,
                blockStartZ + SIDEWALK_OFFSET
              )
            );
          }
          break;
        }

        case 3: { // Long vertical path across multiple blocks
          const verticalStart = Math.max(blockStartZ - BLOCK_SIZE, -groundBound);
          const verticalEnd = Math.min(blockEndZ + BLOCK_SIZE, groundBound);
          for (let z = verticalStart; z <= verticalEnd; z += stepSize) {
            path.push(
              new THREE.Vector3(
                blockEndX - SIDEWALK_OFFSET,
                groundOffset,
                Math.max(verticalStart, Math.min(z, verticalEnd))
              )
            );
          }
          break;
        }

        case 4: { // Square loop around multiple blocks
          // Create a larger square path
          const loopSize = BLOCK_SIZE * 2;
          const loopStartX = blockCenterX - loopSize / 2;
          const loopEndX = blockCenterX + loopSize / 2;
          const loopStartZ = blockCenterZ - loopSize / 2;
          const loopEndZ = blockCenterZ + loopSize / 2;
          
          // North
          for (let x = loopStartX; x <= loopEndX; x += stepSize) {
            if (Math.abs(x) < groundBound && Math.abs(loopStartZ) < groundBound) {
              path.push(new THREE.Vector3(x, groundOffset, loopStartZ + SIDEWALK_OFFSET));
            }
          }
          // East
          for (let z = loopStartZ; z <= loopEndZ; z += stepSize) {
            if (Math.abs(loopEndX) < groundBound && Math.abs(z) < groundBound) {
              path.push(new THREE.Vector3(loopEndX - SIDEWALK_OFFSET, groundOffset, z));
            }
          }
          // South
          for (let x = loopEndX; x >= loopStartX; x -= stepSize) {
            if (Math.abs(x) < groundBound && Math.abs(loopEndZ) < groundBound) {
              path.push(new THREE.Vector3(x, groundOffset, loopEndZ - SIDEWALK_OFFSET));
            }
          }
          // West
          for (let z = loopEndZ; z >= loopStartZ; z -= stepSize) {
            if (Math.abs(loopStartX) < groundBound && Math.abs(z) < groundBound) {
              path.push(new THREE.Vector3(loopStartX + SIDEWALK_OFFSET, groundOffset, z));
            }
          }
          break;
        }
      }

      // Remove duplicate consecutive points and ensure path loops
      const cleanPath: THREE.Vector3[] = [];
      for (let i = 0; i < path.length; i++) {
        if (
          i === 0 ||
          path[i].distanceTo(cleanPath[cleanPath.length - 1]) > 0.5
        ) {
          cleanPath.push(path[i]);
        }
      }

      // Ensure path loops by adding first point at end if not already close
      if (cleanPath.length > 2) {
        const lastPoint = cleanPath[cleanPath.length - 1];
        const firstPoint = cleanPath[0];
        if (lastPoint.distanceTo(firstPoint) > 1) {
          cleanPath.push(firstPoint.clone());
        }
      }

      return cleanPath.length > 1 ? cleanPath : [];
    };

    for (let i = 0; i < numPeople; i++) {
      const seed = i * 500;
      const blockRow = Math.floor(rng(seed) * GRID_SIZE);
      const blockCol = Math.floor(rng(seed + 1) * GRID_SIZE);

      const path = generateSidewalkPath(blockRow, blockCol, seed);

      if (path.length > 1) {
        // Realistic walking speeds (slower than cars)
        const speed = 0.15 + rng(seed + 3) * 0.15; // 0.15 to 0.3
        const initialPosition = path[0];
        
        // Add variety to person appearance
        const bodyColor = clothingColors[Math.floor(rng(seed + 5) * clothingColors.length)];
        const skinColor = skinColors[Math.floor(rng(seed + 6) * skinColors.length)];

        peopleElements.push(
          <Person
            key={`person-${i}`}
            position={[initialPosition.x, initialPosition.y, initialPosition.z]}
            speed={speed}
            path={path}
            pathIndex={0}
            bodyColor={bodyColor}
            skinColor={skinColor}
          />
        );
      }
    }

    return peopleElements;
  }, [groundOffset, peopleCount]);

  return <group>{people}</group>;
};

export default People;
