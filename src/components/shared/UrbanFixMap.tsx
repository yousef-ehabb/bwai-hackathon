'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Report } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster'), { ssr: false });

// Import markercluster styles
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface UrbanFixMapProps {
  reports: Report[];
  center?: [number, number];
}

// Custom Heatmap Component
function HeatmapLayer({ reports }: { reports: Report[] }) {
  const [L, setL] = useState<any>(null);
  const { useMap } = require('react-leaflet');
  const map = useMap();

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      // @ts-ignore
      import('leaflet.heat');
      setL(leaflet);
    });
  }, []);

  useEffect(() => {
    if (!map || !reports.length || !L || !L.heatLayer) return;

    const points = reports.map(r => [r.gps.lat, r.gps.lng, 0.5]);
    const heat = L.heatLayer(points, {
      radius: 20,
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, reports, L]);

  return null;
}

export default function UrbanFixMap({ reports, center = [30.0626, 31.2497] }: UrbanFixMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const setupLeaflet = async () => {
      const L = await import('leaflet');
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      });
      setMounted(true);
    };
    setupLeaflet();
  }, []);

  if (!mounted) {
    return (
      <Card className="h-[400px] bg-[#1e293b]/50 border-[#334155] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="h-[400px] overflow-hidden border-[#334155] bg-[#0f172a] relative z-0">
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Real Heatmap Layer */}
          <HeatmapLayer reports={reports} />

          {/* Clustered Markers */}
          <MarkerClusterGroup chunkedLoading>
            {reports.map((report) => (
              <Marker 
                key={report.id} 
                position={[report.gps.lat, report.gps.lng]}
              >
                <Popup>
                  <div className="p-1 min-w-[150px]">
                    <p className="font-bold text-slate-900">{report.category}</p>
                    <p className="text-[10px] text-slate-500 mb-2">{report.address}</p>
                    <div className="flex flex-wrap gap-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        report.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        report.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {report.status}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        report.urgency === 'High' ? 'bg-red-100 text-red-700' :
                        report.urgency === 'Medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {report.urgency}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </Card>
    </div>
  );
}
