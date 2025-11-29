'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { STREET_WIDTH, BLOCK_SIZE, GRID_SIZE } from './cityConstants'

interface ParkProps {
  position: [number, number, number]
  size: number
}

const Fountain = ({ position }: { position: [number, number, number] }) => {
  const waterRef = useRef<THREE.Mesh>(null)
  const sprayRefs = useRef<THREE.Mesh[]>([])
  const centralJetRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Animate water surface with ripples
    if (waterRef.current) {
      waterRef.current.rotation.z = time * 0.1
      const ripple = Math.sin(time * 2) * 0.02
      waterRef.current.position.y = 0.3 + ripple
    }
    
    // Animate water sprays with more dynamic movement
    sprayRefs.current.forEach((spray, i) => {
      if (spray) {
        const offset = i * 0.5
        const wave = Math.sin(time * 2.5 + offset) * 0.15
        spray.position.y = 0.8 + wave
        spray.scale.y = 0.7 + Math.sin(time * 2 + offset) * 0.3
        spray.rotation.z = Math.sin(time * 1.5 + offset) * 0.1
      }
    })

    // Animate central jet
    if (centralJetRef.current) {
      const jetHeight = 0.5 + Math.sin(time * 3) * 0.1
      centralJetRef.current.scale.y = jetHeight
      centralJetRef.current.position.y = 1.35 + (jetHeight - 0.5) * 0.25
    }
  })

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
        const angle = (i / 8) * Math.PI * 2
        const radius = 0.9
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh
            key={`spray-${i}`}
            ref={(el) => {
              if (el) sprayRefs.current[i] = el
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
        )
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
  )
}

const Statue = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Statue base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 1.0, 0.8, 16]} />
        <meshStandardMaterial 
          color="#8b8b8b" 
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      
      {/* Statue pedestal */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 1.2, 16]} />
        <meshStandardMaterial 
          color="#a0a0a0" 
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>
      
      {/* Statue figure - simplified abstract */}
      <mesh position={[0, 2.0, 0]} castShadow>
        <boxGeometry args={[0.3, 1.0, 0.3]} />
        <meshStandardMaterial 
          color="#c0c0c0" 
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>
      
      {/* Statue head */}
      <mesh position={[0, 2.7, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#d0d0d0" 
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
    </group>
  )
}

const Gazebo = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* Gazebo floor */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.5, 16]} />
        <meshStandardMaterial 
          color="#8b7355" 
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      {/* Gazebo columns */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 2.2
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
        return (
          <mesh key={`column-${i}`} position={[x, 1.5, z]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 3, 12]} />
            <meshStandardMaterial 
              color="#5d4037" 
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        )
      })}
      
      {/* Gazebo roof */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[2.8, 1.0, 8]} />
        <meshStandardMaterial 
          color="#6b5d4f" 
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      
      {/* Gazebo roof trim */}
      <mesh position={[0, 2.8, 0]} castShadow>
        <torusGeometry args={[2.5, 0.08, 8, 32]} />
        <meshStandardMaterial 
          color="#4a3428" 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  )
}

