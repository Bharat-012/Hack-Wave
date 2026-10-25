import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { Report } from '../../types/index.js';

interface CityMapProps {
  reports?: Report[];
  selectedLocation?: { lat: number; lng: number } | null;
  onSelectLocation?: (lat: number, lng: number) => void;
  interactiveSelect?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  onReportClick?: (report: Report) => void;
}

export const CityMap: React.FC<CityMapProps> = ({
  reports = [],
  selectedLocation,
  onSelectLocation,
  interactiveSelect = false,
  center = [28.6448, 77.2167], // Default to Delhi civic center
  zoom = 13,
  height = '500px',
  onReportClick,
}) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const selectMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    // CartoDB / OSM clean basemap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Click handler for location selection
    if (interactiveSelect && onSelectLocation) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onSelectLocation(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update reports markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    reports.forEach((report) => {
      const getCategoryColor = (cat: string) => {
        switch (cat) {
          case 'roads_potholes':
            return '#D97706'; // Amber
          case 'streetlights_electricity':
            return '#EAB308'; // Yellow
          case 'sanitation_garbage':
            return '#059669'; // Emerald
          case 'water_drainage':
            return '#2563EB'; // Blue
          default:
            return '#4B5563'; // Slate
        }
      };

      const color = getCategoryColor(report.category);

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 6px 14px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background-color: white;"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; width: 260px; overflow: hidden; border-radius: 14px;">
          <div style="position: relative;">
            <img src="${report.image_url}" alt="${report.title}" style="width: 100%; height: 120px; object-fit: cover; display: block;" />
            <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
              ${report.category.replace('_', ' ')}
            </div>
          </div>
          <div style="padding: 12px 14px;">
            <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 800; color: #18181b; line-height: 1.3;">${report.title}</h4>
            <p style="margin: 0 0 10px 0; font-size: 11px; color: #71717a; line-height: 1.3;">📍 ${report.address}</p>
            <a href="/reports/${report.id}" style="display: flex; align-items: center; justify-content: center; gap: 4px; background: #1B3B2B; color: white; padding: 7px 10px; border-radius: 10px; text-decoration: none; font-size: 11px; font-weight: 700; transition: background 0.2s;">
              View Details & Quests →
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onReportClick) onReportClick(report);
      });

      marker.addTo(markersLayer);
    });
  }, [reports, onReportClick]);

  // Update selected location marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (selectedLocation) {
      if (selectMarkerRef.current) {
        selectMarkerRef.current.setLatLng([selectedLocation.lat, selectedLocation.lng]);
      } else {
        const pinIcon = L.divIcon({
          className: 'selected-pin',
          html: `
            <div style="background-color: #EF4444; width: 38px; height: 38px; border-radius: 50%; border: 3px solid white; box-shadow: 0 8px 16px rgba(239, 68, 68, 0.45); display: flex; align-items: center; justify-content: center; animation: bounce 0.8s infinite alternate;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: white;"></div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
        });

        const newMarker = L.marker([selectedLocation.lat, selectedLocation.lng], {
          icon: pinIcon,
          draggable: interactiveSelect,
        }).addTo(map);

        if (interactiveSelect && onSelectLocation) {
          newMarker.on('dragend', (e) => {
            const latlng = e.target.getLatLng();
            onSelectLocation(latlng.lat, latlng.lng);
          });
        }

        selectMarkerRef.current = newMarker;
      }

      map.panTo([selectedLocation.lat, selectedLocation.lng]);
    } else if (selectMarkerRef.current) {
      selectMarkerRef.current.remove();
      selectMarkerRef.current = null;
    }
  }, [selectedLocation, interactiveSelect, onSelectLocation]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200/80 shadow-glass" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {interactiveSelect && (
        <div className="absolute top-4 left-4 z-1000 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200 text-xs font-bold text-stone-800 shadow-md flex items-center gap-2 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>📍 {t('report_flow.location_prompt')}</span>
        </div>
      )}
      <div className="absolute bottom-4 right-4 z-1000 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 text-[11px] font-semibold text-stone-600 shadow-2xs pointer-events-none hidden sm:flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        OpenStreetMap • Leaflet GIS
      </div>
    </div>
  );
};
