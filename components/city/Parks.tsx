import { useMemo, useRef, memo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF, Html } from "@react-three/drei";
import { FaBasketballBall } from "react-icons/fa";
import { FiX } from "react-icons/fi";

import { STREET_WIDTH, BLOCK_SIZE, GRID_SIZE } from "./cityConstants";
import { useResume } from "@/context/ResumeContext";
import { useIsMobile } from "@/hooks/useIsMobile";

// Preload the basketball court model
useGLTF.preload("/models/Basketball court.glb");

interface ParkProps {
  position: [number, number, number];
  size: number;
  isCenter?: boolean;
}

const BasketballCourt = ({ position }: { position: [number, number, number] }) => {
  const { scene } = useGLTF("/models/Basketball court.glb");
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    // Center the model if needed and scale appropriately
    const box = new THREE.Box3();
    box.setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Move to origin, then scale to fit within the park size
    cloned.position.set(-center.x, -box.min.y, -center.z);
    
    // Scale to fit within the block size (approximately)
    const maxDimension = Math.max(size.x, size.z);
    const targetSize = BLOCK_SIZE - 2; // Moderate margin
    const scale = targetSize / maxDimension;
    cloned.scale.set(scale, scale, scale);
    
    // Disable raycasting on court model so hitbox receives events
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.raycast = () => {};
      }
    });
    
    return cloned;
  }, [scene]);

  return (
    <group position={position}>
      <primitive object={clonedScene} castShadow receiveShadow />
    </group>
  );
};

interface BasketballPlayerProps {
  position: [number, number, number];
  speed: number;
  path: THREE.Vector3[];
  pathIndex: number;
  bodyColor?: string;
  skinColor?: string;
  positionRef?: React.MutableRefObject<THREE.Vector3>;
}

const BasketballPlayer = memo(({
  speed,
  path,
  pathIndex,
  bodyColor = "#2c5282",
  skinColor = "#fdbcb4",
  positionRef,
}: BasketballPlayerProps) => {
  const playerRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const currentPathIndex = useRef(pathIndex);
  const progress = useRef(0);

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true,
      }),
    [bodyColor]
  );

  const skinMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: skinColor,
        roughness: 0.8,
        metalness: 0.0,
        flatShading: true,
      }),
    [skinColor]
  );

  useFrame((state, delta) => {
    if (!playerRef.current || path.length === 0) return;

    const time = state.clock.elapsedTime;
    const groundOffset = 0;

    // Update position along path
    const currentPoint = path[currentPathIndex.current];
    const nextIndex = (currentPathIndex.current + 1) % path.length;
    const nextPoint = path[nextIndex];

    progress.current += speed * delta;

    if (progress.current >= 1) {
      progress.current = 0;
      currentPathIndex.current = nextIndex;
    }

    // Calculate position along path
    const currentPos = new THREE.Vector3().lerpVectors(
      currentPoint,
      nextPoint,
      progress.current
    );

    playerRef.current.position.set(currentPos.x, groundOffset, currentPos.z);

    // Update position ref if provided (for ball tracking)
    if (positionRef) {
      positionRef.current.set(currentPos.x, groundOffset, currentPos.z);
    }

    // Rotate to face direction of movement
    const direction = new THREE.Vector3()
      .subVectors(nextPoint, currentPoint)
      .normalize();
    if (direction.length() > 0.001) {
      const angle = Math.atan2(direction.x, direction.z);
      playerRef.current.rotation.y = angle;
    }

    // Running animation
    const runSpeed = time * 6;
    const bounce = Math.abs(Math.sin(runSpeed)) * 0.08;
    playerRef.current.position.y = groundOffset + bounce;

    // Arms swinging
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = Math.sin(runSpeed) * 0.8;
      rightArmRef.current.rotation.z = Math.sin(runSpeed) * 0.2;
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x = -Math.sin(runSpeed) * 0.8;
      leftArmRef.current.rotation.z = -Math.sin(runSpeed) * 0.2;
    }

    // Legs running
    if (leftLegRef.current) {
      leftLegRef.current.rotation.x = Math.sin(runSpeed) * 0.6;
    }
    if (rightLegRef.current) {
      rightLegRef.current.rotation.x = -Math.sin(runSpeed) * 0.6;
    }
  });

  // Disable raycasting on all player meshes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.raycast = () => {};
        }
      });
    }
  }, []);

  return (
    <group ref={playerRef}>
      {/* Head */}
      <mesh position={[0, 1.4, 0]} material={skinMaterial} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
      </mesh>

      {/* Body/Torso */}
      <mesh position={[0, 0.9, 0]} material={bodyMaterial} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.25]} />
      </mesh>

      {/* Left Arm */}
      <mesh
        ref={leftArmRef}
        position={[-0.35, 0.9, 0]}
        material={skinMaterial}
        castShadow
      >
        <boxGeometry args={[0.15, 0.5, 0.15]} />
      </mesh>

      {/* Right Arm */}
      <mesh
        ref={rightArmRef}
        position={[0.35, 0.9, 0]}
        material={skinMaterial}
        castShadow
      >
        <boxGeometry args={[0.15, 0.5, 0.15]} />
      </mesh>

      {/* Left Leg */}
      <mesh
        ref={leftLegRef}
        position={[-0.15, 0.35, 0]}
        material={bodyMaterial}
        castShadow
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
      </mesh>

      {/* Right Leg */}
      <mesh
        ref={rightLegRef}
        position={[0.15, 0.35, 0]}
        material={bodyMaterial}
        castShadow
      >
        <boxGeometry args={[0.2, 0.6, 0.2]} />
      </mesh>
    </group>
  );
});

