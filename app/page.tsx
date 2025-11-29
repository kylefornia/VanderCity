"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import React, { useMemo, useRef, useCallback } from "react";
import CityScene from "@/components/CityScene";
import ResumeUI from "@/components/ResumeUI";
import FPSCounter from "@/components/FPSCounter";
import { ResumeProvider } from "@/context/ResumeContext";
import { CameraProvider, useCamera } from "@/context/CameraContext";

const GradientSky = () => {
  const skyGeometry = useMemo(() => new THREE.SphereGeometry(500, 32, 15), []);
  
  const skyMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x6BA3D8) },
        bottomColor: { value: new THREE.Color(0xE6F2FF) },
        offset: { value: 0.3 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition).y;
          float factor = pow(max(h + offset, 0.0), exponent);
          gl_FragColor = vec4(mix(bottomColor, topColor, factor), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    return material;
  }, []);

  return (
    <mesh geometry={skyGeometry} material={skyMaterial} />
  );
};

const SceneWithControls = () => {
  const controlsRef = useRef<any>(null);
  const { setControlsRef } = useCamera();

  // Set controls ref when it's available
  const handleControlsRef = useCallback((node: any) => {
    controlsRef.current = node;
    if (node) {
      setControlsRef(controlsRef);
    }
  }, [setControlsRef]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[60, 40, 60]} fov={60} />
      <OrbitControls
        ref={handleControlsRef}
        minDistance={20}
        maxDistance={200}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        target={[-25, 0, 0]}
      />

      {/* Gradient Sky */}
      <GradientSky />

      {/* Lighting */}
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={2}
        castShadow
        shadowMapWidth={512}
        shadowMapHeight={512}
        shadowCameraFar={200}
        shadowCameraLeft={-100}
        shadowCameraRight={100}
        shadowCameraTop={100}
        shadowCameraBottom={-100}
      />
      <pointLight position={[-50, 50, -50]} intensity={1} />

      {/* City Scene */}
      <CityScene />
    </>
  );
};

const HomeContent = () => {
  const { zoomToPosition } = useCamera();

  return (
    <ResumeProvider zoomToPosition={zoomToPosition}>
      <div className="relative w-full h-screen bg-blue-200">
        <Canvas
          shadows
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <SceneWithControls />
        </Canvas>

        {/* UI Overlay */}
        <ResumeUI />
        <FPSCounter />
      </div>
    </ResumeProvider>
  );
};

export default function Home() {
  return (
    <CameraProvider>
      <HomeContent />
    </CameraProvider>
  );
}
