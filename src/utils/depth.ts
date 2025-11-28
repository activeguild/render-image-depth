import { pipeline, env } from "@xenova/transformers";

// Skip local model check since we are running in the browser
env.allowLocalModels = false;
env.useBrowserCache = true;

export class DepthEstimator {
  static instance: any = null;

  static async getInstance() {
    if (!this.instance) {
      // Using Depth Anything Small for better performance in browser
      this.instance = await pipeline(
        "depth-estimation",
        "Xenova/depth-anything-small-hf"
      );
    }
    return this.instance;
  }

  static async estimateDepth(imageSrc: string): Promise<string> {
    const estimator = await this.getInstance();
    const result = await estimator(imageSrc);
    
    if (result && result.depth) {
        const canvas = result.depth.toCanvas();
        
        // Handle standard HTMLCanvasElement
        if (typeof canvas.toDataURL === 'function') {
            return canvas.toDataURL();
        } 
        
        // Handle OffscreenCanvas
        if (typeof canvas.convertToBlob === 'function') {
             const blob = await canvas.convertToBlob();
             return URL.createObjectURL(blob);
        }
    }
    
    return '';
  }
}
