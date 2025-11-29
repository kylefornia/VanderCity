"use client";

import * as THREE from "three";

import { BLOCK_SIZE, GRID_SIZE, STREET_WIDTH } from "./cityConstants";

import { useGLTF } from "@react-three/drei";
import { useMemo, memo } from "react";

// Tree model paths
const TREE_MODELS = [
  "/models/Tree 1.glb",
  "/models/Tree 2.glb",
  "/models/Tree 3.glb",
];

// Preload the tree assets
TREE_MODELS.forEach((model) => useGLTF.preload(model));

interface TreeInstance {
  position: THREE.Vector3;
  rotation: number;
  treeType: number;
  scale: number;
}

// Memoized tree instance component for better performance
const TreeInstance = memo(({ 
  tree, 
  treeModel, 
  groundOffset 
}: { 
  tree: TreeInstance; 
  treeModel: THREE.Object3D; 
  groundOffset: number;
}) => {
  const instanceModel = useMemo(() => treeModel.clone(), [treeModel]);
  
  return (
    <group
      position={[
        tree.position.x,
        tree.position.y + groundOffset * tree.scale,
        tree.position.z,
      ]}
      rotation={[0, tree.rotation, 0]}
      scale={tree.scale}
    >
      <primitive object={instanceModel} />
    </group>
  );
});

TreeInstance.displayName = "TreeInstance";

