'use client';

import { useState, useRef, ChangeEvent } from 'react';
import dynamic from 'next/dynamic';
import { Upload, Loader2, Layers, Image as ImageIcon, Box } from 'lucide-react';
import { DepthEstimator } from '@/utils/depth';
import clsx from 'clsx';

// Dynamically import the Scene component to avoid SSR issues
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [depthMapSrc, setDepthMapSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [displacementScale, setDisplacementScale] = useState(1.5);
  const [layerCount, setLayerCount] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setDepthMapSrc(null);
    setIsProcessing(true);

    try {
      // Generate depth map
      const depthUrl = await DepthEstimator.estimateDepth(url);
      setDepthMapSrc(depthUrl);
    } catch (error) {
      console.error('Error generating depth map:', error);
      alert('Failed to generate depth map. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen p-8 flex flex-col items-center gap-8 max-w-7xl mx-auto">
      <header className="w-full flex flex-col items-center gap-4 mb-8">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-center">
          3D Depth Visualizer
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl text-center">
          Upload an image to generate a depth map and view it in 3D. 
          Powered by AI depth estimation.
        </p>
      </header>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Left Column: Controls & Preview */}
        <div className="flex flex-col gap-6 lg:col-span-1 h-full">
          
          {/* Upload Section */}
          <div 
            className={clsx(
              "flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer group",
              imageSrc ? "border-gray-600 bg-gray-900/50" : "border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            {imageSrc ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
                <img src={imageSrc} alt="Original" className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                  Click to Change Image
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-blue-400" />
                </div>
                <p className="text-lg font-medium text-gray-300">Upload Image</p>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG, WebP</p>
                <div className="flex flex-col gap-2 mt-4 z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageSrc('/sample.jpg');
                      setDepthMapSrc(null);
                      setIsProcessing(true);
                      DepthEstimator.estimateDepth('/sample.jpg')
                        .then(setDepthMapSrc)
                        .catch(err => {
                          console.error(err);
                          alert('Error: ' + err.message);
                        })
                        .finally(() => setIsProcessing(false));
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-blue-400 transition-colors"
                  >
                    Use Sample Image (Generate Depth)
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageSrc('/sample.jpg');
                      setDepthMapSrc('/image.webp');
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-green-400 transition-colors"
                  >
                    Use image.webp as Depth Map
                  </button>

                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageSrc('/image.webp');
                      setDepthMapSrc(null);
                      setIsProcessing(true);
                       DepthEstimator.estimateDepth('/image.webp')
                        .then(setDepthMapSrc)
                        .catch(err => {
                          console.error(err);
                          alert('Error: ' + err.message);
                        })
                        .finally(() => setIsProcessing(false));
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-purple-400 transition-colors"
                  >
                    Use image.webp as Source (Generate Depth)
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Depth Map Preview */}
          <div className="flex-1 bg-gray-900/50 rounded-2xl border border-white/10 p-4 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              Depth Map
            </div>
            
            <div className="flex-1 flex items-center justify-center bg-black/40 rounded-lg overflow-hidden relative">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <span className="text-sm text-purple-400 animate-pulse">Generating Depth...</span>
                </div>
              ) : depthMapSrc ? (
                <img src={depthMapSrc} alt="Depth Map" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-gray-600 text-sm text-center px-4">
                  Depth map will appear here after upload
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900/50 rounded-2xl border border-white/10 p-6 space-y-6">
             <div>
               <label className="flex items-center justify-between mb-4">
                  <span className="text-gray-300 font-medium flex items-center gap-2">
                    <Box className="w-4 h-4 text-pink-400" />
                    Displacement Scale
                  </span>
                  <span className="text-pink-400 font-mono">{displacementScale.toFixed(1)}</span>
               </label>
               <input 
                 type="range" 
                 min="0" 
                 max="5" 
                 step="0.1" 
                 value={displacementScale} 
                 onChange={(e) => setDisplacementScale(parseFloat(e.target.value))}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
               />
             </div>

             <div>
               <label className="flex items-center justify-between mb-4">
                  <span className="text-gray-300 font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Layer Count
                  </span>
                  <span className="text-blue-400 font-mono">{layerCount}</span>
               </label>
               <input 
                 type="range" 
                 min="3" 
                 max="20" 
                 step="1" 
                 value={layerCount} 
                 onChange={(e) => setLayerCount(parseInt(e.target.value))}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
               />
             </div>
          </div>

        </div>

        {/* Right Column: 3D Scene */}
        <div className="lg:col-span-2 h-full relative">
           {imageSrc && depthMapSrc ? (
             <Scene 
               imageSrc={imageSrc} 
               depthMapSrc={depthMapSrc} 
               displacementScale={displacementScale}
               layerCount={layerCount}
             />
           ) : (
             <div className="w-full h-full bg-gray-900/30 rounded-xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-600 gap-4">
               <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center">
                 <ImageIcon className="w-10 h-10 opacity-50" />
               </div>
               <p>3D Preview will be available after processing</p>
             </div>
           )}
        </div>
      </div>
    </main>
  );
}
