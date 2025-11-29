'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { STREET_WIDTH, BLOCK_SIZE, GRID_SIZE } from './cityConstants'

interface CarProps {
  position: [number, number, number]
  speed: number
  color: string
  path: THREE.Vector3[]
  pathIndex: number
  carType?: 'sedan' | 'suv' | 'compact'
}

type CarType = 'sedan' | 'suv' | 'compact'

interface CarDimensions {
  width: number
  height: number
  length: number
  wheelRadius: number
  wheelWidth: number
  wheelbase: number
}

const getCarDimensions = (type: CarType): CarDimensions => {
  switch (type) {
    case 'suv':
      return {
        width: 2.0,
        height: 1.8,
        length: 4.5,
        wheelRadius: 0.4,
        wheelWidth: 0.25,
        wheelbase: 2.8,
      }
    case 'compact':
      return {
        width: 1.6,
        height: 1.3,
        length: 3.2,
        wheelRadius: 0.28,
        wheelWidth: 0.2,
        wheelbase: 2.0,
      }
    default: // sedan
      return {
        width: 1.85,
        height: 1.5,
        length: 4.0,
        wheelRadius: 0.35,
        wheelWidth: 0.22,
        wheelbase: 2.5,
      }
  }
}

const Car = ({ position, speed, color, path, pathIndex, carType = 'sedan' }: CarProps) => {
  const carRef = useRef<THREE.Group>(null)
  const wheelRefs = useRef<THREE.Group[]>([])
  const currentPathIndex = useRef(pathIndex)
  const progress = useRef(0)
  const distanceTraveled = useRef(0)
  const dimensions = getCarDimensions(carType)
  const lastUpdate = useRef(0)

  useFrame((state, delta) => {
    // Throttle updates for better performance
    lastUpdate.current += delta
    if (lastUpdate.current < 0.016) return // ~60fps max
    const frameDelta = lastUpdate.current
    lastUpdate.current = 0
    if (!carRef.current || path.length === 0) return

    const currentPoint = path[currentPathIndex.current]
    const nextIndex = (currentPathIndex.current + 1) % path.length
    const nextPoint = path[nextIndex]

    progress.current += speed * frameDelta

    if (progress.current >= 1) {
      progress.current = 0
      currentPathIndex.current = nextIndex
    } else {
      const currentPos = new THREE.Vector3().lerpVectors(
        currentPoint,
        nextPoint,
        progress.current
      )

      const distance = currentPoint.distanceTo(nextPoint)
      distanceTraveled.current += distance * speed * frameDelta

      carRef.current.position.set(currentPos.x, currentPos.y, currentPos.z)

      // Rotate to face direction of movement
      const direction = new THREE.Vector3()
        .subVectors(nextPoint, currentPoint)
        .normalize()
      const angle = Math.atan2(direction.x, direction.z)
      carRef.current.rotation.y = angle

      // Rotate wheels based on distance traveled
      const wheelRotation = (distanceTraveled.current / dimensions.wheelRadius) % (Math.PI * 2)
      wheelRefs.current.forEach((wheel) => {
        if (wheel) {
          wheel.rotation.x = wheelRotation
        }
      })
    }
  })

  const wheelPositions = [
    [-dimensions.width * 0.4, dimensions.wheelRadius, dimensions.wheelbase * 0.4],
    [dimensions.width * 0.4, dimensions.wheelRadius, dimensions.wheelbase * 0.4],
    [-dimensions.width * 0.4, dimensions.wheelRadius, -dimensions.wheelbase * 0.4],
    [dimensions.width * 0.4, dimensions.wheelRadius, -dimensions.wheelbase * 0.4],
  ]

  return (
    <group ref={carRef} position={position}>
      {/* Car body - main chassis */}
      <mesh position={[0, dimensions.height * 0.3, 0]} castShadow={false}>
        <boxGeometry args={[dimensions.width, dimensions.height * 0.4, dimensions.length]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2}
          metalness={0.7}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Car roof */}
      <mesh position={[0, dimensions.height * 0.75, -dimensions.length * 0.1]} castShadow={false}>
        <boxGeometry args={[dimensions.width * 0.9, dimensions.height * 0.35, dimensions.length * 0.5]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2}
          metalness={0.7}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Front bumper */}
      <mesh position={[0, dimensions.height * 0.25, dimensions.length * 0.48]} castShadow={false}>
        <boxGeometry args={[dimensions.width * 0.95, dimensions.height * 0.3, dimensions.length * 0.08]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Rear bumper */}
      <mesh position={[0, dimensions.height * 0.25, -dimensions.length * 0.48]} castShadow={false}>
        <boxGeometry args={[dimensions.width * 0.95, dimensions.height * 0.3, dimensions.length * 0.08]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Windows - simplified for performance */}
      <mesh position={[0, dimensions.height * 0.75, -dimensions.length * 0.1]}>
        <boxGeometry args={[dimensions.width * 0.8, dimensions.height * 0.28, dimensions.length * 0.45]} />
        <meshStandardMaterial 
          color="#2a4a6a" 
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>

      {/* Wheels with rims */}
      {wheelPositions.map((pos, i) => {
        const wheelGroupRef = (el: THREE.Group | null) => {
          if (el) wheelRefs.current[i] = el
        }
        
        return (
          <group key={`wheel-${i}`} ref={wheelGroupRef} position={pos} rotation={[0, 0, Math.PI / 2]}>
            {/* Tire */}
            <mesh castShadow={false}>
              <cylinderGeometry args={[dimensions.wheelRadius, dimensions.wheelRadius, dimensions.wheelWidth, 16]} />
              <meshStandardMaterial 
                color="#1a1a1a" 
                roughness={0.98}
                metalness={0.05}
              />
            </mesh>
            {/* Rim */}
            <mesh castShadow={false}>
              <cylinderGeometry args={[dimensions.wheelRadius * 0.6, dimensions.wheelRadius * 0.6, dimensions.wheelWidth * 1.1, 8]} />
              <meshStandardMaterial 
                color="#c0c0c0" 
                roughness={0.3}
                metalness={0.8}
                envMapIntensity={1.5}
              />
            </mesh>
            {/* Rim spokes */}
            {Array.from({ length: 5 }).map((_, j) => (
              <mesh key={`spoke-${j}`} rotation={[0, 0, (j * Math.PI * 2) / 5]}>
                <boxGeometry args={[dimensions.wheelRadius * 0.15, dimensions.wheelRadius * 0.5, dimensions.wheelWidth * 1.2]} />
                <meshStandardMaterial 
                  color="#e0e0e0" 
                  roughness={0.2}
                  metalness={0.9}
                />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* Headlights */}
      <mesh position={[-dimensions.width * 0.3, dimensions.height * 0.4, dimensions.length * 0.48]}>
        <boxGeometry args={[dimensions.width * 0.15, dimensions.height * 0.15, dimensions.length * 0.05]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffaa" 
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[dimensions.width * 0.3, dimensions.height * 0.4, dimensions.length * 0.48]}>
        <boxGeometry args={[dimensions.width * 0.15, dimensions.height * 0.15, dimensions.length * 0.05]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffaa" 
          emissiveIntensity={1.2}
          roughness={0.1}
        />
      </mesh>

      {/* Taillights */}
      <mesh position={[-dimensions.width * 0.35, dimensions.height * 0.4, -dimensions.length * 0.48]}>
        <boxGeometry args={[dimensions.width * 0.12, dimensions.height * 0.15, dimensions.length * 0.05]} />
        <meshStandardMaterial 
          color="#ff3333" 
          emissive="#ff0000" 
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[dimensions.width * 0.35, dimensions.height * 0.4, -dimensions.length * 0.48]}>
        <boxGeometry args={[dimensions.width * 0.12, dimensions.height * 0.15, dimensions.length * 0.05]} />
        <meshStandardMaterial 
          color="#ff3333" 
          emissive="#ff0000" 
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Side mirrors */}
      <mesh position={[-dimensions.width * 0.52, dimensions.height * 0.65, dimensions.length * 0.15]}>
        <boxGeometry args={[dimensions.width * 0.08, dimensions.height * 0.08, dimensions.length * 0.05]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      <mesh position={[dimensions.width * 0.52, dimensions.height * 0.65, dimensions.length * 0.15]}>
        <boxGeometry args={[dimensions.width * 0.08, dimensions.height * 0.08, dimensions.length * 0.05]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
    </group>
  )
}

const Cars = () => {
  const cars = useMemo(() => {
    const carElements: JSX.Element[] = []
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH
    const startPos = -totalSize / 2
    const gridBound = totalSize / 2
    const numCars = 12

    const carTypes: CarType[] = ['sedan', 'suv', 'compact']
    
    const carColors = [
      '#c41e3a', // Deep red
      '#0066cc', // Blue
      '#2d5016', // Forest green
      '#ffd700', // Gold
      '#8b00ff', // Purple
      '#00ced1', // Dark turquoise
      '#ff6347', // Tomato
      '#4169e1', // Royal blue
      '#ffffff', // White
      '#1a1a1a', // Black
      '#808080', // Gray
      '#ff8c00', // Dark orange
      '#4b0082', // Indigo
      '#dc143c', // Crimson
      '#00ff7f', // Spring green
    ]

    // Generate paths along streets - constrained to actual grid boundaries
    const generateStreetPath = (streetX: number, streetZ: number, isHorizontal: boolean): THREE.Vector3[] => {
      const path: THREE.Vector3[] = []
      const stepSize = 3 // Distance between path points
      
      if (isHorizontal) {
        // Horizontal path: move along X axis, keep Z constant (street center)
        // Path should go from one edge of the grid to the other
        const minX = -gridBound + STREET_WIDTH / 2
        const maxX = gridBound - STREET_WIDTH / 2
        const clampedZ = Math.max(-gridBound + STREET_WIDTH / 2, Math.min(gridBound - STREET_WIDTH / 2, streetZ))
        
        let currentX = minX
        while (currentX <= maxX) {
          path.push(new THREE.Vector3(currentX, 0.4, clampedZ))
          currentX += stepSize
        }
        // Ensure we end at the boundary
        if (path.length > 0 && path[path.length - 1].x < maxX) {
          path.push(new THREE.Vector3(maxX, 0.4, clampedZ))
        }
      } else {
        // Vertical path: move along Z axis, keep X constant (street center)
        // Path should go from one edge of the grid to the other
        const minZ = -gridBound + STREET_WIDTH / 2
        const maxZ = gridBound - STREET_WIDTH / 2
        const clampedX = Math.max(-gridBound + STREET_WIDTH / 2, Math.min(gridBound - STREET_WIDTH / 2, streetX))
        
        let currentZ = minZ
        while (currentZ <= maxZ) {
          path.push(new THREE.Vector3(clampedX, 0.4, currentZ))
          currentZ += stepSize
        }
        // Ensure we end at the boundary
        if (path.length > 0 && path[path.length - 1].z < maxZ) {
          path.push(new THREE.Vector3(clampedX, 0.4, maxZ))
        }
      }
      
      return path.length > 1 ? path : []
    }

    for (let i = 0; i < numCars; i++) {
      const row = Math.floor(Math.random() * (GRID_SIZE + 1))
      const col = Math.floor(Math.random() * (GRID_SIZE + 1))
      const isHorizontal = Math.random() > 0.5
      
      // Calculate street center position based on grid
      const streetX = startPos + col * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH / 2
      const streetZ = startPos + row * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH / 2
      
      // Generate path along the street - path generation will clamp to boundaries
      const path = generateStreetPath(streetX, streetZ, isHorizontal)
      
      // Skip if path is invalid
      if (path.length < 2) continue

      // More varied speeds
      const speed = 0.25 + Math.random() * 0.5
      const color = carColors[Math.floor(Math.random() * carColors.length)]
      const carType = carTypes[Math.floor(Math.random() * carTypes.length)]
      const initialPosition = path[0]

      carElements.push(
        <Car
          key={`car-${i}`}
          position={[initialPosition.x, initialPosition.y, initialPosition.z]}
          speed={speed}
          color={color}
          path={path}
          pathIndex={0}
          carType={carType}
        />
      )
    }

    return carElements
  }, [])

  return <group>{cars}</group>
}

export default Cars

