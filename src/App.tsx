import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useCallback, useEffect, Suspense, lazy } from "react";
import { ResumeProvider } from "@/context/ResumeContext";
import { CameraProvider, useCamera } from "@/context/CameraContext";
import { SceneSettingsProvider, useSceneSettings } from "@/context/SceneSettingsContext";

// Lazy load heavy components
const CityScene = lazy(() => import("@/components/CityScene"));
const ResumeUI = lazy(() => import("@/components/ResumeUI"));
const FPSCounter = lazy(() => import("@/components/FPSCounter"));
const SceneControls = lazy(() => import("@/components/SceneControls"));
const ZoomControls = lazy(() => import("@/components/ZoomControls"));

// Helper component to configure shadow camera and toggle shadows globally
const ShadowCameraHelper = () => {
  const { scene, gl } = useThree();
  const { shadowsEnabled } = useSceneSettings();
  const configuredRef = useRef(false);
  
  useEffect(() => {
    // Update shadow map enabled state - this is the main control
    gl.shadowMap.enabled = shadowsEnabled;
  }, [gl, shadowsEnabled]);
  
  useEffect(() => {
    const configureShadows = () => {
      // Configure shadow camera and toggle shadows for all objects
      scene.traverse((object) => {
        if (object instanceof THREE.DirectionalLight) {
          const light = object;
          
          // Store original castShadow state if not already stored
          if (light.userData.originalCastShadow === undefined) {
            light.userData.originalCastShadow = light.castShadow;
          }
          
          // Toggle shadow casting based on global setting
          if (light.userData.originalCastShadow) {
            light.castShadow = shadowsEnabled;
          }
          
          // Configure shadow camera (always configure, regardless of enabled state)
          light.shadow.camera.left = -150;
          light.shadow.camera.right = 150;
          light.shadow.camera.top = 150;
          light.shadow.camera.bottom = -150;
          light.shadow.camera.near = 0.5;
          light.shadow.camera.far = 400;
          light.shadow.camera.updateProjectionMatrix();
          
          // Ensure shadow map is properly sized
          light.shadow.mapSize.width = 4096;
          light.shadow.mapSize.height = 4096;
          
          light.shadow.needsUpdate = true;
        } else if (object instanceof THREE.Mesh) {
          // Store original shadow states if not already stored
          if (object.userData.originalCastShadow === undefined) {
            object.userData.originalCastShadow = object.castShadow;
            object.userData.originalReceiveShadow = object.receiveShadow;
          }
          
          // Toggle shadow properties based on global setting
          if (object.userData.originalCastShadow) {
            object.castShadow = shadowsEnabled;
          }
          if (object.userData.originalReceiveShadow) {
            object.receiveShadow = shadowsEnabled;
          }
        }
      });
      configuredRef.current = true;
    };
    
    // Try immediately
    configureShadows();
    
    // Also try after a short delay in case objects aren't mounted yet
    const timer = setTimeout(configureShadows, 200);
    
    return () => clearTimeout(timer);
  }, [scene, shadowsEnabled]);
  
  return null;
};

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
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const { setControlsRef } = useCamera();

  // Set controls ref when it's available
  const handleControlsRef = useCallback((node: any) => {
    controlsRef.current = node;
    if (node) {
      setControlsRef(controlsRef);
    }
  }, [setControlsRef]);

  // Configure shadow camera to look at city center
  useEffect(() => {
    // Use a small delay to ensure the light is mounted
    const timer = setTimeout(() => {
      if (directionalLightRef.current) {
        const light = directionalLightRef.current;
        // Configure shadow camera to cover the city area
        // City is approximately 115 units total (5x5 grid with blocks)
        // Center the shadow camera on the city
        light.shadow.camera.left = -150;
        light.shadow.camera.right = 150;
        light.shadow.camera.top = 150;
        light.shadow.camera.bottom = -150;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 400;
        light.shadow.camera.updateProjectionMatrix();
        
        // Make sure shadow map is enabled and properly sized
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        
        // Configure shadow properties
        light.shadow.bias = -0.0001;
        light.shadow.normalBias = 0.02;
        light.shadow.radius = 4;
        
        // Ensure shadow is enabled
        light.shadow.needsUpdate = true;
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

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
      
      {/* Shadow Camera Helper */}
      <ShadowCameraHelper />

      {/* Lighting Setup */}
      {/* Hemisphere Light - Simulates sky and ground lighting for more natural look */}
      <hemisphereLight
        args={["#B8D4E8", "#5A5A5A", 0.75]}
      />
      
      {/* Ambient Light - Increased to lighten shadows */}
      <ambientLight intensity={0.55} />
      
      {/* Main Directional Light (Sun) - Enhanced shadow quality */}
      <directionalLight
        ref={directionalLightRef}
        position={[100, 100, 50]}
        intensity={1.5}
        castShadow
      />
      
      {/* Fill Light - Softens shadows from the opposite side */}
      <directionalLight
        position={[-50, 30, -30]}
        intensity={0.85}
        color="#E6F2FF"
      />
      
      {/* Additional Fill Light - Further softens shadows */}
      <directionalLight
        position={[50, 20, 50]}
        intensity={0.5}
        color="#F0F8FF"
      />
      
      {/* Accent Point Light - Adds depth and highlights */}
      <pointLight 
        position={[-50, 50, -50]} 
        intensity={0.6}
        distance={150}
        decay={2}
        color="#FFF8E1"
      />

      {/* City Scene */}
      <CityScene />
    </>
  );
};

const UILoadingFallback = () => null;

const HomeContent = () => {
  const { zoomToPosition } = useCamera();

  return (
    <ResumeProvider zoomToPosition={zoomToPosition}>
      <div className="relative w-full h-screen bg-blue-200">
        <Canvas
          shadows
          gl={{ 
            antialias: false, 
            powerPreference: "high-performance"
          }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={null}>
            <SceneWithControls />
          </Suspense>
        </Canvas>

        {/* UI Overlay - Lazy loaded */}
        <Suspense fallback={<UILoadingFallback />}>
          <ResumeUI />
        </Suspense>
        <Suspense fallback={null}>
          <FPSCounter />
        </Suspense>
        <Suspense fallback={null}>
          <SceneControls />
        </Suspense>
        <Suspense fallback={null}>
          <ZoomControls />
        </Suspense>
      </div>
    </ResumeProvider>
  );
};

const App = () => {
  return (
    <CameraProvider>
      <SceneSettingsProvider>
        <HomeContent />
      </SceneSettingsProvider>
    </CameraProvider>
  );
};

export default App;

