"use client";

import * as THREE from "three";

import { BLOCK_SIZE, GRID_SIZE, STREET_WIDTH } from "./cityConstants";
import { useMemo, useRef } from "react";

import { useFrame } from "@react-three/fiber";

// Shared materials for low-poly style - lighter colors with flat shading
const streetMaterial = new THREE.MeshStandardMaterial({
  color: "#4a4a4a",
  roughness: 1.0,
  metalness: 0.0,
  flatShading: true,
  side: THREE.DoubleSide,
  depthWrite: true,
});

const sidewalkMaterial = new THREE.MeshStandardMaterial({
  color: "#9e9e9e",
  roughness: 1.0,
  metalness: 0.0,
  flatShading: true,
  side: THREE.DoubleSide,
  depthWrite: true,
});

const markingMaterial = new THREE.MeshStandardMaterial({
  color: "#ffeb3b",
  emissive: "#ffeb3b",
  emissiveIntensity: 0.2,
  flatShading: true,
  side: THREE.DoubleSide,
  depthWrite: true,
});

const whiteStripeMaterial = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  emissive: "#ffffff",
  emissiveIntensity: 0.3,
  flatShading: true,
  side: THREE.DoubleSide,
  depthWrite: true,
});

const SIDEWALK_WIDTH = 1.2; // Width of sidewalk on each side of street
const STRIPE_LENGTH = 2; // Length of each white stripe
const STRIPE_GAP = 2; // Gap between stripes
const STRIPE_WIDTH = 0.15; // Width of stripe
const CORNER_RADIUS = 1.5; // Radius for rounded street corners

// Helper function to create a rounded rectangle shape
const createRoundedRectShape = (width: number, height: number, radius: number): THREE.Shape => {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const w = width;
  const h = height;
  const r = Math.min(radius, width / 2, height / 2); // Ensure radius doesn't exceed half dimensions
  
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  
  return shape;
};

