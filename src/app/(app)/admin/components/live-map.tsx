
"use client";

import * as React from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AdminUser } from "@/lib/supabase-admin-functions";
import { cn } from "@/lib/utils";
import { statuses } from "../data/data";
import { createRoot } from "react-dom/client";

// Mock function to generate random coordinates around Metro Manila
const getRandomCoordinates = (city: string) => {
  const cityCoords: { [key: string]: { lat: number; lng: number } } = {
    "Manila": { lat: 14.5995, lng: 120.9842 },
    "Quezon City": { lat: 14.676, lng: 121.0437 },
    "Makati": { lat: 14.5547, lng: 121.0244 },
    "Taguig": { lat: 14.5176, lng: 121.0509 },
    "Pasig": { lat: 14.5764, lng: 121.0851 },
    "Pasay": { lat: 14.5378, lng: 121.0014 },
    "Mandaluyong": { lat: 14.5794, lng: 121.0359 },
  };
  const base = cityCoords[city] || cityCoords["Manila"];
  return {
    lng: base.lng + (Math.random() - 0.5) * 0.1,
    lat: base.lat + (Math.random() - 0.5) * 0.1,
  };
};

const TricycleIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-8 w-8", className)}
      style={{
        filter: 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5))'
      }}
    >
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M12 18h-3" stroke="white" strokeWidth="1.5" />
      <path d="M18 15l-4-4h-4l-2 6" />
      <path d="M12 4h4" />
      <path d="m14 4-2 4" />
      <path d="M14 9H8" />
    </svg>
  );

const RiderPopup = ({ rider }: { rider: AdminUser & { lat: number; lng: number; } }) => (
    <div className="p-1">
        <h3 className="font-bold text-foreground">{rider.name}</h3>
        <p className="text-muted-foreground text-xs">{rider.toda} - {rider.bodyNumber}</p>
        <p className={cn("text-xs font-medium capitalize", statuses.find(s=>s.value === rider.status)?.color)}>
          {rider.status}
        </p>
    </div>
)


export function LiveMap() {
    const mapContainer = React.useRef<HTMLDivElement | null>(null);
    const map = React.useRef<mapboxgl.Map | null>(null);
    const [riders, setRiders] = React.useState<(AdminUser & { lat: number; lng: number; })[]>([]);
    const markersRef = React.useRef<mapboxgl.Marker[]>([]);

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    React.useEffect(() => {
        // Mock data for now - in production this would come from Supabase
        const allRiders: AdminUser[] = [];
        const ridersWithCords = allRiders.map(rider => ({
            ...rider,
            ...getRandomCoordinates(rider.city || 'Manila'),
        }));
        setRiders(ridersWithCords);
    }, []);

    React.useEffect(() => {
        if (map.current || !mapContainer.current) return;
        
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [121.0244, 14.5547],
            zoom: 11
        });
    }, []);

     React.useEffect(() => {
        if (!map.current || !riders.length || markersRef.current.length > 0) return;

        const newMarkers: mapboxgl.Marker[] = [];
        riders.forEach(rider => {
            const status = statuses.find(s => s.value === rider.status);

            const el = document.createElement('div');
            const root = createRoot(el);
            root.render(<TricycleIcon className={cn("text-primary cursor-pointer", status?.color)} />);

            const popupNode = document.createElement('div');
            const popupRoot = createRoot(popupNode);
            popupRoot.render(<RiderPopup rider={rider} />);

            const marker = new mapboxgl.Marker(el)
                .setLngLat([rider.lng, rider.lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupNode))
                .addTo(map.current!);
            
            newMarkers.push(marker);
        });

        markersRef.current = newMarkers;

    }, [riders]);
  
    return <div ref={mapContainer} className="absolute inset-0 w-full h-full" />;
}
