# 3D Depth Visualizer

A Next.js application that transforms 2D images into interactive 3D visualizations using AI-powered depth estimation. Upload an image, generate a depth map, and explore it in a beautiful 3D layered representation.

## Features

- **Image Upload**: Drag and drop or select an image from your device
- **AI Depth Estimation**: Uses `transformers.js` (Depth Anything model) to generate high-quality depth maps directly in the browser—no server required
- **Layered 3D Visualization**: Automatically splits the image into depth-based layers for a stunning parallax effect
- **Interactive Controls**:
  - Adjust displacement scale (0-5) to control the 3D depth intensity
  - Modify layer count (2-20) to fine-tune the depth separation
  - Orbit, zoom, and pan around the 3D scene with mouse controls
- **Real-time Preview**: See changes instantly as you adjust parameters
- **Modern UI**: Sleek dark mode design with glassmorphism effects and compact sidebar
- **Sample Images**: Includes example images to get started quickly

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Modern web browser with WebGL support

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd render-image-depth
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:

    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) with your browser.

### Usage

1. **Upload an Image**: Click the upload area or drag and drop an image file (JPG, PNG, WebP)
2. **Wait for Processing**: The AI model will automatically generate a depth map (this may take a few moments on first load as the model downloads)
3. **Explore in 3D**: Once processing is complete, interact with the 3D visualization:
   - **Left Click + Drag**: Rotate the view
   - **Right Click + Drag**: Pan the view
   - **Scroll**: Zoom in/out
4. **Adjust Parameters**: Use the sidebar controls to modify the scale and layer count for different effects

## Tech Stack

- **Next.js 15**: React framework with App Router
- **React Three Fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for React Three Fiber
- **Three.js**: 3D graphics library
- **Transformers.js**: Client-side AI inference (Depth Anything model)
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development

## How It Works

1. **Image Processing**: When you upload an image, it's loaded into the browser
2. **Depth Estimation**: The Depth Anything model analyzes the image and generates a grayscale depth map where brighter pixels represent closer objects
3. **Layer Separation**: The depth map is divided into layers based on depth ranges (configurable via layer count)
4. **3D Rendering**: Each layer is rendered as a separate transparent plane positioned at different Z-coordinates, creating a parallax effect
5. **Interactive Display**: React Three Fiber handles the 3D scene with orbit controls for user interaction

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main application page with UI
│   └── layout.tsx         # Root layout
├── components/
│   └── Scene.tsx          # 3D scene component with layered rendering
├── utils/
│   └── depth.ts           # Depth estimation using transformers.js
└── types/
    └── three.d.ts         # TypeScript definitions for Three.js
```

## Performance Tips

- The AI model (~400MB) downloads on first use and is cached by the browser
- Fewer layers (3-8) render faster but with less depth detail
- Higher layer counts (15-20) provide smoother depth transitions but may impact performance
- The canvas is optimized to prevent unnecessary resizing and re-rendering

## Troubleshooting

### Model Loading Issues
- Ensure you have a stable internet connection for the initial model download
- Check browser console for any CORS or network errors

### Canvas Display Issues
- If the 3D preview appears too large or overflows, try refreshing the page
- The canvas sizing has been optimized to respect parent container dimensions

### Performance Issues
- Reduce the layer count for better performance
- Close other browser tabs to free up memory
- Use a device with dedicated GPU for best results

## License

This project is open source and available under the MIT License.

## Acknowledgments

- **Depth Anything**: State-of-the-art monocular depth estimation model
- **Transformers.js**: Enabling AI models to run in the browser
- **React Three Fiber**: Making Three.js accessible in React