BasketballPlayer.displayName = "BasketballPlayer";

const Basketball = ({ playerPositionRef }: { playerPositionRef: React.MutableRefObject<THREE.Vector3> }) => {
  const ballRef = useRef<THREE.Mesh>(null);

  const ballMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ff6600",
        roughness: 0.6,
        metalness: 0.2,
        flatShading: true,
      }),
    []
  );

  useFrame((state) => {
    if (!ballRef.current) return;

    const time = state.clock.elapsedTime;
    const playerPos = playerPositionRef.current;
    
    // Position ball near the player (slightly to the right and in front)
    const offsetX = Math.cos(time * 2) * 0.3;
    const offsetZ = Math.sin(time * 2) * 0.3;
    
    // Ball bounces while being dribbled
    const ballBounce = Math.abs(Math.sin(time * 4)) * 0.25;
    ballRef.current.position.set(
      playerPos.x + offsetX,
      0.3 + ballBounce,
      playerPos.z + offsetZ
    );
    
    // Rotate ball
    ballRef.current.rotation.x += 0.1;
    ballRef.current.rotation.z += 0.1;
  });

  // Disable raycasting on ball
  useEffect(() => {
    if (ballRef.current) {
      ballRef.current.raycast = () => {};
    }
  }, []);

  return (
    <mesh ref={ballRef} material={ballMaterial} castShadow>
      <sphereGeometry args={[0.12, 12, 12]} />
    </mesh>
  );
};

