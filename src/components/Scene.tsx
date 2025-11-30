// @ts-nocheck
'use client';

import { Canvas, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { TextureLoader, CanvasTexture } from 'three';
import { Suspense, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

interface SceneProps {
  imageSrc: string;
  depthMapSrc: string;
  displacementScale?: number;
  layerCount?: number;
  depthTolerance?: number;
}

export interface SceneHandle {
  exportGLB: () => void;
}

const SmoothDepthMesh = forwardRef<THREE.Mesh, Omit<SceneProps, 'layerCount' | 'depthTolerance'>>(
  ({ imageSrc, depthMapSrc, displacementScale = 1 }, ref) => {
    const [colorMap, depthMap] = useLoader(TextureLoader, [imageSrc, depthMapSrc]);
    const meshRef = useRef<THREE.Mesh>(null!);

  const { geometry, alphaMap } = useMemo(() => {
    const { width, height } = colorMap.image;
    const aspectRatio = width / height;
    const planeWidth = 5 * aspectRatio;
    const planeHeight = 5;

    // Create high-resolution plane geometry for smooth displacement
    const segments = Math.min(Math.max(width, height), 512);
    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segments, segments);

    // Get depth map data
    const depthCanvas = document.createElement('canvas');
    depthCanvas.width = width;
    depthCanvas.height = height;
    const depthCtx = depthCanvas.getContext('2d')!;
    const depthImage = depthMap.image as HTMLImageElement;
    depthCtx.drawImage(depthImage, 0, 0, width, height);
    const depthImageData = depthCtx.getImageData(0, 0, width, height);
    const depthData = depthImageData.data;

    // Get color map data (including alpha channel)
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = width;
    colorCanvas.height = height;
    const colorCtx = colorCanvas.getContext('2d')!;
    colorCtx.drawImage(colorMap.image as HTMLImageElement, 0, 0, width, height);
    const colorImageData = colorCtx.getImageData(0, 0, width, height);
    const colorData = colorImageData.data;

    // Create alpha map canvas
    const alphaCanvas = document.createElement('canvas');
    alphaCanvas.width = width;
    alphaCanvas.height = height;
    const alphaCtx = alphaCanvas.getContext('2d')!;
    const alphaImageData = alphaCtx.createImageData(width, height);
    const alphaData = alphaImageData.data;

    // Apply depth to vertices and extract alpha channel
    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;

    for (let i = 0; i < positions.count; i++) {
      const u = uvs.getX(i);
      const v = uvs.getY(i);

      // Sample depth from depth map
      const x = Math.floor(u * (width - 1));
      const y = Math.floor((1 - v) * (height - 1));
      const depthIndex = (y * width + x) * 4;

      // Average RGB channels for depth value
      const depth = (depthData[depthIndex] + depthData[depthIndex + 1] + depthData[depthIndex + 2]) / 3;

      // Get alpha value from color map
      const alpha = colorData[depthIndex + 3];

      // Only apply displacement to non-transparent pixels
      if (alpha > 0) {
        // Normalize depth to 0-1 range and apply displacement
        const normalizedDepth = depth / 255;
        const displacement = normalizedDepth * displacementScale * 3;

        // Apply displacement along Z axis
        positions.setZ(i, displacement);
      } else {
        // For transparent pixels, keep at base level
        positions.setZ(i, 0);
      }
    }

    // Create alpha map for material
    for (let i = 0; i < colorData.length; i += 4) {
      const alpha = colorData[i + 3];
      alphaData[i] = alpha;     // R
      alphaData[i + 1] = alpha; // G
      alphaData[i + 2] = alpha; // B
      alphaData[i + 3] = 255;   // A
    }

    alphaCtx.putImageData(alphaImageData, 0, 0);
    const alphaTexture = new CanvasTexture(alphaCanvas);
    alphaTexture.needsUpdate = true;

    // Recompute normals for proper lighting
    geometry.computeVertexNormals();
    positions.needsUpdate = true;

    return { geometry, alphaMap: alphaTexture };
  }, [colorMap, depthMap, displacementScale]);

    useImperativeHandle(ref, () => meshRef.current);

    return (
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh ref={meshRef} geometry={geometry}>
          <meshStandardMaterial
            map={colorMap}
            alphaMap={alphaMap}
            transparent={true}
            alphaTest={0.01}
            side={THREE.DoubleSide}
            flatShading={false}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </group>
    );
  }
);

function SceneContent({ meshRef }: { meshRef: React.RefObject<THREE.Mesh> }) {
  const { scene } = useThree();

  return (
    <>
      <OrbitControls
        enableDamping={false}
        autoRotate={false}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        makeDefault={true}
        minDistance={1}
        maxDistance={200}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

const Scene = forwardRef<SceneHandle, SceneProps>(
  ({ imageSrc, depthMapSrc, displacementScale = 2, layerCount = 5, depthTolerance = 0 }, ref) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useImperativeHandle(ref, () => ({
      exportGLB: () => {
        console.log('exportGLB called, meshRef.current:', meshRef.current);

        if (!meshRef.current) {
          console.error('Mesh not ready for export');
          alert('Mesh not ready for export. Please wait a moment.');
          return;
        }

        console.log('Starting GLB export...');
        const exporter = new GLTFExporter();

        exporter.parse(
          meshRef.current,
          (gltf) => {
            console.log('GLB export successful, creating download...');
            const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `depth-model-${Date.now()}.glb`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log('Download triggered');
          },
          (error) => {
            console.error('Error exporting GLB:', error);
            alert('Error exporting GLB: ' + error);
          },
          { binary: true }
        );
      },
    }));

    return (
      <div className="w-full h-full bg-black/50 rounded-xl overflow-hidden shadow-2xl border border-white/10">
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true
          }}
          camera={{
            position: [0, 5, 5],
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <Suspense fallback={null}>
            <SceneContent meshRef={meshRef} />

            <SmoothDepthMesh
              ref={meshRef}
              imageSrc={imageSrc}
              depthMapSrc={depthMapSrc}
              displacementScale={displacementScale}
            />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

Scene.displayName = 'Scene';

export default Scene;
