import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Define the interface for the TripStop
interface TripStop {
  id: string;
  city: {
    id: string;
    name: string;
    country: string;
  };
  start_date: string;
  end_date: string;
  order_index: number;
}

interface MapProps {
  tripStops: TripStop[];
  width?: string;
  height?: string;
}

const MapboxTripMap: React.FC<MapProps> = ({ tripStops, width = '100%', height = '400px' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<{ lat: number; lng: number; name: string; }[]>([]);

  // Initialize map when component mounts
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Set your Mapbox access token
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
        
        if (!mapboxgl.accessToken) {
          throw new Error('Mapbox access token is required');
        }

        if (map.current || !mapContainer.current) return;

        // Create a new map instance
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [0, 0], // Initial center will be updated once locations are loaded
          zoom: 1
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // When the map has loaded
        map.current.on('load', () => {
          setLoading(false);
        });
      } catch (err) {
        console.error('Error initializing Mapbox map:', err);
        setError('Failed to initialize map');
        setLoading(false);
      }
    };

    initializeMap();

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Geocode locations and add markers when tripStops change
  useEffect(() => {
    if (!map.current || tripStops.length === 0 || !mapboxgl.accessToken) return;

    const geocodeLocations = async () => {
      try {
        // Remove any existing markers
        document.querySelectorAll('.mapboxgl-marker').forEach(el => el.remove());
        
        const geocodedLocations: { lat: number; lng: number; name: string; }[] = [];

        for (const [index, stop] of tripStops.entries()) {
          const address = `${stop.city.name}, ${stop.city.country}`;
          try {
            // Geocode using Mapbox Geocoding API
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
            );
            
            if (!response.ok) {
              throw new Error(`Geocoding failed for ${address}`);
            }
            
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center;
              
              // Create a custom marker element
              const markerEl = document.createElement('div');
              markerEl.className = 'flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold border-2 border-white';
              markerEl.textContent = (index + 1).toString();
              markerEl.style.width = '30px';
              markerEl.style.height = '30px';
              markerEl.style.borderRadius = '50%';
              markerEl.style.backgroundColor = '#3b82f6';
              markerEl.style.color = 'white';
              markerEl.style.display = 'flex';
              markerEl.style.alignItems = 'center';
              markerEl.style.justifyContent = 'center';
              markerEl.style.fontWeight = 'bold';
              markerEl.style.border = '2px solid white';
              markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              
              // Add marker to map
              new mapboxgl.Marker(markerEl)
                .setLngLat([lng, lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${stop.city.name}, ${stop.city.country}</h3>`))
                .addTo(map.current!);
              
              geocodedLocations.push({ lat, lng, name: address });
            }
          } catch (err) {
            console.error(`Error geocoding ${address}:`, err);
          }
        }
        
        setLocations(geocodedLocations);
        
        // Add route line if we have at least 2 locations
        if (geocodedLocations.length >= 2 && map.current && map.current.loaded()) {
          // Create a GeoJSON route
          const route = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geocodedLocations.map(loc => [loc.lng, loc.lat])
            }
          };
          
          // Add route source if it doesn't exist
          if (!map.current.getSource('route')) {
            map.current.addSource('route', {
              type: 'geojson',
              data: route as any
            });
            
            // Add route layer
            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#4285F4',
                'line-width': 4,
                'line-opacity': 0.8
              }
            });
          } else {
            // Update existing route
            (map.current.getSource('route') as mapboxgl.GeoJSONSource).setData(route as any);
          }
          
          // Fit map to show all locations
          const bounds = new mapboxgl.LngLatBounds();
          geocodedLocations.forEach(loc => {
            bounds.extend([loc.lng, loc.lat]);
          });
          
          map.current.fitBounds(bounds, { padding: 50 });
        } else if (geocodedLocations.length === 1 && map.current) {
          // If only one location, center on it
          map.current.flyTo({
            center: [geocodedLocations[0].lng, geocodedLocations[0].lat],
            zoom: 10
          });
        }
      } catch (err) {
        console.error('Error adding locations to map:', err);
        setError('Failed to display trip locations');
      }
    };
    
    if (map.current.loaded()) {
      geocodeLocations();
    } else {
      map.current.on('load', geocodeLocations);
    }
  }, [tripStops]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ width, height }}>
        <div className="text-center p-4">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-600 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width, height }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }} />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxTripMap;
