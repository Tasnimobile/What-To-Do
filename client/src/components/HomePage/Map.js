import React from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import "./Map.css";

const render = (status, destinations, selectedCoords, onClick) => {
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading Map...</div>;
    case Status.FAILURE:
      return <div className="map-error">Error loading map</div>;
    case Status.SUCCESS:
      return (
        <MapComponent
          destinations={destinations}
          selectedCoords={selectedCoords}
          onClick={onClick}
        />
      );
    default:
      return null;
  }
};

function Map({ destinations = [], selectedCoords, onClick }) {
  return (
    <div className="map-container">
      <Wrapper
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        render={(status) => render(status, destinations, selectedCoords)}
        libraries={["places"]}
      >
        <MapComponent
          destinations={destinations}
          selectedCoords={selectedCoords}
          onClick={onClick}
        />
      </Wrapper>
    </div>
  );
}

// The actual map component that gets rendered after loading
const MapComponent = ({ destinations, selectedCoords, onClick }) => {
  const ref = React.useRef(null);
  const [map, setMap] = React.useState(null);
  const markersRef = React.useRef([]);

  React.useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: 40.7128, lng: -74.006 }, // New York City coordinates
        zoom: 12,
        // Remove custom styles to use default Google Maps look
        disableDefaultUI: false, // Keep default UI
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
      });
      // Click Listener for a randomly dropped pin
      newMap.addListener("click", (e) => {
        const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        if (onClick) onClick(latLng);
      });

      setMap(newMap);

      //   // Add some sample markers for popular NYC locations
      //   const popularLocations = [
      //     { lat: 40.7829, lng: -73.9654, title: "Central Park" },
      //     { lat: 40.6892, lng: -74.0445, title: "Statue of Liberty" },
      //     { lat: 40.7589, lng: -73.9851, title: "Times Square" },
      //     { lat: 40.751, lng: -73.9943, title: "Empire State Building" },
      //     { lat: 40.7505, lng: -73.9934, title: "Madison Square Garden" },
      //   ];

      //   popularLocations.forEach((location) => {
      //     new window.google.maps.Marker({
      //       position: { lat: location.lat, lng: location.lng },
      //       map: newMap,
      //       title: location.title,
      //       // Use default Google Maps marker by not specifying custom icon
      //     });
      //   });
    }
  }, [ref, map]);

  // Update markers whenever destinations change
  React.useEffect(() => {
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    destinations.forEach((dest) => {
      if (dest.coords) {
        const marker = new window.google.maps.Marker({
          position: dest.coords,
          map,
          title: dest.name || "New Destination",
        });
        markersRef.current.push(marker);
      }
    });
  }, [map, destinations]);

  // Autofocus when selectedCoords change to center to selectedCorods
  React.useEffect(() => {
    if (!map) return;
    const coordsArray = Array.isArray(selectedCoords)
      ? selectedCoords
      : selectedCoords
      ? [selectedCoords]
      : [];

    const newMarkers = coordsArray.map((coord) => {
      const marker = new window.google.maps.Marker({
        position: coord,
        map,
        draggable: !Array.isArray(selectedCoords), // draggable only for single marker
      });
      // Drag listener for pins
      if (!Array.isArray(selectedCoords)) {
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
    markersRef.current = newMarkers;

    // Center/autozoom map
    if (coordsArray.length === 1) {
      map.setCenter(coordsArray[0]);
      map.setZoom(16);
    } else if (coordsArray.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      coordsArray.forEach((c) => bounds.extend(c));
      map.fitBounds(bounds);
    }
  }, [map, selectedCoords]);

  return <div ref={ref} className="google-map" />;
};

export default Map;