const BasketballPlayers = () => {
  const ballCarrierRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const courtSize = BLOCK_SIZE - 2; // Court size
  const courtHalf = courtSize / 2;

  // Generate back-and-forth paths across the court for players
  const players = useMemo(() => {
    const numPlayers = 6;
    const playerPaths: Array<{
      path: THREE.Vector3[];
      speed: number;
      bodyColor: string;
      skinColor: string;
    }> = [];

    const clothingColors = [
      "#2c5282", "#742a2a", "#2d3748", "#553c9a", "#744210", "#2c7a7b"
    ];
    const skinColors = [
      "#fdbcb4", "#f4a460", "#d2691e", "#fdbcb4", "#cd853f", "#f4a460"
    ];

    const pathTypes = [
      "horizontal", // Left to right
      "horizontal", // Right to left
      "vertical",   // Front to back
      "vertical",   // Back to front
      "diagonal1",  // Diagonal
      "diagonal2",  // Diagonal opposite
    ];

    for (let i = 0; i < numPlayers; i++) {
      const path: THREE.Vector3[] = [];
      const pathType = pathTypes[i];
      const stepSize = 0.5;
      
      switch (pathType) {
        case "horizontal": {
          // Run left to right and back
          const z = (i % 2 === 0 ? -1 : 1) * courtHalf * 0.5;
          const startX = -courtHalf * 0.7;
          const endX = courtHalf * 0.7;
          
          // Forward path
          for (let x = startX; x <= endX; x += stepSize) {
            path.push(new THREE.Vector3(x, 0, z));
          }
          // Backward path
          for (let x = endX; x >= startX; x -= stepSize) {
            path.push(new THREE.Vector3(x, 0, z));
          }
          break;
        }
        
        case "vertical": {
          // Run front to back and back
          const x = (i % 2 === 0 ? -1 : 1) * courtHalf * 0.5;
          const startZ = -courtHalf * 0.6;
          const endZ = courtHalf * 0.6;
          
          // Forward path
          for (let z = startZ; z <= endZ; z += stepSize) {
            path.push(new THREE.Vector3(x, 0, z));
          }
          // Backward path
          for (let z = endZ; z >= startZ; z -= stepSize) {
            path.push(new THREE.Vector3(x, 0, z));
          }
          break;
        }
        
        case "diagonal1": {
          // Diagonal from top-left to bottom-right
          const startX = -courtHalf * 0.6;
          const endX = courtHalf * 0.6;
          const startZ = -courtHalf * 0.5;
          const endZ = courtHalf * 0.5;
          const numSteps = Math.floor((endX - startX) / stepSize);
          
          for (let j = 0; j <= numSteps; j++) {
            const t = j / numSteps;
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t;
            path.push(new THREE.Vector3(x, 0, z));
          }
          // Back
          for (let j = numSteps; j >= 0; j--) {
            const t = j / numSteps;
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t;
            path.push(new THREE.Vector3(x, 0, z));
          }
          break;
        }
        
        case "diagonal2": {
          // Diagonal from top-right to bottom-left
          const startX = courtHalf * 0.6;
          const endX = -courtHalf * 0.6;
          const startZ = -courtHalf * 0.5;
          const endZ = courtHalf * 0.5;
          const numSteps = Math.floor(Math.abs(endX - startX) / stepSize);
          
          for (let j = 0; j <= numSteps; j++) {
            const t = j / numSteps;
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t;
            path.push(new THREE.Vector3(x, 0, z));
          }
          // Back
          for (let j = numSteps; j >= 0; j--) {
            const t = j / numSteps;
            const x = startX + (endX - startX) * t;
            const z = startZ + (endZ - startZ) * t;
            path.push(new THREE.Vector3(x, 0, z));
          }
          break;
        }
      }

      playerPaths.push({
        path,
        speed: 0.4 + (i % 3) * 0.15, // Vary speeds
        bodyColor: clothingColors[i],
        skinColor: skinColors[i],
      });
    }

    return playerPaths;
  }, [courtHalf]);

  return (
    <group>
      {players.map((playerData, i) => (
        <BasketballPlayer
          key={`basketball-player-${i}`}
          position={playerData.path[0] ? [playerData.path[0].x, playerData.path[0].y, playerData.path[0].z] : [0, 0, 0]}
          speed={playerData.speed}
          path={playerData.path}
          pathIndex={0}
          bodyColor={playerData.bodyColor}
          skinColor={playerData.skinColor}
          positionRef={i === 0 ? ballCarrierRef : undefined}
        />
      ))}
      {/* Single basketball - follows first player */}
      <Basketball playerPositionRef={ballCarrierRef} />
    </group>
  );
};

