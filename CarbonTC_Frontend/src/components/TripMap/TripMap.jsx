import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './TripMap.module.css';

// Fix for default markers in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TripMap = ({ 
  routeCoordinates = [],
  startLocation = { name: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  endLocation = { name: 'Hải Phòng', lat: 20.8449, lng: 106.6881 },
  height = '400px'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapRef.current).setView([21.0285, 105.8542], 10);
      
      // Add tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Use provided coordinates or create a simple route
      const coordinates = routeCoordinates.length > 0 
        ? routeCoordinates 
        : [
            [startLocation.lat, startLocation.lng],
            [endLocation.lat, endLocation.lng]
          ];

      // Add route to map
      const route = L.polyline(coordinates, {
        color: '#667eea',
        weight: 4,
        opacity: 0.7
      }).addTo(map);

      // Add markers for start and end points
      const startMarker = L.marker([startLocation.lat, startLocation.lng]).addTo(map)
        .bindPopup(`Điểm bắt đầu: ${startLocation.name}`);

      const endMarker = L.marker([endLocation.lat, endLocation.lng]).addTo(map)
        .bindPopup(`Điểm kết thúc: ${endLocation.name}`);

      // Fit map to route
      map.fitBounds(route.getBounds());
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routeCoordinates, startLocation, endLocation]);

  return (
    <div className={styles.mapContainer} style={{ height }}>
      <div ref={mapRef} className={styles.map} />
    </div>
  );
};

export default TripMap;