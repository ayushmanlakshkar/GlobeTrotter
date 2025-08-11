import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMapsApi } from '../utils/google-maps-loader';

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

const TripMap: React.FC<MapProps> = ({ tripStops, width = '100%', height = '400px' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize the map
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;
      
      try {
        // Load Google Maps API using our utility
        await loadGoogleMapsApi();
        
        // Create the map
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.416775, lng: -3.703790 }, // Madrid as default center
          zoom: 5,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: true
        });

        // Create a DirectionsRenderer
        const renderer = new google.maps.DirectionsRenderer({
          suppressMarkers: true, // We'll add our own markers
          polylineOptions: {
            strokeColor: '#4285F4',
            strokeWeight: 5
          }
        });
        
        renderer.setMap(mapInstance);
        
        setMap(mapInstance);
        setDirectionsRenderer(renderer);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
        setLoading(false);
      }
    };

    initMap();

    // Cleanup function
    return () => {
      // Clear all markers
      markers.forEach(marker => marker.setMap(null));
      setMarkers([]);
      
      // Clear directions
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, []);

  // Handle trip stops changes - geocode and add markers, calculate routes
  useEffect(() => {
    if (!map || !directionsRenderer || tripStops.length === 0 || !window.google) return;

    const geocodeAndAddMarkers = async () => {
      try {
        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);

        const geocoder = new google.maps.Geocoder();
        const locations: google.maps.LatLngLiteral[] = [];
        const newMarkers: google.maps.Marker[] = [];

        // Geocode each city and create markers
        for (const [index, stop] of tripStops.entries()) {
          const address = `${stop.city.name}, ${stop.city.country}`;
          
          try {
            const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              geocoder.geocode({ address }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
                  resolve(results);
                } else {
                  reject(new Error(`Geocoding failed for ${address}: ${status}`));
                }
              });
            });

            if (result[0].geometry.location) {
              const position = {
                lat: result[0].geometry.location.lat(),
                lng: result[0].geometry.location.lng()
              };
              
              locations.push(position);
              
              // Create a marker for each location
              const marker = new google.maps.Marker({
                position,
                map,
                label: {
                  text: (index + 1).toString(),
                  color: 'white'
                },
                title: `${stop.city.name}, ${stop.city.country}`
              });
              
              newMarkers.push(marker);
            }
          } catch (err) {
            console.error(`Error geocoding ${address}:`, err);
          }
        }

        setMarkers(newMarkers);

        // If we have at least 2 locations, calculate and display the route
        if (locations.length >= 2) {
          const directionsService = new google.maps.DirectionsService();
          
          const origin = locations[0];
          const destination = locations[locations.length - 1];
          
          // Create waypoints (excluding origin and destination)
          const waypoints = locations.slice(1, -1).map(location => ({
            location: new google.maps.LatLng(location.lat, location.lng),
            stopover: true
          }));

          directionsService.route(
            {
              origin: new google.maps.LatLng(origin.lat, origin.lng),
              destination: new google.maps.LatLng(destination.lat, destination.lng),
              waypoints: waypoints,
              travelMode: google.maps.TravelMode.DRIVING,
              optimizeWaypoints: false
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                directionsRenderer.setDirections(result);
                
                // Fit map bounds to show all locations
                if (map && result.routes && result.routes.length > 0) {
                  const bounds = new google.maps.LatLngBounds();
                  // Add all route points to the bounds
                  const route = result.routes[0];
                  const path = route.overview_path;
                  path.forEach(point => bounds.extend(point));
                  map.fitBounds(bounds);
                }
              } else {
                console.error(`Directions request failed: ${status}`);
                setError('Failed to calculate route directions');
              }
            }
          );
        } else if (locations.length === 1) {
          // If there's only one location, center the map on it
          map.setCenter(locations[0]);
          map.setZoom(10);
        }
      } catch (err) {
        console.error('Error handling trip stops:', err);
        setError('Failed to display trip locations');
      }
    };

    geocodeAndAddMarkers();
  }, [map, directionsRenderer, tripStops]);

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
      <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }} />
      
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

export default TripMap;
