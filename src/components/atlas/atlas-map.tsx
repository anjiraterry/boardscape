"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ABUJA_CENTER } from "@/modules/geospatial/abuja";
import { getPublicEnv } from "@/lib/env";
import type { PublicFaceListing } from "@/modules/inventory/schemas";

interface AtlasMapProps {
  faces: PublicFaceListing[];
  selectedFaceId: string | null;
  onSelectFace: (faceId: string) => void;
}

export function AtlasMap({ faces, selectedFaceId, onSelectFace }: AtlasMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const { mapStyleUrl } = getPublicEnv();

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyleUrl,
      center: [ABUJA_CENTER.longitude, ABUJA_CENTER.latitude],
      zoom: 11.5,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    faces.forEach((face) => {
      const el = document.createElement("button");
      el.type = "button";
      el.ariaLabel = `${face.label} — ${face.district}`;
      el.className = `h-4 w-4 rounded-full border-2 shadow transition-transform ${
        selectedFaceId === face.faceId
          ? "scale-125 border-charcoal bg-limebrand"
          : "border-white bg-charcoal hover:scale-110"
      }`;
      el.addEventListener("click", () => {
        onSelectFace(face.faceId);
        map.flyTo({ center: [face.longitude, face.latitude], zoom: 14 });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([face.longitude, face.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [faces, selectedFaceId, onSelectFace]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full rounded-2xl bg-secondary lg:h-[calc(100vh-13rem)]"
      aria-label="Abuja billboard inventory map"
    />
  );
}