const Trees = () => {
  // Load all three tree models
  const tree1 = useGLTF(TREE_MODELS[0]);
  const tree2 = useGLTF(TREE_MODELS[1]);
  const tree3 = useGLTF(TREE_MODELS[2]);

  // Store the scenes for each tree model - clone once and reuse
  const treeModels = useMemo(() => {
    return [tree1.scene.clone(), tree2.scene.clone(), tree3.scene.clone()];
  }, [tree1.scene, tree2.scene, tree3.scene]);

  // Pre-calculate ground offsets for each tree type
  const treeGroundOffsets = useMemo(() => {
    return treeModels.map((model) => {
      const box = new THREE.Box3();
      box.setFromObject(model);
      return -box.min.y;
    });
  }, [treeModels]);

  const { treeInstances } = useMemo(() => {
    const instances: TreeInstance[] = [];
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
    const startPos = -totalSize / 2;
    const groundBound = 80;

    const parkPositions = new Set(["2,2"]); // Center park

    // Helper RNG function
    const rng = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    // Place trees in all blocks
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const gridKey = `${row},${col}`;
        const isPark = parkPositions.has(gridKey);

        const blockStartX =
          startPos + col * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH;
        const blockEndX = blockStartX + BLOCK_SIZE;
        const blockStartZ =
          startPos + row * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH;
        const blockEndZ = blockStartZ + BLOCK_SIZE;
        const blockCenterX = blockStartX + BLOCK_SIZE / 2;
        const blockCenterZ = blockStartZ + BLOCK_SIZE / 2;

        const seed = row * GRID_SIZE + col;

        if (isPark) {
          // Moderate tree density in parks
          const parkTreeSpacing = 5.5;
          const parkMargin = 2.0;
          const parkStartX = blockStartX + parkMargin;
          const parkEndX = blockEndX - parkMargin;
          const parkStartZ = blockStartZ + parkMargin;
          const parkEndZ = blockEndZ - parkMargin;

          for (let px = parkStartX; px < parkEndX; px += parkTreeSpacing) {
            for (let pz = parkStartZ; pz < parkEndZ; pz += parkTreeSpacing) {
              const treeSeed = seed + px * 100 + pz * 1000;
              const offsetX = (rng(treeSeed) - 0.5) * 1.5;
              const offsetZ = (rng(treeSeed + 1) - 0.5) * 1.5;
              const treeX = px + offsetX;
              const treeZ = pz + offsetZ;

              // Avoid center fountain area
              const distFromCenter = Math.sqrt(
                Math.pow(treeX - blockCenterX, 2) +
                  Math.pow(treeZ - blockCenterZ, 2)
              );
              if (distFromCenter < 4) continue;

              if (
                Math.abs(treeX) < groundBound - 1 &&
                Math.abs(treeZ) < groundBound - 1
              ) {
                const rotation = rng(treeSeed + 2) * Math.PI * 2;
                // Ensure even distribution: cycle through 0, 1, 2
                const treeType = Math.abs(Math.floor((treeSeed + px + pz) % 3));
                const scale =
                  treeType === 0
                    ? 0.7 + rng(treeSeed + 4) * 0.3
                    : treeType === 1
                    ? 2.2 + rng(treeSeed + 4) * 0.6
                    : 1.8 + rng(treeSeed + 4) * 0.6;

                instances.push({
                  position: new THREE.Vector3(treeX, 0, treeZ),
                  rotation,
                  treeType,
                  scale,
                });
              }
            }
          }
        } else {
          // Sparse trees in regular blocks
          const numTreesPerBlock = 2 + Math.floor(rng(seed + 100) * 3);

          for (let i = 0; i < numTreesPerBlock; i++) {
            const treeSeed = seed + i * 1000;

            // Prefer edges and corners, avoid center where buildings are
            const edgePreference = rng(treeSeed + 1);
            let treeX: number, treeZ: number;

            if (edgePreference < 0.4) {
              // Near edges
              const side = Math.floor(rng(treeSeed + 2) * 4);
              if (side === 0) {
                treeX = blockStartX + 1.5 + rng(treeSeed + 3) * 2;
                treeZ =
                  blockStartZ + 1.5 + rng(treeSeed + 4) * (BLOCK_SIZE - 3);
              } else if (side === 1) {
                treeX = blockEndX - 1.5 - rng(treeSeed + 3) * 2;
                treeZ =
                  blockStartZ + 1.5 + rng(treeSeed + 4) * (BLOCK_SIZE - 3);
              } else if (side === 2) {
                treeX =
                  blockStartX + 1.5 + rng(treeSeed + 3) * (BLOCK_SIZE - 3);
                treeZ = blockStartZ + 1.5 + rng(treeSeed + 4) * 2;
              } else {
                treeX =
                  blockStartX + 1.5 + rng(treeSeed + 3) * (BLOCK_SIZE - 3);
                treeZ = blockEndZ - 1.5 - rng(treeSeed + 4) * 2;
              }
            } else {
              // Random placement but avoid center
              const distFromCenter = 3 + rng(treeSeed + 3) * 5;
              const angle = rng(treeSeed + 4) * Math.PI * 2;
              treeX = blockCenterX + Math.cos(angle) * distFromCenter;
              treeZ = blockCenterZ + Math.sin(angle) * distFromCenter;

              // Clamp to block bounds
              treeX = Math.max(
                blockStartX + 1.5,
                Math.min(blockEndX - 1.5, treeX)
              );
              treeZ = Math.max(
                blockStartZ + 1.5,
                Math.min(blockEndZ - 1.5, treeZ)
              );
            }

            // Ensure not too close to center (building area) - increased for larger buildings like schools
            const distFromCenter = Math.sqrt(
              Math.pow(treeX - blockCenterX, 2) +
                Math.pow(treeZ - blockCenterZ, 2)
            );
            if (distFromCenter < 5) continue; // Increased from 3 to 5 to prevent trees in schools

            if (
              Math.abs(treeX) < groundBound - 1 &&
              Math.abs(treeZ) < groundBound - 1
            ) {
              const rotation = rng(treeSeed + 5) * Math.PI * 2;
              // Ensure even distribution: cycle through 0, 1, 2
              const treeType = Math.abs(
                Math.floor((treeSeed + i + row + col) % 3)
              );
              const scale =
                treeType === 0
                  ? 0.7 + rng(treeSeed + 7) * 0.3
                  : treeType === 1
                  ? 2.2 + rng(treeSeed + 7) * 0.6
                  : 1.8 + rng(treeSeed + 7) * 0.6;

              instances.push({
                position: new THREE.Vector3(treeX, 0, treeZ),
                rotation,
                treeType,
                scale,
              });
            }
          }
        }
      }
    }


    return { treeInstances: instances };
  }, []);

  // Group tree instances by type for optimized rendering
  const treeInstancesByType = useMemo(() => {
    const grouped: { [key: number]: TreeInstance[] } = {};
    treeInstances.forEach((tree) => {
      const type = tree.treeType % treeModels.length;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(tree);
    });
    return grouped;
  }, [treeInstances, treeModels.length]);

  // Render trees grouped by type for better batching
  return (
    <group>
      {Object.entries(treeInstancesByType).map(([typeStr, instances]) => {
        const typeIndex = parseInt(typeStr);
        const treeModel = treeModels[typeIndex];
        if (!treeModel) return null;

        const groundOffset = treeGroundOffsets[typeIndex] || 0;

        return (
          <group key={typeIndex}>
            {instances.map((tree, index) => {
              // Use a stable key based on position to help React optimize
              const key = `tree-${typeIndex}-${Math.round(tree.position.x * 10)}-${Math.round(tree.position.z * 10)}`;
              
              return (
                <TreeInstance
                  key={key}
                  tree={tree}
                  treeModel={treeModel}
                  groundOffset={groundOffset}
                />
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

export default Trees;
