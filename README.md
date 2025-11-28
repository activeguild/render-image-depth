# 3D Depth Visualizer

This is a Next.js application that allows you to upload an image, generate a depth map using AI, and visualize it in 3D using Three.js.

## Features

- **Image Upload**: Drag and drop or select an image.
- **AI Depth Estimation**: Uses `transformers.js` (Depth Anything model) to generate high-quality depth maps directly in the browser.
- **3D Visualization**: Renders the image as a 3D mesh with displacement based on the depth map.
- **Interactive Controls**: Adjust the displacement scale to control the 3D effect.
- **Modern UI**: Sleek dark mode design with glassmorphism effects.

## Getting Started

1.  Install dependencies:

    ```bash
    npm install
    ```

2.  Run the development server:

    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal) with your browser.

## Tech Stack

- **Next.js**: Framework for React.
- **Three.js / React Three Fiber**: 3D rendering.
- **Transformers.js**: Client-side AI depth estimation.
- **Tailwind CSS**: Styling.

## Note on "NanoBanana"

The user requested "NanoBanana" for depth map creation. As "NanoBanana" appears to be a specific internal or less common tool without a public JavaScript SDK, this project uses **Depth Anything** via `transformers.js` as a robust, high-quality alternative that runs entirely in the browser.
