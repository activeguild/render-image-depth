'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Loader2, Layers, Image as ImageIcon, Box, Download } from 'lucide-react';
import { DepthEstimator } from '@/utils/depth';
import clsx from 'clsx';
import Scene, { type SceneHandle } from '@/components/Scene';

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [depthMapSrc, setDepthMapSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [displacementScale, setDisplacementScale] = useState(1.5);
  const [layerCount, setLayerCount] = useState(5);
  const [depthTolerance, setDepthTolerance] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<SceneHandle>(null);

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
    <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 flex">
      {/* Left Sidebar - Compact */}
      <aside className="w-[280px] h-full flex flex-col border-r border-white/10 bg-black/30 backdrop-blur-sm">
        {/* Header */}
        <header className="p-3 border-b border-white/10">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            3D Depth Visualizer
          </h1>
          <p className="text-gray-400 text-[10px] mt-0.5">
            AI-powered depth estimation
          </p>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          
          {/* Upload Section */}
          <div 
            className={clsx(
              "border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-3 transition-all cursor-pointer group h-[120px]",
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
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded">
                <img src={imageSrc} alt="Original" className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium">
                  画像を変更
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-blue-400 mb-1.5" />
                <p className="text-xs font-medium text-gray-300">画像アップロード</p>
                <p className="text-[10px] text-gray-500 mt-0.5">JPG, PNG, WebP</p>
              </>
            )}
          </div>

          {/* Depth Map Preview */}
          <div className="bg-gray-900/50 rounded-lg border border-white/10 p-2">
            <div className="flex items-center gap-1.5 mb-1.5 text-gray-400 text-[10px] font-medium">
              <Layers className="w-2.5 h-2.5" />
              深度マップ
            </div>
            
            <div className="h-[100px] flex items-center justify-center bg-black/40 rounded overflow-hidden">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-1.5">
                  <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                  <span className="text-[10px] text-purple-400">生成中...</span>
                </div>
              ) : depthMapSrc ? (
                <img src={depthMapSrc} alt="Depth Map" className="max-w-full max-h-full object-contain" />
              ) : (
                // <div className="text-gray-600 text-[10px]">深度マップ</div>
                <></>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-900/50 rounded-lg border border-white/10 p-2.5 space-y-2.5">
            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-gray-300 text-[10px] font-medium flex items-center gap-1">
                  <Box className="w-2.5 h-2.5 text-pink-400" />
                  Scale
                </span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={displacementScale}
                  onChange={(e) => {
                    const num = parseFloat(e.target.value);
                    if (!isNaN(num) && num >= 0 && num <= 500) {
                      setDisplacementScale(num);
                    }
                  }}
                  className="w-12 px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-pink-400 font-mono text-[10px] text-right focus:outline-none focus:border-pink-500"
                />
              </label>
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="0.1" 
                value={displacementScale} 
                onChange={(e) => setDisplacementScale(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-gray-300 text-[10px] font-medium flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5 text-blue-400" />
                  Layers
                </span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  step="1"
                  value={layerCount}

                  onChange={(e) => {
                    const num = parseInt(e.target.value);
                    if (!isNaN(num) && num >= 2 && num <= 2000) {
                      setLayerCount(num);
                    }
                  }}
                  className="w-12 px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-blue-400 font-mono text-[10px] text-right focus:outline-none focus:border-blue-500"
                />
              </label>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={layerCount}
                onChange={(e) => setLayerCount(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center justify-between mb-1.5">
                <span className="text-gray-300 text-[10px] font-medium flex items-center gap-1">
                  <Box className="w-2.5 h-2.5 text-purple-400" />
                  Tolerance
                </span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="1"
                  value={depthTolerance}
                  onChange={(e) => {
                    const num = parseFloat(e.target.value);
                    if (!isNaN(num) && num >= 0 && num <= 5000) {
                      setDepthTolerance(num);
                    }
                  }}
                  className="w-12 px-1 py-0.5 bg-gray-800 border border-gray-700 rounded text-purple-400 font-mono text-[10px] text-right focus:outline-none focus:border-purple-500"
                />
              </label>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={depthTolerance}
                onChange={(e) => setDepthTolerance(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>

          {/* Download GLB Button */}
          {imageSrc && depthMapSrc && (
            <button
              onClick={() => {
                console.log('Button clicked, sceneRef:', sceneRef.current);
                if (!sceneRef.current) {
                  alert('Scene is not ready yet. Please wait a moment and try again.');
                  return;
                }
                sceneRef.current.exportGLB();
              }}
              className="w-full px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-xs font-medium text-white transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              GLBダウンロード
            </button>
          )}

          {/* Sample Buttons */}
          {!imageSrc && (
            <div className="space-y-1.5">
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
                className="w-full px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-[10px] text-blue-400 transition-colors"
              >
                サンプル画像
              </button>

              {/* <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageSrc('/sample.jpg');
                  setDepthMapSrc('/image.webp');
                }}
                className="w-full px-2.5 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-[10px] text-green-400 transition-colors"
              >
                深度マップ使用
              </button> */}
            </div>
          )}

        </div>
      </aside>

      {/* Main Content - 3D Preview */}
      <main className="flex-1 h-full p-4 flex items-center justify-center overflow-hidden">
        {imageSrc && depthMapSrc ? (
          <div className="w-full h-full">
            <Scene
              ref={sceneRef}
              imageSrc={imageSrc}
              depthMapSrc={depthMapSrc}
              displacementScale={displacementScale}
              layerCount={layerCount}
              depthTolerance={depthTolerance}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-600 gap-3">
            <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center">
              <ImageIcon className="w-10 h-10 opacity-50" />
            </div>
            <p className="text-base">3Dプレビュー</p>
            <p className="text-xs text-gray-500">画像をアップロードしてください</p>
          </div>
        )}
      </main>
    </main>
  );
}
