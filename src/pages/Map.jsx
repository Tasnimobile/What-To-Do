import React, { useRef, useEffect, useState } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import "./Map.css";

const MapComponent = ({ onClick, selectedCoords }) => {
  const ref = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);

  // Initialize map
  useEffect(() => {
    if (!ref.current || mapInstance) return;

    setTimeout(() => {
      if (ref.current) {
        const map = new window.google.maps.Map(ref.current, {
          center: { lat: 40.7128, lng: -74.006 },
          zoom: 12,
        });

        // Only handle clicks for temporary pin (AddDestination)
        map.addListener("click", (e) => {
          const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (onClick) onClick(latLng);
        });

        setMapInstance(map);
      }
    }, 100);
  }, [mapInstance, onClick]);

  // Update markers whenever selectedCoords changes
  useEffect(() => {
    if (!mapInstance) return;

    // Convert selectedCoords to array if not already
    const coordsArray = Array.isArray(selectedCoords)
      ? selectedCoords
      : selectedCoords
      ? [selectedCoords]
      : [];

    // Remove old markers
    markers.forEach((m) => m.setMap(null));

    // Add new markers
    const newMarkers = coordsArray.map((coord, index) => {
      const marker = new window.google.maps.Marker({
        position: coord,
        map: mapInstance,
        draggable: !Array.isArray(selectedCoords), // Only temporary pin draggable
      });

      if (!Array.isArray(selectedCoords)) {
        // Update pin coordinates when dragged
        marker.addListener("dragend", (event) => {
          const newCoords = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          };
          if (onClick) onClick(newCoords);
        });
      }

      return marker;
    });

    setMarkers(newMarkers);

    // Adjust map view
    if (coordsArray.length === 1) {
      mapInstance.setCenter(coordsArray[0]);
      mapInstance.setZoom(16);
    } else if (coordsArray.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      coordsArray.forEach((c) => bounds.extend(c));
      mapInstance.fitBounds(bounds);
    }
  }, [selectedCoords, mapInstance]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "400px",
        borderRadius: "8px",
      }}
    />
  );
};

const render = (status) => {
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading Map...</div>;
    case Status.FAILURE:
      return <div className="map-error">Error loading map</div>;
    case Status.SUCCESS:
      return null;
    default:
      return null;
  }
};

export default function Map({ onClick, selectedCoords }) {
  return (
    <div className="map-container">
      <Wrapper
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        render={render}
        libraries={["places"]}
      >
        <MapComponent onClick={onClick} selectedCoords={selectedCoords} />
      </Wrapper>
    </div>
  );
}
