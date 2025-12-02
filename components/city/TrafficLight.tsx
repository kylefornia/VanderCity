'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TrafficLightProps {
  position: [number, number, number]
  rotation?: number
}

const TrafficLight = ({ position, rotation = 0 }: TrafficLightProps) => {
  const redLightRef = useRef<THREE.Mesh>(null)
  const yellowLightRef = useRef<THREE.Mesh>(null)
  const greenLightRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime
    const cycle = (timeRef.current % 12) / 12

    // Traffic light cycle: red (0-0.4), yellow (0.4-0.5), green (0.5-1.0)
    if (redLightRef.current && yellowLightRef.current && greenLightRef.current) {
      const redMaterial = redLightRef.current.material as THREE.MeshStandardMaterial;
      const yellowMaterial = yellowLightRef.current.material as THREE.MeshStandardMaterial;
      const greenMaterial = greenLightRef.current.material as THREE.MeshStandardMaterial;
      
      if (cycle < 0.4) {
        // Red
        redMaterial.emissive.setHex(0xff0000)
        yellowMaterial.emissive.setHex(0x000000)
        greenMaterial.emissive.setHex(0x000000)
      } else if (cycle < 0.5) {
        // Yellow
        redMaterial.emissive.setHex(0x000000)
        yellowMaterial.emissive.setHex(0xffff00)
        greenMaterial.emissive.setHex(0x000000)
      } else {
        // Green
        redMaterial.emissive.setHex(0x000000)
        yellowMaterial.emissive.setHex(0x000000)
        greenMaterial.emissive.setHex(0x00ff00)
      }
    }
  })

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pole */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Box */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[0.8, 2, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Red light */}
      <mesh ref={redLightRef} position={[0, 3.2, 0.31]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#000000" />
      </mesh>

      {/* Yellow light */}
      <mesh ref={yellowLightRef} position={[0, 2.5, 0.31]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#ffff00" emissive="#000000" />
      </mesh>

      {/* Green light */}
      <mesh ref={greenLightRef} position={[0, 1.8, 0.31]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#00ff00" emissive="#000000" />
      </mesh>
    </group>
  )
}

export default TrafficLight




