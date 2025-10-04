import React, { useRef, useEffect, useState } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import "./Map.css";

const MapComponent = () => {
  const ref = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    if (!ref.current || mapInstance) return;

    // Wait for the DOM to fully render
    setTimeout(() => {
      console.log(
        "Creating map, ref dimensions:",
        ref.current?.offsetWidth,
        ref.current?.offsetHeight
      );

      if (ref.current) {
        const map = new window.google.maps.Map(ref.current, {
          center: { lat: 40.7128, lng: -74.006 },
          zoom: 12,
        });

        setMapInstance(map);
      }
    }, 100);
  }, [mapInstance]);

  return (
    <div
      ref={ref}
      style={{ width: "100%", height: "100%", minHeight: "400px" }}
    />
  );
};

const render = (status) => {
  console.log("Map status:", status);
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading Map...</div>;
    case Status.FAILURE:
      return <div className="map-error">Error loading map</div>;
    case Status.SUCCESS:
      return <MapComponent />;
    default:
      return null;
  }
};

export default function Map() {
  return (
    <div className="map-container">
      <Wrapper
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        render={render}
        libraries={["places"]}
      />
    </div>
  );
}
