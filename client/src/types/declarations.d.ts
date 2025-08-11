// This file is for type declarations of assets
declare module "*.png" {
  const value: any;
  export default value;
}

declare module "*.jpg" {
  const value: any;
  export default value;
}

declare module "*.svg" {
  const value: any;
  export default value;
}

// Google Maps types
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}