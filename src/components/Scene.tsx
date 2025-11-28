'use client';

import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { TextureLoader, CanvasTexture } from 'three';
import { Suspense, useMemo } from 'react';
import * as THREE from 'three';

interface SceneProps {
  imageSrc: string;
  depthMapSrc: string;
  displacementScale?: number;
  layerCount?: number;
}

function LayeredImageMesh({ imageSrc, depthMapSrc, displacementScale = 1, layerCount = 5 }: SceneProps & { layerCount: number }) {
  const [colorMap, depthMap] = useLoader(TextureLoader, [imageSrc, depthMapSrc]);

  const layers = useMemo(() => {
    const { width, height } = colorMap.image;
    const aspectRatio = width / height;
    const planeWidth = 5 * aspectRatio;
    const planeHeight = 5;

    // Create a canvas to read depth map pixel data
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Draw depth map to canvas
    const depthImage = depthMap.image as HTMLImageElement;
    ctx.drawImage(depthImage, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const depthData = imageData.data;

    // Draw color image to another canvas
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = width;
    colorCanvas.height = height;
    const colorCtx = colorCanvas.getContext('2d')!;
    colorCtx.drawImage(colorMap.image as HTMLImageElement, 0, 0, width, height);
    const colorImageData = colorCtx.getImageData(0, 0, width, height);
    const colorData = colorImageData.data;

    // Create layers based on depth ranges
    const layerTextures: CanvasTexture[] = [];
    const layerDepths: number[] = [];

    for (let layer = 0; layer < layerCount; layer++) {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = width;
      layerCanvas.height = height;
      const layerCtx = layerCanvas.getContext('2d')!;
      const layerImageData = layerCtx.createImageData(width, height);
      const layerData = layerImageData.data;

      const minDepth = (layer / layerCount) * 255;
      const maxDepth = ((layer + 1) / layerCount) * 255;
      const avgDepth = (minDepth + maxDepth) / 2;

      // Copy pixels that fall within this depth range
      for (let i = 0; i < depthData.length; i += 4) {
        const depth = (depthData[i] + depthData[i + 1] + depthData[i + 2]) / 3;
        
        if (depth >= minDepth && depth < maxDepth) {
          layerData[i] = colorData[i];       // R
          layerData[i + 1] = colorData[i + 1]; // G
          layerData[i + 2] = colorData[i + 2]; // B
          layerData[i + 3] = 255;              // A (fully opaque)
        } else {
          layerData[i] = 0;
          layerData[i + 1] = 0;
          layerData[i + 2] = 0;
          layerData[i + 3] = 0; // Transparent
        }
      }

      layerCtx.putImageData(layerImageData, 0, 0);
      const texture = new CanvasTexture(layerCanvas);
      texture.needsUpdate = true;
      
      layerTextures.push(texture);
      layerDepths.push((avgDepth / 255) * displacementScale);
    }

    return { textures: layerTextures, depths: layerDepths, planeWidth, planeHeight };
  }, [colorMap, depthMap, layerCount, displacementScale]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {layers.textures.map((texture, index) => (
        <mesh key={index} position={[0, 0, layers.depths[index]]}>
          <planeGeometry args={[layers.planeWidth, layers.planeHeight]} />
          <meshStandardMaterial
            map={texture}
            transparent={true}
            alphaTest={0.01}
            side={THREE.DoubleSide}
            depthWrite={true}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene({ imageSrc, depthMapSrc, displacementScale = 2, layerCount = 5 }: SceneProps) {
  return (
    <div className="w-full h-full bg-black/50 rounded-xl overflow-hidden shadow-2xl border border-white/10">
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 5, 5]} fov={50} />
          <OrbitControls enableDamping />
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="studio" />

          <LayeredImageMesh 
            imageSrc={imageSrc} 
            depthMapSrc={depthMapSrc} 
            displacementScale={displacementScale}
            layerCount={layerCount}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
