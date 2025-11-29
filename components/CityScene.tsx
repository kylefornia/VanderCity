"use client";

import * as THREE from "three";

import Buildings from "./city/Buildings";
import Cars from "./city/Cars";
import CityDetails from "./city/CityDetails";
import Parks from "./city/Parks";
import People from "./city/People";
import StreetGrid from "./city/StreetGrid";
import Trees from "./city/Trees";
import Birds from "./city/Birds";
import Clouds from "./city/Clouds";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import ProgressiveRenderer from "./ProgressiveRenderer";

const CityScene = () => {
  const cityRef = useRef<THREE.Group>(null);
  const islandRef = useRef<THREE.Group>(null);

  // Create island shape geometry - circular top (cone shape)
  const islandTopGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(85, 85, 0.2, 64);
    return geometry;
  }, []);

  const islandBottomGeometry = useMemo(() => {
    // Cone shape: wider at top (85) tapering gently inward to narrower at bottom (75)
    const geometry = new THREE.CylinderGeometry(85, 75, 20, 64);
    return geometry;
  }, []);

  // Floating animation
  useFrame((state) => {
    if (islandRef.current) {
      // Subtle floating motion - base position at 0, float around it
      islandRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      islandRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={cityRef}>
      {/* Floating Island Group */}
      <group ref={islandRef}>
        {/* Island Top - Grass Surface (circular) - positioned below roads */}
        <mesh
          rotation={[0, 0, 0]}
          position={[0, -0.15, 0]}
          renderOrder={-10}
          receiveShadow
        >
          <primitive object={islandTopGeometry} attach="geometry" />
          <meshStandardMaterial
            color="#7CB342"
            roughness={1.0}
            metalness={0.0}
            flatShading={true}
            depthWrite={true}
            depthTest={true}
          />
        </mesh>

        {/* Island Bottom - Rock/Earth Base (cone shape, only visible from below) */}
        <mesh
          rotation={[0, 0, 0]}
          position={[0, -10.1, 0]}
          renderOrder={-11}
          castShadow
        >
          <primitive object={islandBottomGeometry} attach="geometry" />
          <meshStandardMaterial
            color="#5D4037"
            roughness={0.9}
            metalness={0.1}
            flatShading={true}
          />
        </mesh>

        {/* City Components on Island - Progressively Rendered */}
        <group position={[0, 0, 0]}>
          {/* Priority 0: Critical - Render immediately (core structure) */}
          <ProgressiveRenderer priority={0}>
            <StreetGrid />
          </ProgressiveRenderer>
          <ProgressiveRenderer priority={0}>
            <Buildings />
          </ProgressiveRenderer>

          {/* Priority 1: High - Render after 100ms (environment) */}
          <ProgressiveRenderer priority={1} delay={100}>
            <Trees />
          </ProgressiveRenderer>
          <ProgressiveRenderer priority={1} delay={150}>
            <Parks />
          </ProgressiveRenderer>
          <ProgressiveRenderer priority={1} delay={200}>
            <CityDetails />
          </ProgressiveRenderer>

          {/* Priority 2: Medium - Render after 300ms (animated elements) */}
          <ProgressiveRenderer priority={2} delay={300}>
            <People />
          </ProgressiveRenderer>
          <ProgressiveRenderer priority={2} delay={350}>
            <Cars />
          </ProgressiveRenderer>

          {/* Priority 3: Low - Render after 500ms (ambient elements) */}
          <ProgressiveRenderer priority={3} delay={500}>
            <Birds />
          </ProgressiveRenderer>
        </group>
      </group>

      {/* Clouds Above Island - Priority 3: Low */}
      <ProgressiveRenderer priority={3} delay={550}>
        <Clouds />
      </ProgressiveRenderer>
    </group>
  );
};

export default CityScene;
