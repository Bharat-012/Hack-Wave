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
    });

    // Clean OpenStreetMap tiles
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
          <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: white;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; max-width: 240px; padding: 2px;">
          <img src="${report.image_url}" alt="${report.title}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${color}; margin-bottom: 2px;">
            ${report.category.replace('_', ' ')}
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; line-height: 1.2;">${report.title}</h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #4b5563; line-height: 1.3;">${report.address}</p>
          <a href="/reports/${report.id}" style="display: block; text-align: center; background-color: #1B3B2B; color: white; padding: 5px 8px; border-radius: 6px; text-decoration: none; font-size: 11px; font-weight: 600;">View Details & Quests</a>
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
            <div style="background-color: #EF4444; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 6px 12px rgba(239, 68, 68, 0.4); display: flex; align-items: center; justify-content: center; animation: bounce 1s infinite alternate;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background-color: white;"></div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
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
    <div className="relative w-full rounded-2xl overflow-hidden border border-cream-300 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      {interactiveSelect && (
        <div className="absolute top-3 left-3 z-1000 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 shadow-sm pointer-events-none">
          📍 {t('report_flow.location_prompt')}
        </div>
      )}
    </div>
  );
};