const Fountain = ({ position }: { position: [number, number, number] }) => {
  const waterRef = useRef<THREE.Mesh>(null);
  const sprayRefs = useRef<THREE.Mesh[]>([]);
  const centralJetRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Animate water surface with ripples
    if (waterRef.current) {
      waterRef.current.rotation.z = time * 0.1;
      const ripple = Math.sin(time * 2) * 0.02;
      waterRef.current.position.y = 0.3 + ripple;
    }

    // Animate water sprays with more dynamic movement
    sprayRefs.current.forEach((spray, i) => {
      if (spray) {
        const offset = i * 0.5;
        const wave = Math.sin(time * 2.5 + offset) * 0.15;
        spray.position.y = 0.8 + wave;
        spray.scale.y = 0.7 + Math.sin(time * 2 + offset) * 0.3;
        spray.rotation.z = Math.sin(time * 1.5 + offset) * 0.1;
      }
    });

    // Animate central jet
    if (centralJetRef.current) {
      const jetHeight = 0.5 + Math.sin(time * 3) * 0.1;
      centralJetRef.current.scale.y = jetHeight;
      centralJetRef.current.position.y = 1.35 + (jetHeight - 0.5) * 0.25;
    }
  });

  return (
    <group position={position}>
      {/* Fountain base */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 0.6, 16]} />
        <meshStandardMaterial
          color="#c0c0c0"
          roughness={0.2}
          metalness={0.8}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Fountain middle tier */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.2, 0.4, 16]} />
        <meshStandardMaterial
          color="#d0d0d0"
          roughness={0.2}
          metalness={0.8}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Fountain top */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.3, 16]} />
        <meshStandardMaterial
          color="#e0e0e0"
          roughness={0.1}
          metalness={0.9}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Water pool */}
      <mesh
        ref={waterRef}
        position={[0, 0.3, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial
          color="#4a90e2"
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.7}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Water sprays */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 0.9;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={`spray-${i}`}
            ref={(el) => {
              if (el) sprayRefs.current[i] = el;
            }}
            position={[x, 0.8, z]}
            rotation={[Math.PI / 2, 0, angle]}
          >
            <cylinderGeometry args={[0.05, 0.08, 0.6, 8]} />
            <meshStandardMaterial
              color="#87ceeb"
              roughness={0.1}
              metalness={0.5}
              transparent
              opacity={0.8}
              emissive="#87ceeb"
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}

      {/* Central water jet */}
      <mesh ref={centralJetRef} position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.5, 8]} />
        <meshStandardMaterial
          color="#87ceeb"
          roughness={0.1}
          metalness={0.5}
          transparent
          opacity={0.9}
          emissive="#87ceeb"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
};

const Statue = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Statue base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 1.0, 0.8, 16]} />
        <meshStandardMaterial color="#8b8b8b" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Statue pedestal */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 1.2, 16]} />
        <meshStandardMaterial color="#a0a0a0" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Statue figure - simplified abstract */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <boxGeometry args={[0.3, 1.0, 0.3]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Statue head */}
      <mesh position={[0, 2.7, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
};

const Gazebo = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Gazebo floor */}
      <mesh
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[2.5, 16]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Gazebo columns */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 2.2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh key={`column-${i}`} position={[x, 1.5, z]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 3, 12]} />
            <meshStandardMaterial
              color="#5d4037"
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      {/* Gazebo roof */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[2.8, 1.0, 8]} />
        <meshStandardMaterial color="#6b5d4f" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Gazebo roof trim */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <torusGeometry args={[2.5, 0.08, 8, 32]} />
        <meshStandardMaterial color="#4a3428" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
};

