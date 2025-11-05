import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MapPin } from 'lucide-react';

interface School {
  id: string;
  nat_emis: string;
  institution_name: string;
  province: string;
  district: string;
  longitude: number;
  latitude: number;
  learners_2024: number;
  educators_2024: number;
  quintile: string;
}

interface SchoolMapProps {
  schools: School[];
}

const SchoolMap = ({ schools }: SchoolMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenEntered, setTokenEntered] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !tokenEntered || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Calculate bounds for all schools
    const bounds = new mapboxgl.LngLatBounds();
    schools.forEach(school => {
      if (school.longitude && school.latitude) {
        bounds.extend([school.longitude, school.latitude]);
      }
    });

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      bounds: bounds,
      fitBoundsOptions: { padding: 50 }
    });

    // Add markers for each school
    schools.forEach(school => {
      if (!school.longitude || !school.latitude) return;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px;">${school.institution_name}</h3>
          <p style="font-size: 12px; margin-bottom: 2px;">District: ${school.district}</p>
          <p style="font-size: 12px; margin-bottom: 2px;">Learners: ${school.learners_2024}</p>
          <p style="font-size: 12px;">Quintile: ${school.quintile}</p>
        </div>
      `);

      new mapboxgl.Marker({ color: '#6366f1' })
        .setLngLat([school.longitude, school.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [schools, tokenEntered, mapboxToken]);

  if (!tokenEntered) {
    return (
      <div className="p-6 bg-card rounded-lg border">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Map Configuration</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your Mapbox public token to view schools on the map. Get your token at{' '}
          <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            mapbox.com
          </a>
        </p>
        <div className="flex gap-2">
          <Input
            type="password"
            placeholder="pk.eyJ1Ijoi..."
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <Button onClick={() => setTokenEntered(true)} disabled={!mapboxToken}>
            Load Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default SchoolMap;