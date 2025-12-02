import * as THREE from "three";

import { BLOCK_SIZE, GRID_SIZE, STREET_WIDTH } from "./cityConstants";
import { useMemo, useRef } from "react";

import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

// Preload the cloud model
useGLTF.preload("/models/Clouds.glb");

interface CloudInstance {
  position: THREE.Vector3;
  scale: number;
  rotation: number;
  speed: number;
  direction: THREE.Vector2; // X and Z movement direction
}

const Clouds = () => {
  const { scene } = useGLTF("/models/Clouds.glb");
  const cloudGroupRef = useRef<THREE.Group>(null);

  // Clone the cloud model for reuse
  const cloudModel = useMemo(() => scene.clone(), [scene]);

  // Create cloud instances
  const clouds = useMemo(() => {
    const cloudInstances: CloudInstance[] = [];
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
    const gridBound = totalSize / 2;
    // Expand movement area beyond grid for more coverage
    const movementBound = gridBound * 1.5; // 50% larger than grid
    const numClouds = 8; // Number of clouds

    // Helper RNG function
    const rng = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    for (let i = 0; i < numClouds; i++) {
      const seed = i * 1000;

      // Random positions high in the sky, covering expanded grid area
      const x = (rng(seed) - 0.5) * movementBound * 2;
      const z = (rng(seed + 1) - 0.5) * movementBound * 2;
      const y = 40 + rng(seed + 2) * 30; // Fly between 40-70 units high

      const scale = 8 + rng(seed + 3) * 7; // Scale variation: 8 to 15
      const rotation = rng(seed + 4) * Math.PI * 2; // Random rotation
      const speed = 0.01 + rng(seed + 5) * 0.02; // Slow drift speed

      // Random direction for each cloud (X and Z components)
      const directionAngle = rng(seed + 6) * Math.PI * 2;
      const direction = new THREE.Vector2(
        Math.cos(directionAngle),
        Math.sin(directionAngle)
      );

      cloudInstances.push({
        position: new THREE.Vector3(x, y, z),
        scale,
        rotation,
        speed,
        direction,
      });
    }

    return cloudInstances;
  }, []);

  // Animate clouds drifting
  useFrame((_state, delta) => {
    if (cloudGroupRef.current) {
      const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
      const gridBound = totalSize / 2;
      const movementBound = gridBound * 1.5; // Match the expanded area

      clouds.forEach((cloud, index) => {
        // Move clouds in their assigned direction (both X and Z)
        cloud.position.x += cloud.speed * delta * 10 * cloud.direction.x;
        cloud.position.z += cloud.speed * delta * 10 * cloud.direction.y;

        // Wrap around when clouds go too far in any direction
        if (cloud.position.x > movementBound) {
          cloud.position.x = -movementBound;
          // Reset Y and Z for variety when wrapping
          const rng = (seed: number) => {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
          };
          cloud.position.y = 40 + rng(index * 1000 + Date.now()) * 30;
          cloud.position.z =
            (rng(index * 1000 + Date.now() + 1) - 0.5) * movementBound * 2;
        } else if (cloud.position.x < -movementBound) {
          cloud.position.x = movementBound;
          const rng = (seed: number) => {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
          };
          cloud.position.y = 40 + rng(index * 1000 + Date.now()) * 30;
          cloud.position.z =
            (rng(index * 1000 + Date.now() + 1) - 0.5) * movementBound * 2;
        }

        if (cloud.position.z > movementBound) {
          cloud.position.z = -movementBound;
          const rng = (seed: number) => {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
          };
          cloud.position.y = 40 + rng(index * 1000 + Date.now()) * 30;
          cloud.position.x =
            (rng(index * 1000 + Date.now() + 2) - 0.5) * movementBound * 2;
        } else if (cloud.position.z < -movementBound) {
          cloud.position.z = movementBound;
          const rng = (seed: number) => {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
          };
          cloud.position.y = 40 + rng(index * 1000 + Date.now()) * 30;
          cloud.position.x =
            (rng(index * 1000 + Date.now() + 2) - 0.5) * movementBound * 2;
        }

        // Update cloud position
        if (cloudGroupRef.current && cloudGroupRef.current.children[index]) {
          const cloudMesh = cloudGroupRef.current.children[
            index
          ] as THREE.Group;
          if (cloudMesh) {
            cloudMesh.position.copy(cloud.position);
          }
        }
      });
    }
  });

  return (
    <group ref={cloudGroupRef}>
      {clouds.map((cloud, index) => (
        <group
          key={index}
          position={cloud.position}
          scale={cloud.scale}
          rotation={[0, cloud.rotation, 0]}
        >
          <primitive object={cloudModel.clone()} />
        </group>
      ))}
    </group>
  );
};

export default Clouds;
