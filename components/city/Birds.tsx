"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { STREET_WIDTH, BLOCK_SIZE, GRID_SIZE } from "./cityConstants";

// Preload the flying gull model
useGLTF.preload("/models/Flying gull.glb");

interface BirdInstance {
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  speed: number;
  progress: number;
  scale: number;
  flockOffset: THREE.Vector3; // Offset from flock center
}

const Birds = () => {
  const { scene } = useGLTF("/models/Flying gull.glb");
  const birdGroupRef = useRef<THREE.Group>(null);

  // Clone the gull model for reuse
  const gullModel = useMemo(() => scene.clone(), [scene]);

  // Create bird instances with flight paths - organized in flocks of 3
  const birds = useMemo(() => {
    const birdInstances: BirdInstance[] = [];
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
    const startPos = -totalSize / 2;
    const groundBound = 80;
    const numFlocks = 1; // Number of flocks - just 1 group
    const birdsPerFlock = 3; // Birds per flock

    // Helper RNG function
    const rng = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    // Create flocks of 3 birds each
    for (let flockIndex = 0; flockIndex < numFlocks; flockIndex++) {
      const flockSeed = flockIndex * 2000;

      // Flock center positions
      const startX = (rng(flockSeed) - 0.5) * groundBound * 1.5;
      const startZ = (rng(flockSeed + 1) - 0.5) * groundBound * 1.5;
      const startY = 15 + rng(flockSeed + 2) * 20; // Fly between 15-35 units high

      const endX = (rng(flockSeed + 10) - 0.5) * groundBound * 1.5;
      const endZ = (rng(flockSeed + 11) - 0.5) * groundBound * 1.5;
      const endY = 15 + rng(flockSeed + 12) * 20;

      const speed = 0.1 + rng(flockSeed + 3) * 0.15; // Slower flight speed variation
      const sharedProgress = rng(flockSeed + 5); // Shared progress for all birds in flock

      // Create 3 birds in this flock
      for (let birdInFlock = 0; birdInFlock < birdsPerFlock; birdInFlock++) {
        const birdSeed = flockSeed + birdInFlock * 100;

        // Small offset from flock center for formation - more spacing
        const offsetX = (rng(birdSeed) - 0.5) * 6; // Spread within 6 units (increased from 3)
        const offsetY = (rng(birdSeed + 1) - 0.5) * 3; // Increased from 2
        const offsetZ = (rng(birdSeed + 2) - 0.5) * 6; // Spread within 6 units (increased from 3)

        const scale = 0.015 + rng(birdSeed + 4) * 0.01; // Much smaller: 0.015 to 0.025

        birdInstances.push({
          startPosition: new THREE.Vector3(startX, startY, startZ),
          endPosition: new THREE.Vector3(endX, endY, endZ),
          speed: speed * 0.005, // Slower per-frame speed
          progress: sharedProgress, // All birds in flock share same progress
          scale,
          flockOffset: new THREE.Vector3(offsetX, offsetY, offsetZ),
        });
      }
    }

    return birdInstances;
  }, []);

  // Animate birds flying in flocks
  useFrame(() => {
    if (birdGroupRef.current) {
      const birdsPerFlock = 3;
      const numFlocks = Math.ceil(birds.length / birdsPerFlock);

      // Process each flock
      for (let flockIndex = 0; flockIndex < numFlocks; flockIndex++) {
        const firstBirdIndex = flockIndex * birdsPerFlock;
        const firstBird = birds[firstBirdIndex];
        if (!firstBird) continue;

        // Update progress (all birds in flock share the same progress)
        firstBird.progress += firstBird.speed;

        // Loop back to start when reaching end - update entire flock
        if (firstBird.progress >= 1) {
          // Generate new end position for the flock
          const rng = (seed: number) => {
            const x = Math.sin(seed * 12.9898) * 43758.5453;
            return x - Math.floor(x);
          };
          const seed = flockIndex * 2000 + Date.now();
          const groundBound = 80;

          // Calculate current flock center position
          const currentFlockCenter = new THREE.Vector3().lerpVectors(
            firstBird.startPosition,
            firstBird.endPosition,
            1.0
          );

          // Update all birds in this flock
          for (let i = 0; i < birdsPerFlock; i++) {
            const birdIndex = firstBirdIndex + i;
            const bird = birds[birdIndex];
            if (!bird) continue;

            // New destination for the flock
            const newEndX = (rng(seed) - 0.5) * groundBound * 1.5;
            const newEndY = 15 + rng(seed + 1) * 20;
            const newEndZ = (rng(seed + 2) - 0.5) * groundBound * 1.5;

            // Update start position to current position, end to new destination
            bird.startPosition.copy(currentFlockCenter);
            bird.endPosition.set(newEndX, newEndY, newEndZ);
            bird.progress = 0; // Reset progress for all birds in flock
          }
        } else {
          // Sync progress for all birds in the flock
          for (let i = 1; i < birdsPerFlock; i++) {
            const birdIndex = firstBirdIndex + i;
            const bird = birds[birdIndex];
            if (bird) {
              bird.progress = firstBird.progress;
            }
          }
        }
      }

      // Update all bird positions
      birds.forEach((bird, index) => {
        // Interpolate flock center position
        const flockCenterPos = new THREE.Vector3().lerpVectors(
          bird.startPosition,
          bird.endPosition,
          bird.progress
        );

        // Add flock offset to get individual bird position
        const currentPos = flockCenterPos.clone().add(bird.flockOffset);

        // Update bird position
        if (birdGroupRef.current && birdGroupRef.current.children[index]) {
          const birdMesh = birdGroupRef.current.children[index] as THREE.Group;
          if (birdMesh) {
            birdMesh.position.copy(currentPos);

            // Rotate bird to face direction of travel
            const direction = new THREE.Vector3()
              .subVectors(bird.endPosition, bird.startPosition)
              .normalize();
            if (direction.length() > 0) {
              // Calculate angle - reverse direction to fix backwards flying
              // If flying backwards, subtract PI (180 degrees) or adjust the offset
              const angle = Math.atan2(direction.x, direction.z) - Math.PI / 2;
              birdMesh.rotation.y = angle;
            }
          }
        }
      });
    }
  });

  // Calculate bounding box for ground offset
  const groundOffset = useMemo(() => {
    const box = new THREE.Box3();
    box.setFromObject(gullModel);
    return -box.min.y;
  }, [gullModel]);

  return (
    <group ref={birdGroupRef}>
      {birds.map((bird, index) => {
        const flockCenterPos = bird.startPosition.clone();
        flockCenterPos.lerp(bird.endPosition, bird.progress);
        const birdPos = flockCenterPos.clone().add(bird.flockOffset);

        return (
          <group
            key={index}
            position={[
              birdPos.x,
              birdPos.y + groundOffset * bird.scale,
              birdPos.z,
            ]}
            scale={bird.scale}
          >
            <primitive object={gullModel.clone()} />
          </group>
        );
      })}
    </group>
  );
};

export default Birds;