const StreetGrid = () => {
  const horizontalStripeInstancesRef = useRef<THREE.InstancedMesh>(null);
  const verticalStripeInstancesRef = useRef<THREE.InstancedMesh>(null);

  const { streetElements, horizontalStripeCount, horizontalStripeMatrices, verticalStripeCount, verticalStripeMatrices } = useMemo(() => {
    const elements: JSX.Element[] = [];
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
    const startPos = -totalSize / 2;
    const groundBound = 80; // For grid size 6 (totalSize = ~137.5)

    // Horizontal streets with rounded corners
    for (let i = 0; i <= GRID_SIZE; i++) {
      const z = startPos + i * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH / 2;
      if (Math.abs(z) < groundBound) {
        const streetLength = Math.min(totalSize, groundBound * 2 - 2);

        // Street surface with rounded corners
        const roundedShape = createRoundedRectShape(streetLength, STREET_WIDTH, CORNER_RADIUS);
        const geometry = new THREE.ShapeGeometry(roundedShape);
        
        elements.push(
          <mesh
            key={`h-${i}`}
            position={[0, 0.05, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={streetMaterial}
            renderOrder={1}
            castShadow
            receiveShadow
          >
            <primitive object={geometry} attach="geometry" />
          </mesh>
        );
      }
    }

    // Vertical streets with rounded corners
    for (let i = 0; i <= GRID_SIZE; i++) {
      const x = startPos + i * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH / 2;
      if (Math.abs(x) < groundBound) {
        const streetLength = Math.min(totalSize, groundBound * 2 - 2);

        // Street surface with rounded corners
        const roundedShape = createRoundedRectShape(STREET_WIDTH, streetLength, CORNER_RADIUS);
        const geometry = new THREE.ShapeGeometry(roundedShape);
        
        elements.push(
          <mesh
            key={`v-${i}`}
            position={[x, 0.05, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={streetMaterial}
            renderOrder={1}
            castShadow
            receiveShadow
          >
            <primitive object={geometry} attach="geometry" />
          </mesh>
        );
      }
    }

    // Add sidewalks along the edges of building blocks (within the grid)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const blockStartX =
          startPos + col * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH;
        const blockEndX = blockStartX + BLOCK_SIZE;
        const blockStartZ =
          startPos + row * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH;
        const blockEndZ = blockStartZ + BLOCK_SIZE;
        const blockCenterX = (blockStartX + blockEndX) / 2;
        const blockCenterZ = (blockStartZ + blockEndZ) / 2;

        // Skip if block is outside bounds
        if (
          Math.abs(blockCenterX) >= groundBound ||
          Math.abs(blockCenterZ) >= groundBound
        ) {
          continue;
        }

        // North edge (top) - runs along X axis, positioned inside the block
        // Offset inward by half the sidewalk width to avoid overlapping with street
        const northSidewalkZ = blockStartZ + SIDEWALK_WIDTH / 2;
        elements.push(
          <mesh
            key={`sidewalk-n-${row}-${col}`}
            position={[blockCenterX, 0.06, northSidewalkZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={sidewalkMaterial}
            renderOrder={1}
            receiveShadow
          >
            <planeGeometry args={[BLOCK_SIZE, SIDEWALK_WIDTH]} />
          </mesh>
        );

        // South edge (bottom) - runs along X axis, positioned inside the block
        // Offset inward by half the sidewalk width to avoid overlapping with street
        const southSidewalkZ = blockEndZ - SIDEWALK_WIDTH / 2;
        elements.push(
          <mesh
            key={`sidewalk-s-${row}-${col}`}
            position={[blockCenterX, 0.06, southSidewalkZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={sidewalkMaterial}
            renderOrder={1}
            receiveShadow
          >
            <planeGeometry args={[BLOCK_SIZE, SIDEWALK_WIDTH]} />
          </mesh>
        );

        // West edge (left) - runs along Z axis, positioned inside the block
        // Offset inward by half the sidewalk width to avoid overlapping with street
        const westSidewalkX = blockStartX + SIDEWALK_WIDTH / 2;
        elements.push(
          <mesh
            key={`sidewalk-w-${row}-${col}`}
            position={[westSidewalkX, 0.06, blockCenterZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={sidewalkMaterial}
            renderOrder={1}
            receiveShadow
          >
            <planeGeometry args={[SIDEWALK_WIDTH, BLOCK_SIZE]} />
          </mesh>
        );

        // East edge (right) - runs along Z axis, positioned inside the block
        // Offset inward by half the sidewalk width to avoid overlapping with street
        const eastSidewalkX = blockEndX - SIDEWALK_WIDTH / 2;
        elements.push(
          <mesh
            key={`sidewalk-e-${row}-${col}`}
            position={[eastSidewalkX, 0.06, blockCenterZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            material={sidewalkMaterial}
            renderOrder={1}
            receiveShadow
          >
            <planeGeometry args={[SIDEWALK_WIDTH, BLOCK_SIZE]} />
          </mesh>
        );
      }
    }

    // Collect intersection points to avoid placing stripes there
    // Store as array of coordinates for overlap checking
    const intersectionPoints: Array<{ x: number; z: number }> = [];
    for (let i = 0; i <= GRID_SIZE; i++) {
      for (let j = 0; j <= GRID_SIZE; j++) {
        const x = startPos + i * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH / 2;
        const z = startPos + j * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH / 2;
        intersectionPoints.push({ x, z });
      }
    }

    // Helper function to check if a horizontal stripe overlaps with any intersection
    const horizontalStripeOverlapsIntersection = (stripeX: number, stripeZ: number): boolean => {
      const stripeHalfLength = STRIPE_LENGTH / 2;
      const stripeStartX = stripeX - stripeHalfLength;
      const stripeEndX = stripeX + stripeHalfLength;
      const tolerance = 0.5; // Small tolerance for floating point precision
      
      return intersectionPoints.some(intersection => {
        // Check if stripe's Z matches intersection Z and X range overlaps
        return Math.abs(intersection.z - stripeZ) < tolerance &&
               stripeStartX <= intersection.x + tolerance &&
               stripeEndX >= intersection.x - tolerance;
      });
    };

    // Helper function to check if a vertical stripe overlaps with any intersection
    const verticalStripeOverlapsIntersection = (stripeX: number, stripeZ: number): boolean => {
      const stripeHalfLength = STRIPE_LENGTH / 2;
      const stripeStartZ = stripeZ - stripeHalfLength;
      const stripeEndZ = stripeZ + stripeHalfLength;
      const tolerance = 0.5; // Small tolerance for floating point precision
      
      return intersectionPoints.some(intersection => {
        // Check if stripe's X matches intersection X and Z range overlaps
        return Math.abs(intersection.x - stripeX) < tolerance &&
               stripeStartZ <= intersection.z + tolerance &&
               stripeEndZ >= intersection.z - tolerance;
      });
    };

    // No longer using yellow markings - removed
    const matrices: THREE.Matrix4[] = [];

    // Collect white stripe positions for center lane markings (dashed lines)
    // Separate arrays for horizontal and vertical roads with different orientations
    const horizontalStripeMatrices: THREE.Matrix4[] = [];
    const verticalStripeMatrices: THREE.Matrix4[] = [];

    // Horizontal road center stripes (road runs along X axis, stripes run along X)
    for (let i = 0; i <= GRID_SIZE; i++) {
      const z = startPos + i * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH / 2;
      if (Math.abs(z) < groundBound) {
        const streetLength = Math.min(totalSize, groundBound * 2 - 2);
        const minX = -streetLength / 2;
        const maxX = streetLength / 2;
        
        // Create dashed line pattern along the center of the road
        let currentX = minX;
        while (currentX < maxX) {
          // Only add stripe if it's within bounds and doesn't overlap with an intersection
          if (Math.abs(currentX) < groundBound) {
            if (!horizontalStripeOverlapsIntersection(currentX, z)) {
              const matrix = new THREE.Matrix4();
              matrix.makeRotationX(-Math.PI / 2);
              matrix.setPosition(currentX, 0.055, z);
              horizontalStripeMatrices.push(matrix);
            }
          }
          currentX += STRIPE_LENGTH + STRIPE_GAP;
        }
      }
    }

    // Vertical road center stripes (road runs along Z axis, stripes run along Z)
    for (let i = 0; i <= GRID_SIZE; i++) {
      const x = startPos + i * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH / 2;
      if (Math.abs(x) < groundBound) {
        const streetLength = Math.min(totalSize, groundBound * 2 - 2);
        const minZ = -streetLength / 2;
        const maxZ = streetLength / 2;
        
        // Create dashed line pattern along the center of the road
        let currentZ = minZ;
        while (currentZ < maxZ) {
          // Only add stripe if it's within bounds and doesn't overlap with an intersection
          if (Math.abs(currentZ) < groundBound) {
            if (!verticalStripeOverlapsIntersection(x, currentZ)) {
              const matrix = new THREE.Matrix4();
              matrix.makeRotationX(-Math.PI / 2);
              matrix.setPosition(x, 0.055, currentZ);
              verticalStripeMatrices.push(matrix);
            }
          }
          currentZ += STRIPE_LENGTH + STRIPE_GAP;
        }
      }
    }

    return {
      streetElements: elements,
      horizontalStripeCount: horizontalStripeMatrices.length,
      horizontalStripeMatrices: horizontalStripeMatrices,
      verticalStripeCount: verticalStripeMatrices.length,
      verticalStripeMatrices: verticalStripeMatrices,
    };
  }, []);

  useFrame(() => {
    if (horizontalStripeInstancesRef.current) {
      horizontalStripeMatrices.forEach((matrix, index) => {
        horizontalStripeInstancesRef.current!.setMatrixAt(index, matrix);
      });
      horizontalStripeInstancesRef.current.instanceMatrix.needsUpdate = true;
    }
    if (verticalStripeInstancesRef.current) {
      verticalStripeMatrices.forEach((matrix, index) => {
        verticalStripeInstancesRef.current!.setMatrixAt(index, matrix);
      });
      verticalStripeInstancesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {streetElements}
      {/* Horizontal road stripes: road runs along X, stripes run along X (parallel to road) */}
      {horizontalStripeCount > 0 && (
        <instancedMesh
          ref={horizontalStripeInstancesRef}
          args={[undefined, undefined, horizontalStripeCount]}
          renderOrder={2}
        >
          <planeGeometry args={[STRIPE_LENGTH, STRIPE_WIDTH]} />
          <primitive object={whiteStripeMaterial} attach="material" />
        </instancedMesh>
      )}
      {/* Vertical road stripes: road runs along Z, stripes run along Z (parallel to road) */}
      {verticalStripeCount > 0 && (
        <instancedMesh
          ref={verticalStripeInstancesRef}
          args={[undefined, undefined, verticalStripeCount]}
          renderOrder={2}
        >
          <planeGeometry args={[STRIPE_WIDTH, STRIPE_LENGTH]} />
          <primitive object={whiteStripeMaterial} attach="material" />
        </instancedMesh>
      )}
    </group>
  );
};

export default StreetGrid;
