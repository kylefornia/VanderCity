import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, lazy, Suspense } from "react";
import ProgressiveRenderer from "./ProgressiveRenderer";

// Lazy load city components for better code splitting
const Buildings = lazy(() => import("./city/Buildings"));
const Cars = lazy(() => import("./city/Cars"));
const CityDetails = lazy(() => import("./city/CityDetails"));
const Parks = lazy(() => import("./city/Parks"));
const People = lazy(() => import("./city/People"));
const StreetGrid = lazy(() => import("./city/StreetGrid"));
const Trees = lazy(() => import("./city/Trees"));
const Birds = lazy(() => import("./city/Birds"));
const Clouds = lazy(() => import("./city/Clouds"));

const CityScene = () => {
  const cityRef = useRef<THREE.Group>(null);
  const islandRef = useRef<THREE.Group>(null);

  // Create base rock geometries once for reuse
  const rockGeometries = useMemo(() => ({
    dodecahedron: new THREE.DodecahedronGeometry(1, 0),
    octahedron: new THREE.OctahedronGeometry(1, 0),
    icosahedron: new THREE.IcosahedronGeometry(1, 0),
  }), []);

  // Create realistic floating island geometry with organic shape
  const islandTopGeometry = useMemo(() => {
    const segments = 64;
    const radius = 85;
    const geometry = new THREE.CylinderGeometry(radius, radius, 0.3, segments);
    
    // Get position attribute to modify vertices
    const positions = geometry.attributes.position;
    const vertices = positions.array;
    
    // Add organic variation to top surface
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      // Only modify top surface (y > 0)
      if (y > 0.1) {
        const distance = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);
        
        // Create organic noise-like variation
        const noise1 = Math.sin(angle * 3) * Math.cos(distance * 0.1) * 0.3;
        const noise2 = Math.sin(angle * 5) * Math.cos(distance * 0.15) * 0.2;
        const noise3 = Math.sin(angle * 7) * Math.sin(distance * 0.08) * 0.15;
        
        // Edge erosion - make edges more irregular
        const edgeFactor = Math.max(0, (distance - radius * 0.7) / (radius * 0.3));
        const edgeVariation = Math.sin(angle * 8) * edgeFactor * 1.5;
        
        // Apply variations
        const variation = noise1 + noise2 + noise3 + edgeVariation;
        vertices[i] = x + Math.cos(angle) * variation;
        vertices[i + 2] = z + Math.sin(angle) * variation;
        vertices[i + 1] = y + Math.sin(distance * 0.1) * 0.1; // Slight height variation
      }
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  const islandBottomGeometry = useMemo(() => {
    const segments = 64;
    const topRadius = 85;
    const bottomRadius = 70; // More variation
    const height = 25; // Slightly taller for more dramatic effect
    const geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, segments, 1, true);
    
    // Get position attribute to modify vertices
    const positions = geometry.attributes.position;
    const vertices = positions.array;
    
    // Add organic variation to bottom surface
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      const z = vertices[i + 2];
      
      const distance = Math.sqrt(x * x + z * z);
      const angle = Math.atan2(z, x);
      const normalizedY = (y + height / 2) / height; // 0 at bottom, 1 at top
      
      // Create organic noise-like variation
      const noise1 = Math.sin(angle * 4) * Math.cos(distance * 0.12) * 2;
      const noise2 = Math.sin(angle * 6) * Math.cos(distance * 0.18) * 1.5;
      const noise3 = Math.sin(angle * 8) * Math.sin(distance * 0.1) * 1;
      
      // More variation at top (overhangs), less at bottom
      const variationFactor = normalizedY * normalizedY; // Quadratic for more top variation
      const variation = (noise1 + noise2 + noise3) * variationFactor;
      
      // Create overhangs and erosion
      const overhangFactor = Math.sin(angle * 7) * Math.cos(normalizedY * Math.PI) * variationFactor * 3;
      
      // Apply variations
      vertices[i] = x + Math.cos(angle) * (variation + overhangFactor);
      vertices[i + 2] = z + Math.sin(angle) * (variation + overhangFactor);
      
      // Add some vertical variation for rock formations
      const rockFormation = Math.sin(angle * 5) * Math.cos(distance * 0.15) * normalizedY * 1.5;
      vertices[i + 1] = y + rockFormation;
    }
    
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
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
        {/* Island Top - Grass Surface (organic shape) - positioned below roads */}
        <mesh
          rotation={[0, 0, 0]}
          position={[0, -0.5, 0]}
          renderOrder={-10}
          receiveShadow
          castShadow
        >
          <primitive object={islandTopGeometry} attach="geometry" />
          <meshStandardMaterial
            color="#7CB342"
            roughness={1.0}
            metalness={0.0}
            flatShading={false}
            depthWrite={true}
            depthTest={true}
          />
        </mesh>

        {/* Island Bottom - Rock/Earth Base (organic shape with overhangs) */}
        <mesh
          rotation={[0, 0, 0]}
          position={[0, -12.8, 0]}
          renderOrder={-11}
          castShadow
          receiveShadow
        >
          <primitive object={islandBottomGeometry} attach="geometry" />
          <meshStandardMaterial
            color="#5D4037"
            roughness={0.95}
            metalness={0.05}
            flatShading={false}
          />
        </mesh>

        {/* Edge rock formations for more realism */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const baseRadius = 85;
          const variation = Math.sin(angle * 3) * 2 + Math.cos(angle * 5) * 1.5;
          const radius = baseRadius + variation;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          // Create smaller clusters of rocks with random variations
          const rocksInCluster = 1 + (i % 2); // 1 or 2 rocks per cluster
          
          return (
            <group key={`rock-cluster-${i}`}>
              {Array.from({ length: rocksInCluster }).map((_, j) => {
                // Random offset within cluster
                const offsetAngle = angle + (j - rocksInCluster / 2) * 0.15;
                const offsetRadius = 0.5 + j * 0.3;
                const offsetX = Math.cos(offsetAngle) * offsetRadius;
                const offsetZ = Math.sin(offsetAngle) * offsetRadius;
                
                // Vary rock sizes and shapes
                const sizeVariation = 0.7 + (i + j) % 4 * 0.3;
                const rockScaleX = sizeVariation * (0.8 + Math.sin(i * 7) * 0.2);
                const rockScaleY = sizeVariation * (1.2 + Math.cos(i * 5) * 0.3);
                const rockScaleZ = sizeVariation * (0.9 + Math.sin(i * 3) * 0.2);
                
                // Random rotations for natural look
                const rotX = (i * 0.3 + j * 0.5) % (Math.PI * 2);
                const rotY = (i * 0.7 + j * 0.4) % (Math.PI * 2);
                const rotZ = (i * 0.5 + j * 0.6) % (Math.PI * 2);
                
                // Vary rock height
                const rockHeight = -1.5 - (i % 3) * 0.3 - j * 0.2;
                
                // Use different geometries for more organic rock shape
                const rockType = (i + j) % 3;
                const baseGeometry = rockType === 0 
                  ? rockGeometries.dodecahedron 
                  : rockType === 1 
                  ? rockGeometries.octahedron 
                  : rockGeometries.icosahedron;
                
                // Clone geometry for each rock instance
                const geometry = baseGeometry.clone();
                
                // Vary rock colors for realism
                const colorVariation = 0.1 * Math.sin(i * 2.3);
                const baseColor = new THREE.Color("#4E342E");
                baseColor.r += colorVariation * 0.1;
                baseColor.g += colorVariation * 0.05;
                baseColor.b += colorVariation * 0.05;
                
                return (
                  <mesh
                    key={`rock-${i}-${j}`}
                    position={[x + offsetX, rockHeight, z + offsetZ]}
                    rotation={[rotX, rotY, rotZ]}
                    scale={[rockScaleX, rockScaleY, rockScaleZ]}
                    castShadow
                    receiveShadow
                  >
                    <primitive object={geometry} attach="geometry" />
                    <meshStandardMaterial
                      color={baseColor}
                      roughness={0.95}
                      metalness={0.05}
                      flatShading={false}
                    />
                  </mesh>
                );
              })}
            </group>
          );
        })}

        {/* City Components on Island - Progressively Rendered */}
        <group position={[0, 0, 0]}>
          {/* Priority 0: Critical - Render immediately (core structure) */}
          <ProgressiveRenderer priority={0}>
            <Suspense fallback={null}>
              <StreetGrid />
            </Suspense>
          </ProgressiveRenderer>
          <ProgressiveRenderer priority={0}>
            <Suspense fallback={null}>
              <Buildings />
            </Suspense>
          </ProgressiveRenderer>

          {/* Priority 1: High - Render after 100ms (environment) */}
          <ProgressiveRenderer priority={1} delay={100}>
            <Suspense fallback={null}>
              <Trees />
            </Suspense>
          </ProgressiveRenderer>
          <ProgressiveRenderer priority={1} delay={150}>
            <Suspense fallback={null}>
              <Parks />
            </Suspense>
          </ProgressiveRenderer>
          <ProgressiveRenderer priority={1} delay={200}>
            <Suspense fallback={null}>
              <CityDetails />
            </Suspense>
          </ProgressiveRenderer>

          {/* Priority 2: Medium - Render after 300ms (animated elements) */}
          <ProgressiveRenderer priority={2} delay={300}>
            <Suspense fallback={null}>
              <People />
            </Suspense>
          </ProgressiveRenderer>
          <ProgressiveRenderer priority={2} delay={350}>
            <Suspense fallback={null}>
              <Cars />
            </Suspense>
          </ProgressiveRenderer>

          {/* Priority 3: Low - Render after 500ms (ambient elements) */}
          <ProgressiveRenderer priority={3} delay={500}>
            <Suspense fallback={null}>
              <Birds />
            </Suspense>
          </ProgressiveRenderer>
        </group>
      </group>

      {/* Clouds Above Island - Priority 3: Low */}
      <ProgressiveRenderer priority={3} delay={550}>
        <Suspense fallback={null}>
          <Clouds />
        </Suspense>
      </ProgressiveRenderer>
    </group>
  );
};

export default CityScene;
