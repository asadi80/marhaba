"use client";

import { useEffect, useState } from "react";
import { useMap, Marker } from "react-leaflet";

export function MapController({ onLocationSelect, initialCenter, markerPosition }) {
  const map = useMap();
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!map) return;
    setIsMapReady(true);
    if (initialCenter?.lat && initialCenter?.lng) {
      map.setView([initialCenter.lat, initialCenter.lng], markerPosition ? 14 : 2);
    }
  }, [map]);

  useEffect(() => {
    if (!map || !isMapReady) return;
    const handleMoveEnd = () => {
      const { lat, lng } = map.getCenter();
      onLocationSelect(lat, lng);
    };
    map.on("moveend", handleMoveEnd);
    setTimeout(() => {
      const { lat, lng } = map.getCenter();
      onLocationSelect(lat, lng);
    }, 100);
    return () => map.off("moveend", handleMoveEnd);
  }, [map, isMapReady, onLocationSelect]);

  return null;
}

export function FixedCenterMarker({ icon }) {
  const map = useMap();
  const [position, setPosition] = useState([0, 0]);

  useEffect(() => {
    if (!map) return;
    const update = () => {
      const { lat, lng } = map.getCenter();
      setPosition([lat, lng]);
    };
    map.on("move", update);
    update();
    return () => map.off("move", update);
  }, [map]);

  if (!icon) return null;
  return <Marker position={position} icon={icon} interactive={false} />;
}