const Park = ({ position, size }: ParkProps) => {
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
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6
        const radius = size * 0.25
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        
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
        )
      })}

      {/* Central fountain - larger and more prominent */}
      <Fountain position={[0, 0, 0]} />
      
      {/* Central statue near fountain */}
      <Statue position={[-size * 0.15, 0, -size * 0.15]} />

      {/* Park benches */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
        const radius = size * 0.35
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        return (
          <group key={`bench-${i}`} position={[x, 0, z]} rotation={[0, angle + Math.PI, 0]}>
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
              <mesh key={`leg-${offset}`} position={[offset, 0.08, 0]} castShadow>
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
              <mesh key={`arm-${offset}`} position={[offset, 0.4, 0]} castShadow>
                <boxGeometry args={[0.1, 0.3, 0.1]} />
                <meshStandardMaterial 
                  color="#4a3428" 
                  roughness={0.8}
                  metalness={0.1}
                />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Park paths - improved cross pattern with more detail */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size * 0.55, 1.5]} />
        <meshStandardMaterial 
          color="#9b8565" 
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[size * 0.55, 1.5]} />
        <meshStandardMaterial 
          color="#9b8565" 
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* Path borders - more detailed */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2
        const isHorizontal = i % 2 === 0
        const offset = size * 0.275
        
        return (
          <mesh
            key={`path-border-${i}`}
            position={[
              isHorizontal ? 0 : (i < 2 ? -offset : offset),
              0.025,
              isHorizontal ? (i < 2 ? -offset : offset) : 0
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
        )
      })}


      {/* Trees in park - simplified */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        const radius = size * 0.42
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

        // Simple tree sizes
        const trunkHeight = 1.3 + (i % 2) * 0.2
        const trunkCenterY = trunkHeight / 2
        const blobSize = 0.8 + (i % 2) * 0.2

        return (
          <group key={`park-tree-${i}`} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, trunkCenterY, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.25, trunkHeight, 8]} />
              <meshStandardMaterial 
                color="#5d4037" 
                roughness={0.9}
                metalness={0.0}
              />
            </mesh>
            {/* Foliage - single layer */}
            <mesh position={[0, trunkHeight + blobSize * 0.7, 0]} castShadow>
              <sphereGeometry args={[blobSize, 16, 16]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#2d5016" : "#3a6b1f"} 
                roughness={0.95}
                metalness={0.0}
              />
            </mesh>
          </group>
        )
      })}

      {/* Flower beds/planters */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.PI / 6
        const radius = size * 0.28
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

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
              const flowerAngle = (j / 3) * Math.PI * 2
              const flowerRadius = 0.15
              const fx = Math.cos(flowerAngle) * flowerRadius
              const fz = Math.sin(flowerAngle) * flowerRadius
              
              return (
                <mesh key={`flower-${j}`} position={[fx, 0.35, fz]} castShadow={false}>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshStandardMaterial 
                    color={j === 0 ? "#ff6b9d" : j === 1 ? "#ffd93d" : "#6bcf7f"} 
                    roughness={0.7}
                    metalness={0.2}
                    emissive={j === 0 ? "#ff6b9d" : j === 1 ? "#ffd93d" : "#6bcf7f"}
                    emissiveIntensity={0.2}
                  />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {/* Decorative lampposts */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 8
        const radius = size * 0.48
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius

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
        )
      })}

      {/* Gazebo - new feature */}
      <Gazebo position={[size * 0.3, 0, size * 0.3]} />

      {/* Small pond/water feature */}
      <group position={[-size * 0.3, 0, size * 0.3]}>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.5, 32]} />
          <meshStandardMaterial 
            color="#2d5016" 
            roughness={0.95}
            metalness={0.0}
          />
        </mesh>
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
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
          const angle = (i / 8) * Math.PI * 2
          const radius = 1.8
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          
          return (
            <mesh key={`pond-stone-${i}`} position={[x, 0.1, z]} castShadow>
              <boxGeometry args={[0.3, 0.15, 0.3]} />
              <meshStandardMaterial 
                color="#6b6b6b" 
                roughness={0.9}
                metalness={0.0}
              />
            </mesh>
          )
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
  )
}

const Parks = () => {
  const parks = useMemo(() => {
    const parkElements: JSX.Element[] = []
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH
    const startPos = -totalSize / 2

    // Place park at center (2,2)
    const parkPosition = [2, 2]

    const [row, col] = parkPosition
    const x = startPos + col * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH + BLOCK_SIZE / 2
    const z = startPos + row * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH + BLOCK_SIZE / 2

    parkElements.push(
      <Park key={`park-${row}-${col}`} position={[x, 0, z]} size={BLOCK_SIZE - 2} />
    )

    return parkElements
  }, [])

  return <group>{parks}</group>
}

export default Parks