const Park = ({ position, size, isCenter = false }: ParkProps) => {
  const { setSelectedBuilding, resume, selectedBuilding, isLeftPanelVisible } = useResume();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [tooltipOffset, setTooltipOffset] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hitboxRef = useRef<THREE.Mesh>(null);

  // Find basketball interest
  const basketballInterest = useMemo(
    () => resume.interests.find((int) => int.name.toLowerCase() === "basketball"),
    [resume]
  );

  const isSelected = useMemo(
    () =>
      selectedBuilding?.category === "interest" &&
      selectedBuilding?.id === basketballInterest?.id,
    [selectedBuilding, basketballInterest]
  );

  const handleClick = () => {
    if (basketballInterest) {
      setSelectedBuilding({ id: basketballInterest.id, category: "interest" });
    }
  };

  // Show tooltip when selected from sidebar
  useEffect(() => {
    if (isSelected) {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      setIsHovered(true);
      setIsFadingOut(false);
    } else {
      setIsHovered(false);
      setIsFadingOut(false);
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    }
  }, [isSelected]);

  const handleHover = (hovered: boolean) => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    if (hovered) {
      setIsFadingOut(false);
      showTimeoutRef.current = setTimeout(() => {
        setIsHovered(true);
        showTimeoutRef.current = null;
      }, 150);
    } else {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
        return;
      }
      setIsFadingOut(true);
      fadeTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
        setIsFadingOut(false);
        fadeTimeoutRef.current = null;
      }, 200);
    }
  };

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    };
  }, []);

  // If this is the center park, render basketball court with interactions
  if (isCenter) {
    return (
      <group position={position}>
        {/* Grass base with better texture */}
        <mesh
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[size, size, 8, 8]} />
          <meshStandardMaterial
            color="#2d5016"
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>

        {/* Transparent hitbox for interaction */}
        <mesh
          ref={hitboxRef}
          position={[0, 1, 0]}
          userData={{ buildingId: basketballInterest?.id, category: "interest" }}
          renderOrder={1000}
          onPointerEnter={(e) => {
            e.stopPropagation();
            handleHover(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            handleHover(true);
            if (e.intersections && e.intersections.length > 0) {
              const intersection = e.intersections[0];
              const localPoint = intersection.point.clone();
              const meshWorldPos = new THREE.Vector3();
              e.object.getWorldPosition(meshWorldPos);
              localPoint.sub(meshWorldPos);
              const offsetX = Math.max(-2, Math.min(2, localPoint.x * 0.2));
              const offsetY = Math.max(-1, Math.min(1, (localPoint.y - 1) * 0.15));
              const offsetZ = Math.max(-2, Math.min(2, localPoint.z * 0.2));
              setTooltipOffset([offsetX, offsetY, offsetZ]);
            }
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            handleHover(false);
            document.body.style.cursor = "default";
            setTooltipOffset([0, 0, 0]);
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <boxGeometry args={[size, 2, size]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            visible={true}
          />
        </mesh>

        {/* Basketball court at center */}
        <BasketballCourt position={[0, 0, 0]} />
        
        {/* Basketball players */}
        <BasketballPlayers />

        {/* Tooltip */}
        {(isHovered || isSelected) && basketballInterest && !(isMobile && isLeftPanelVisible) && (
          <Html
            position={[
              tooltipOffset[0],
              3 + tooltipOffset[1],
              tooltipOffset[2],
            ]}
            center
            style={{ pointerEvents: "auto" }}
            occlude={false}
          >
            <div
              className={`bg-white text-gray-900 px-5 py-4 rounded-xl shadow-xl border border-gray-200 min-w-[320px] max-w-[380px] relative ${
                isFadingOut ? "animate-fade-out" : "animate-bounce-in-up"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsHovered(false);
                  if (isSelected) {
                    setSelectedBuilding(null);
                  }
                }}
                className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-gray-100/80"
                aria-label="Close tooltip"
              >
                <FiX className="w-4 h-4" />
              </button>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-1.5 rounded-lg bg-gray-50 border border-gray-200/50">
                      <FaBasketballBall className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 leading-tight">
                      {basketballInterest.name}
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-0.5 rounded-md inline-block mt-1.5 ml-11 bg-red-50 text-red-700 border border-red-100">
                    Sports
                  </div>
                </div>
                {basketballInterest.description && (
                  <div className="text-xs text-gray-600 leading-relaxed pt-1.5 border-t border-gray-100">
                    {basketballInterest.description}
                  </div>
                )}
              </div>
            </div>
          </Html>
        )}
      </group>
    );
  }

  return (
    <group position={position}>
      {/* Grass base with better texture */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, size, 8, 8]} />
        <meshStandardMaterial
          color="#2d5016"
          roughness={0.95}
          metalness={0.0}
        />
      </mesh>

      {/* Decorative grass patches for variety */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const radius = size * 0.25;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <mesh
            key={`grass-patch-${i}`}
            position={[x, 0.015, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <circleGeometry args={[1.5, 8]} />
            <meshStandardMaterial
              color="#3a6b1f"
              roughness={0.95}
              metalness={0.0}
            />
          </mesh>
        );
      })}

      {/* Central fountain - larger and more prominent */}
      <Fountain position={[0, 0, 0]} />

      {/* Central statue near fountain */}
      <Statue position={[-size * 0.15, 0, -size * 0.15]} />

      {/* Park benches */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const radius = size * 0.35;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group
            key={`bench-${i}`}
            position={[x, 0, z]}
            rotation={[0, angle + Math.PI, 0]}
          >
            {/* Bench seat */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.2, 0.15, 0.7]} />
              <meshStandardMaterial
                color="#5d4037"
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
            {/* Bench back */}
            <mesh position={[0, 0.5, -0.35]} castShadow>
              <boxGeometry args={[2.2, 1, 0.12]} />
              <meshStandardMaterial
                color="#5d4037"
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
            {/* Bench legs */}
            {[-0.9, 0.9].map((offset) => (
              <mesh
                key={`leg-${offset}`}
                position={[offset, 0.08, 0]}
                castShadow
              >
                <boxGeometry args={[0.12, 0.15, 0.12]} />
                <meshStandardMaterial
                  color="#3e2723"
                  roughness={0.9}
                  metalness={0.0}
                />
              </mesh>
            ))}
            {/* Bench armrests */}
            {[-1.1, 1.1].map((offset) => (
              <mesh
                key={`arm-${offset}`}
                position={[offset, 0.4, 0]}
                castShadow
              >
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial
                  color="#4a3428"
                  roughness={0.8}
                  metalness={0.1}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Park paths - improved cross pattern with more detail */}
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[size * 0.55, 1.5]} />
        <meshStandardMaterial color="#9b8565" roughness={0.9} metalness={0.0} />
      </mesh>
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        receiveShadow
      >
        <planeGeometry args={[size * 0.55, 1.5]} />
        <meshStandardMaterial color="#9b8565" roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Path borders - more detailed */}
      {Array.from({ length: 4 }).map((_, i) => {
        const isHorizontal = i % 2 === 0;
        const offset = size * 0.275;

        return (
          <mesh
            key={`path-border-${i}`}
            position={[
              isHorizontal ? 0 : i < 2 ? -offset : offset,
              0.025,
              isHorizontal ? (i < 2 ? -offset : offset) : 0,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[size * 0.55, 0.2]} />
            <meshStandardMaterial
              color="#6b5d4f"
              roughness={0.9}
              metalness={0.0}
            />
          </mesh>
        );
      })}

      {/* Trees in park - simplified */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = size * 0.42;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Simple tree sizes
        const trunkHeight = 1.3 + (i % 2) * 0.2;
        const trunkCenterY = trunkHeight / 2;
        const blobSize = 0.8 + (i % 2) * 0.2;

        return (
          <group key={`park-tree-${i}`} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, trunkCenterY, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.25, trunkHeight, 8]} />
              <meshStandardMaterial
                color="#5d4037"
                roughness={0.9}
                metalness={0.0}
              />
            </mesh>
            {/* Foliage - single layer */}
            <mesh position={[0, trunkHeight + blobSize * 0.7, 0]} castShadow receiveShadow>
              <sphereGeometry args={[blobSize, 16, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#2d5016" : "#3a6b1f"}
                roughness={0.95}
                metalness={0.0}
              />
            </mesh>
          </group>
        );
      })}

      {/* Flower beds/planters */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const radius = size * 0.28;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={`planter-${i}`} position={[x, 0, z]}>
            {/* Planter base */}
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.4, 0.45, 0.3, 8]} />
              <meshStandardMaterial
                color="#8b7355"
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
            {/* Soil/flowers */}
            <mesh position={[0, 0.3, 0]} castShadow={false}>
              <cylinderGeometry args={[0.38, 0.38, 0.1, 8]} />
              <meshStandardMaterial
                color="#5d4037"
                roughness={0.95}
                metalness={0.0}
              />
            </mesh>
            {/* Simple decorative flowers */}
            {Array.from({ length: 3 }).map((_, j) => {
              const flowerAngle = (j / 3) * Math.PI * 2;
              const flowerRadius = 0.15;
              const fx = Math.cos(flowerAngle) * flowerRadius;
              const fz = Math.sin(flowerAngle) * flowerRadius;

              return (
                <mesh
                  key={`flower-${j}`}
                  position={[fx, 0.35, fz]}
                  castShadow={false}
                >
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial
                    color={
                      j === 0 ? "#ff6b9d" : j === 1 ? "#ffd93d" : "#6bcf7f"
                    }
                    roughness={0.7}
                    metalness={0.2}
                    emissive={
                      j === 0 ? "#ff6b9d" : j === 1 ? "#ffd93d" : "#6bcf7f"
                    }
                    emissiveIntensity={0.2}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Decorative lampposts */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
        const radius = size * 0.48;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={`lamp-${i}`} position={[x, 0, z]}>
            {/* Pole */}
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
              <meshStandardMaterial
                color="#555555"
                roughness={0.7}
                metalness={0.3}
              />
            </mesh>
            {/* Lamp top */}
            <mesh position={[0, 3, 0]} castShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial
                color="#ffffaa"
                emissive="#ffffaa"
                emissiveIntensity={0.8}
                roughness={0.2}
                metalness={0.5}
              />
            </mesh>
          </group>
        );
      })}

      {/* Gazebo - new feature */}
      <Gazebo position={[size * 0.3, 0, size * 0.3]} />

      {/* Small pond/water feature */}
      <group position={[-size * 0.3, 0, size * 0.3]}>
        <mesh
          position={[0, 0.05, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[2.5, 32]} />
          <meshStandardMaterial
            color="#2d5016"
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
        <mesh
          position={[0, 0.08, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[2.3, 32]} />
          <meshStandardMaterial
            color="#1a4a8a"
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Pond decorative stones */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 1.8;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <mesh key={`pond-stone-${i}`} position={[x, 0.1, z]} castShadow>
              <boxGeometry args={[0.3, 0.15, 0.3]} />
              <meshStandardMaterial
                color="#6b6b6b"
                roughness={0.9}
                metalness={0.0}
              />
            </mesh>
          );
        })}
      </group>

      {/* Playground area - simple swing set */}
      <group position={[size * 0.3, 0, -size * 0.3]}>
        {/* Swing frame */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.15, 2.4, 0.15]} />
          <meshStandardMaterial
            color="#555555"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[-1.0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.15, 2.4, 0.15]} />
          <meshStandardMaterial
            color="#555555"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
        <mesh position={[1.0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.15, 2.4, 0.15]} />
          <meshStandardMaterial
            color="#555555"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
        {/* Top bar */}
        <mesh position={[0, 2.4, 0]} castShadow>
          <boxGeometry args={[2.3, 0.15, 0.15]} />
          <meshStandardMaterial
            color="#555555"
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
        {/* Swings */}
        {[-0.5, 0.5].map((offset, i) => (
          <group key={`swing-${i}`} position={[offset, 1.5, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, 0.05, 0.3]} />
              <meshStandardMaterial
                color="#8b4513"
                roughness={0.8}
                metalness={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

const Parks = () => {
  const parks = useMemo(() => {
    const parkElements: JSX.Element[] = [];
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH;
    const startPos = -totalSize / 2;

    // Place park at center (2,2)
    const parkPosition = [2, 2];

    const [row, col] = parkPosition;
    const x =
      startPos +
      col * (BLOCK_SIZE + STREET_WIDTH) +
      STREET_WIDTH +
      BLOCK_SIZE / 2;
    const z =
      startPos +
      row * (BLOCK_SIZE + STREET_WIDTH) +
      STREET_WIDTH +
      BLOCK_SIZE / 2;

    parkElements.push(
      <Park
        key={`park-${row}-${col}`}
        position={[x, 0, z]}
        size={BLOCK_SIZE - 2}
        isCenter={true}
      />
    );

    return parkElements;
  }, []);

  return <group>{parks}</group>;
};

export default Parks;
