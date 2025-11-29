"use client";

import React, { createContext, useContext, useRef, ReactNode } from "react";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface CameraContextType {
  zoomToPosition: (position: [number, number, number], distance?: number) => void;
  setControlsRef: (ref: React.RefObject<OrbitControls>) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

// Global animation state (outside React to avoid re-renders)
let animationState: {
  isAnimating: boolean;
  startPosition: THREE.Vector3;
  startTarget: THREE.Vector3;
  endPosition: THREE.Vector3;
  endTarget: THREE.Vector3;
  progress: number;
  duration: number;
  controls: OrbitControls | null;
} = {
  isAnimating: false,
  startPosition: new THREE.Vector3(),
  startTarget: new THREE.Vector3(),
  endPosition: new THREE.Vector3(),
  endTarget: new THREE.Vector3(),
  progress: 0,
  duration: 0,
  controls: null,
};

// Easing function (ease in-out cubic)
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Animation loop
let animationFrameId: number | null = null;
let lastTime: number = 0;
const animate = (currentTime: number) => {
  if (!animationState.isAnimating || !animationState.controls) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    lastTime = 0;
    return;
  }

  if (lastTime === 0) {
    lastTime = currentTime;
  }

  const delta = (currentTime - lastTime) / 1000; // Convert to seconds
  lastTime = currentTime;
  
  animationState.progress += delta / animationState.duration;

  if (animationState.progress >= 1) {
    animationState.progress = 1;
    animationState.isAnimating = false;
    lastTime = 0;
  }

  const easedProgress = easeInOutCubic(animationState.progress);

  // Interpolate camera position
  const currentPosition = new THREE.Vector3().lerpVectors(
    animationState.startPosition,
    animationState.endPosition,
    easedProgress
  );

  // Interpolate target position
  const currentTarget = new THREE.Vector3().lerpVectors(
    animationState.startTarget,
    animationState.endTarget,
    easedProgress
  );

  // Update camera and controls
  if (animationState.controls) {
    animationState.controls.object.position.copy(currentPosition);
    animationState.controls.target.copy(currentTarget);
    animationState.controls.update();
  }

  animationFrameId = requestAnimationFrame(animate);
};

export const CameraProvider = ({ children }: { children: ReactNode }) => {
  const controlsRef = useRef<React.RefObject<OrbitControls> | null>(null);

  const setControlsRef = (ref: React.RefObject<OrbitControls>) => {
    controlsRef.current = ref;
  };

  const zoomToPosition = (
    position: [number, number, number],
    distance: number = 90
  ) => {
    if (!controlsRef.current?.current) return;

    const controls = controlsRef.current.current;
    const [targetX, targetY, targetZ] = position;
    
    // Compensate for sidebar on the left - shift target to the left
    const sidebarOffset = -25;
    const adjustedTargetX = targetX + sidebarOffset;

    // Calculate camera position to look at the target
    // Position camera at an angle looking down at the building
    const angle = Math.PI / 4; // 45 degrees
    const cameraDistance = distance;
    const cameraHeight = targetY + cameraDistance * 0.35;

    // Calculate camera position in a circle around the target
    const cameraX = adjustedTargetX + cameraDistance * Math.cos(angle);
    const cameraZ = targetZ + cameraDistance * Math.sin(angle);

    // Get current camera and controls state
    const camera = controls.object;
    const currentTarget = controls.target.clone();
    const currentPosition = camera.position.clone();

    // Set up animation state
    animationState.startPosition.copy(currentPosition);
    animationState.startTarget.copy(currentTarget);
    animationState.endPosition.set(cameraX, cameraHeight, cameraZ);
    animationState.endTarget.set(adjustedTargetX, targetY + 5, targetZ); // Look slightly above ground
    animationState.progress = 0;
    animationState.duration = 1.5;
    animationState.controls = controls;
    animationState.isAnimating = true;

    // Start animation loop
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    lastTime = 0;
    animationFrameId = requestAnimationFrame(animate);
  };

  return (
    <CameraContext.Provider value={{ zoomToPosition, setControlsRef }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context;
};

