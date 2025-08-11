// This file contains a utility function to load the Google Maps API
// via a script tag and initialize it for use in your app

let isLoading = false;
let isLoaded = false;
let loadPromise: Promise<void> | null = null;

// Add type definition for the global window object
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export const loadGoogleMapsApi = () => {
  if (isLoaded) {
    return Promise.resolve();
  }
  
  if (loadPromise) {
    return loadPromise;
  }
  
  isLoading = true;
  loadPromise = new Promise<void>((resolve, reject) => {
    try {
      // Check if already loaded
      if (window.google?.maps) {
        isLoaded = true;
        isLoading = false;
        resolve();
        return;
      }

      // Create callback function
      window.initMap = () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      };
      
      // Check if script already exists
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        // Script exists but not loaded yet, just wait for callback
        return;
      }

      // Add script to the document
      const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        isLoading = false;
        loadPromise = null;
        reject(new Error('Google Maps failed to load'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      isLoading = false;
      loadPromise = null;
      reject(error);
    }
  });

  return loadPromise;
};

export const isGoogleMapsLoaded = () => isLoaded;
export const isGoogleMapsLoading = () => isLoading;
