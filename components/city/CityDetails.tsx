'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import TrafficLight from './TrafficLight'
import * as THREE from 'three'

import { STREET_WIDTH, BLOCK_SIZE, GRID_SIZE } from './cityConstants'

// Shared materials for better performance
const streetLightPoleMaterial = new THREE.MeshStandardMaterial({
  color: '#333333',
  roughness: 0.8,
  metalness: 0.1,
});

const streetLightGlowMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffaa',
  emissive: '#ffffaa',
  emissiveIntensity: 0.8,
});

const trashCanMaterial = new THREE.MeshStandardMaterial({
  color: '#333333',
  roughness: 0.9,
  metalness: 0.0,
});

const trashCanLidMaterial = new THREE.MeshStandardMaterial({
  color: '#1a1a1a',
  roughness: 0.8,
  metalness: 0.1,
});

const signPoleMaterial = new THREE.MeshStandardMaterial({
  color: '#666666',
  roughness: 0.7,
  metalness: 0.2,
});

const signBoardMaterial = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  roughness: 0.6,
  metalness: 0.0,
});

interface StreetLightInstance {
  position: THREE.Vector3
}

interface TrashCanInstance {
  position: THREE.Vector3
}

interface SignInstance {
  position: THREE.Vector3
}

const CityDetails = () => {
  const streetLightPoleRef = useRef<THREE.InstancedMesh>(null)
  const streetLightGlowRef = useRef<THREE.InstancedMesh>(null)
  const trashCanBodyRef = useRef<THREE.InstancedMesh>(null)
  const trashCanLidRef = useRef<THREE.InstancedMesh>(null)
  const signPoleRef = useRef<THREE.InstancedMesh>(null)
  const signBoardRef = useRef<THREE.InstancedMesh>(null)

  const { trafficLights, streetLights, trashCans, signs } = useMemo(() => {
    const trafficLightElements: JSX.Element[] = []
    const streetLightInstances: StreetLightInstance[] = []
    const trashCanInstances: TrashCanInstance[] = []
    const signInstances: SignInstance[] = []
    
    const totalSize = GRID_SIZE * BLOCK_SIZE + (GRID_SIZE + 1) * STREET_WIDTH
    const startPos = -totalSize / 2
    const groundBound = 80 // For grid size 6 (totalSize = ~137.5)

    const parkPositions = new Set(['2,2']) // Center park

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const gridKey = `${row},${col}`
        if (parkPositions.has(gridKey)) {
          continue
        }

        const blockCenterX = startPos + col * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH + BLOCK_SIZE / 2
        const blockCenterZ = startPos + row * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH + BLOCK_SIZE / 2
        const blockStartX = startPos + col * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH
        const blockEndX = blockStartX + BLOCK_SIZE
        const blockStartZ = startPos + row * (BLOCK_SIZE + STREET_WIDTH) + STREET_WIDTH
        const blockEndZ = blockStartZ + BLOCK_SIZE

        const seed = row * GRID_SIZE + col
        const rng = (n: number) => {
          const x = Math.sin(n * 12.9898 + seed) * 43758.5453
          return x - Math.floor(x)
        }

        // Street lights
        if (rng(seed + 100) > 0.7) {
          const numLights = 1 + Math.floor(rng(seed + 101) * 2)
          const edge = Math.floor(rng(seed + 102) * 4)
          
          for (let i = 0; i < numLights; i++) {
            let lightX = blockCenterX
            let lightZ = blockCenterZ
            
            if (edge === 0) {
              lightX = blockStartX + 1
              lightZ = blockStartZ + 2 + i * (BLOCK_SIZE - 4) / numLights
            } else if (edge === 1) {
              lightX = blockEndX - 1
              lightZ = blockStartZ + 2 + i * (BLOCK_SIZE - 4) / numLights
            } else if (edge === 2) {
              lightX = blockStartX + 2 + i * (BLOCK_SIZE - 4) / numLights
              lightZ = blockStartZ + 1
            } else {
              lightX = blockStartX + 2 + i * (BLOCK_SIZE - 4) / numLights
              lightZ = blockEndZ - 1
            }

            if (Math.abs(lightX) < groundBound && Math.abs(lightZ) < groundBound) {
              streetLightInstances.push({
                position: new THREE.Vector3(lightX, 0, lightZ),
              })
            }
          }
        }

        // Traffic lights (keep as individual components for animation)
        if (rng(seed + 200) > 0.85) {
          const corner = Math.floor(rng(seed + 201) * 4)
          let trafficX = blockCenterX
          let trafficZ = blockCenterZ
          let rotation = 0

          if (corner === 0) {
            trafficX = blockStartX + 1.5
            trafficZ = blockStartZ + 1.5
            rotation = Math.PI / 4
          } else if (corner === 1) {
            trafficX = blockEndX - 1.5
            trafficZ = blockStartZ + 1.5
            rotation = -Math.PI / 4
          } else if (corner === 2) {
            trafficX = blockStartX + 1.5
            trafficZ = blockEndZ - 1.5
            rotation = -Math.PI / 4
          } else {
            trafficX = blockEndX - 1.5
            trafficZ = blockEndZ - 1.5
            rotation = Math.PI / 4
          }

          if (Math.abs(trafficX) < groundBound && Math.abs(trafficZ) < groundBound) {
            trafficLightElements.push(
              <TrafficLight
                key={`traffic-${row}-${col}`}
                position={[trafficX, 0, trafficZ]}
                rotation={rotation}
              />
            )
          }
        }

        // Trash cans
        if (rng(seed + 300) > 0.94) {
          const trashX = blockStartX + 2 + rng(seed + 301) * (BLOCK_SIZE - 4)
          const trashZ = blockStartZ + 2 + rng(seed + 302) * (BLOCK_SIZE - 4)

          if (Math.abs(trashX) < groundBound && Math.abs(trashZ) < groundBound) {
            trashCanInstances.push({
              position: new THREE.Vector3(trashX, 0, trashZ),
            })
          }
        }

        // Street signs
        if (rng(seed + 400) > 0.88) {
          const edge = Math.floor(rng(seed + 401) * 4)
          let signX = blockCenterX
          let signZ = blockCenterZ

          if (edge === 0) {
            signX = blockStartX + 1.5
            signZ = blockStartZ + 3 + rng(seed + 402) * (BLOCK_SIZE - 6)
          } else if (edge === 1) {
            signX = blockEndX - 1.5
            signZ = blockStartZ + 3 + rng(seed + 402) * (BLOCK_SIZE - 6)
          } else if (edge === 2) {
            signX = blockStartX + 3 + rng(seed + 402) * (BLOCK_SIZE - 6)
            signZ = blockStartZ + 1.5
          } else {
            signX = blockStartX + 3 + rng(seed + 402) * (BLOCK_SIZE - 6)
            signZ = blockEndZ - 1.5
          }

          if (Math.abs(signX) < groundBound && Math.abs(signZ) < groundBound) {
            signInstances.push({
              position: new THREE.Vector3(signX, 0, signZ),
            })
          }
        }
      }
    }

    return {
      trafficLights: trafficLightElements,
      streetLights: streetLightInstances,
      trashCans: trashCanInstances,
      signs: signInstances,
    }
  }, [])

  useFrame(() => {
    // Update street light instances
    if (streetLightPoleRef.current && streetLightGlowRef.current) {
      streetLights.forEach((light, index) => {
        const poleMatrix = new THREE.Matrix4()
        poleMatrix.setPosition(light.position.x, light.position.y + 2, light.position.z)
        streetLightPoleRef.current!.setMatrixAt(index, poleMatrix)
        
        const glowMatrix = new THREE.Matrix4()
        glowMatrix.setPosition(light.position.x, light.position.y + 4, light.position.z)
        streetLightGlowRef.current!.setMatrixAt(index, glowMatrix)
      })
      streetLightPoleRef.current.instanceMatrix.needsUpdate = true
      streetLightGlowRef.current.instanceMatrix.needsUpdate = true
    }

    // Update trash can instances
    if (trashCanBodyRef.current && trashCanLidRef.current) {
      trashCans.forEach((trash, index) => {
        const bodyMatrix = new THREE.Matrix4()
        bodyMatrix.setPosition(trash.position.x, trash.position.y + 0.3, trash.position.z)
        trashCanBodyRef.current!.setMatrixAt(index, bodyMatrix)
        
        const lidMatrix = new THREE.Matrix4()
        lidMatrix.setPosition(trash.position.x, trash.position.y + 0.6, trash.position.z)
        trashCanLidRef.current!.setMatrixAt(index, lidMatrix)
      })
      trashCanBodyRef.current.instanceMatrix.needsUpdate = true
      trashCanLidRef.current.instanceMatrix.needsUpdate = true
    }

    // Update sign instances
    if (signPoleRef.current && signBoardRef.current) {
      signs.forEach((sign, index) => {
        const poleMatrix = new THREE.Matrix4()
        poleMatrix.setPosition(sign.position.x, sign.position.y + 1.5, sign.position.z)
        signPoleRef.current!.setMatrixAt(index, poleMatrix)
        
        const boardMatrix = new THREE.Matrix4()
        boardMatrix.setPosition(sign.position.x, sign.position.y + 2, sign.position.z)
        signBoardRef.current!.setMatrixAt(index, boardMatrix)
      })
      signPoleRef.current.instanceMatrix.needsUpdate = true
      signBoardRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      {/* Traffic lights - individual components for animation */}
      {trafficLights}
      
      {/* Instanced street lights */}
      {streetLights.length > 0 && (
        <>
          <instancedMesh ref={streetLightPoleRef} args={[undefined, undefined, streetLights.length]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
            <primitive object={streetLightPoleMaterial} attach="material" />
          </instancedMesh>
          <instancedMesh ref={streetLightGlowRef} args={[undefined, undefined, streetLights.length]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <primitive object={streetLightGlowMaterial} attach="material" />
          </instancedMesh>
        </>
      )}
      
      {/* Instanced trash cans */}
      {trashCans.length > 0 && (
        <>
          <instancedMesh ref={trashCanBodyRef} args={[undefined, undefined, trashCans.length]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.6, 8]} />
            <primitive object={trashCanMaterial} attach="material" />
          </instancedMesh>
          <instancedMesh ref={trashCanLidRef} args={[undefined, undefined, trashCans.length]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.1, 8]} />
            <primitive object={trashCanLidMaterial} attach="material" />
          </instancedMesh>
        </>
      )}
      
      {/* Instanced signs */}
      {signs.length > 0 && (
        <>
          <instancedMesh ref={signPoleRef} args={[undefined, undefined, signs.length]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
            <primitive object={signPoleMaterial} attach="material" />
          </instancedMesh>
          <instancedMesh ref={signBoardRef} args={[undefined, undefined, signs.length]} castShadow>
            <boxGeometry args={[0.8, 0.5, 0.05]} />
            <primitive object={signBoardMaterial} attach="material" />
          </instancedMesh>
        </>
      )}
    </group>
  )
}

export default CityDetails

