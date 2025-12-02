'use client'

import { useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

// Helper function to generate a very colorful palette based on base color
const getPastelPalette = (baseColor: string, buildingId?: string): THREE.Color[] => {
  const base = new THREE.Color(baseColor)
  const hsl = { h: 0, s: 0, l: 0 }
  base.getHSL(hsl)
  
  // Add a small offset based on building ID to ensure each building is unique
  let hueOffset = 0
  if (buildingId) {
    const hash = buildingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    hueOffset = (hash % 20) / 100 // 0-0.2 offset for variety
  }
  
  // Generate a very vibrant and colorful palette
  const palette: THREE.Color[] = []
  
  const baseHue = (hsl.h + hueOffset) % 1
  
  // Main color - maximum vibrancy
  const main = new THREE.Color()
  main.setHSL(baseHue, 0.8, 0.65)
  palette.push(main)
  
  // Bright, saturated variation
  const bright = new THREE.Color()
  bright.setHSL(baseHue, 0.75, 0.7)
  palette.push(bright)
  
  // Lighter, highly saturated
  const light = new THREE.Color()
  light.setHSL(baseHue, 0.7, 0.75)
  palette.push(light)
  
  // Adjacent hue - very vibrant
  const variation1 = new THREE.Color()
  variation1.setHSL((baseHue + 0.12) % 1, 0.8, 0.63)
  palette.push(variation1)
  
  // Another adjacent hue
  const variation2 = new THREE.Color()
  variation2.setHSL((baseHue - 0.12 + 1) % 1, 0.78, 0.67)
  palette.push(variation2)
  
  // Triadic color 1 - maximum vibrancy
  const triadic1 = new THREE.Color()
  triadic1.setHSL((baseHue + 0.33) % 1, 0.8, 0.65)
  palette.push(triadic1)
  
  // Triadic color 2
  const triadic2 = new THREE.Color()
  triadic2.setHSL((baseHue - 0.33 + 1) % 1, 0.78, 0.68)
  palette.push(triadic2)
  
  // Complementary - very vibrant
  const complement = new THREE.Color()
  complement.setHSL((baseHue + 0.5) % 1, 0.75, 0.67)
  palette.push(complement)
  
  // Analogous color - vibrant
  const analogous1 = new THREE.Color()
  analogous1.setHSL((baseHue + 0.2) % 1, 0.8, 0.66)
  palette.push(analogous1)
  
  // Another analogous
  const analogous2 = new THREE.Color()
  analogous2.setHSL((baseHue - 0.2 + 1) % 1, 0.78, 0.64)
  palette.push(analogous2)
  
  // Split complementary 1
  const splitComp1 = new THREE.Color()
  splitComp1.setHSL((baseHue + 0.45) % 1, 0.75, 0.69)
  palette.push(splitComp1)
  
  // Split complementary 2
  const splitComp2 = new THREE.Color()
  splitComp2.setHSL((baseHue - 0.45 + 1) % 1, 0.8, 0.66)
  palette.push(splitComp2)
  
  // Tetradic color
  const tetradic = new THREE.Color()
  tetradic.setHSL((baseHue + 0.25) % 1, 0.78, 0.67)
  palette.push(tetradic)
  
  return palette
}

// Helper function to update all materials in a scene to use pastel colors
const updateSceneMaterials = (scene: THREE.Object3D, baseColor?: string, buildingId?: string) => {
  if (!baseColor) return
  
  const palette = getPastelPalette(baseColor, buildingId)
  let materialIndex = 0
  
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.material) {
        // Handle both single materials and material arrays
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material]
        
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial || 
              material instanceof THREE.MeshBasicMaterial ||
              material instanceof THREE.MeshPhongMaterial ||
              material instanceof THREE.MeshLambertMaterial) {
            // Assign a pastel color from the palette
            const pastelColor = palette[materialIndex % palette.length]
            material.color.copy(pastelColor)
            materialIndex++
            
            // Ensure materials have nice properties for pastel look
            if (material instanceof THREE.MeshStandardMaterial) {
              material.roughness = 1.0
              material.metalness = 0.0
            }
          }
        })
      }
    }
  })
}

interface PolyPizzaModelProps {
  url: string
  position?: [number, number, number]
  scale?: [number, number, number] | number
  color?: string
  shouldBeTranslucent?: boolean
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerEnter?: (e: ThreeEvent<PointerEvent>) => void
  onPointerLeave?: (e: ThreeEvent<PointerEvent>) => void
}

const PolyPizzaModel = ({
  url,
  position = [0, 0, 0],
  scale = 1,
  color,
  shouldBeTranslucent = false,
  onClick,
  onPointerEnter,
  onPointerLeave,
}: PolyPizzaModelProps) => {
  const { scene } = useGLTF(url)
  const clonedScene = useMemo(() => {
    const cloned = scene.clone()
    
    // Clone materials to ensure each building instance has unique materials
    // This prevents materials from being shared between building instances
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          // Clone each material in the array
          child.material = child.material.map((mat) => mat.clone())
        } else {
          // Clone single material
          child.material = child.material.clone()
        }
      }
    })
    
    // Disable raycasting on all meshes in the cloned scene so only parent hitboxes receive clicks
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.raycast = () => {} // Disable raycasting on model meshes
      }
    })
    if (color) {
      // Use URL as unique identifier for color variation
      updateSceneMaterials(cloned, color, url)
    }
    return cloned
  }, [scene, color, url])

  // Update material translucency when prop changes - use useEffect for performance
  useEffect(() => {
    if (!clonedScene) return

    const targetOpacity = shouldBeTranslucent ? 0.3 : 1.0
    const targetTransparent = shouldBeTranslucent
    const targetDepthWrite = !shouldBeTranslucent
    const targetSide = shouldBeTranslucent ? THREE.DoubleSide : THREE.FrontSide
    const targetPolygonOffset = shouldBeTranslucent
    // Use higher polygonOffset values to prevent z-fighting at base
    const targetPolygonOffsetFactor = shouldBeTranslucent ? 4 : 0
    const targetPolygonOffsetUnits = shouldBeTranslucent ? 4 : 0

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material]
        materials.forEach((material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshPhongMaterial ||
            material instanceof THREE.MeshLambertMaterial
          ) {
            // Only update if values have changed
            if (
              material.opacity !== targetOpacity ||
              material.transparent !== targetTransparent ||
              material.depthWrite !== targetDepthWrite ||
              material.side !== targetSide ||
              material.polygonOffset !== targetPolygonOffset ||
              material.polygonOffsetFactor !== targetPolygonOffsetFactor ||
              material.polygonOffsetUnits !== targetPolygonOffsetUnits
            ) {
              material.opacity = targetOpacity
              material.transparent = targetTransparent
              material.depthWrite = targetDepthWrite
              material.side = targetSide
              material.polygonOffset = targetPolygonOffset
              material.polygonOffsetFactor = targetPolygonOffsetFactor
              material.polygonOffsetUnits = targetPolygonOffsetUnits
              material.needsUpdate = true
            }
          }
        })
      }
    })
  }, [clonedScene, shouldBeTranslucent])

  // Convert scale to array if it's a number
  const scaleArray = Array.isArray(scale) ? scale : [scale, scale, scale]

  return (
    <group
      position={position}
      scale={scaleArray as [number, number, number]}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

export default PolyPizzaModel

