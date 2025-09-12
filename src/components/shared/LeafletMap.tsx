"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

interface LeafletMapProps {
  lat: number;
  lng: number;
  location: string;
}

const LeafletMap = ({ lat, lng, location }: LeafletMapProps) => {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/shared/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  return <Map lat={lat} lng={lng} location={location} />;
};

export default LeafletMap;
