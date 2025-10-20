// Map.js
import React, { useState, useEffect } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import "./Map.css";

const render = (status, props) => {
  switch (status) {
    case Status.LOADING:
      return <div className="map-loading">Loading Map...</div>;
    case Status.FAILURE:
      return <div className="map-error">Error loading map</div>;
    case Status.SUCCESS:
      return <MapComponent {...props} />;
    default:
      return null;
  }
};

function Map({
  onLocationSelect,
  isSelectingMode,
  selectedDestinations,
  onUpdateDestination,
  onCancelSelection,
}) {
  console.log("Map component props:", {
    isSelectingMode,
    selectedDestinationsCount: selectedDestinations?.length,
  });

  return (
    <div className="map-container">
      <Wrapper
        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        render={(status) =>
          render(status, {
            onLocationSelect,
            isSelectingMode,
            selectedDestinations,
            onUpdateDestination,
            onCancelSelection,
          })
        }
        libraries={["places"]}
      ></Wrapper>
    </div>
  );
}

const MapComponent = ({
  onLocationSelect,
  isSelectingMode,
  selectedDestinations,
  onUpdateDestination,
  onCancelSelection,
}) => {
  const ref = React.useRef(null);
  const [map, setMap] = React.useState(null);
  const [markers, setMarkers] = React.useState([]);
  const [clickListener, setClickListener] = React.useState(null);

  console.log("MapComponent state:", {
    isSelectingMode,
    selectedDestinationsCount: selectedDestinations?.length,
  });

  const clearMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
  };

  const addDestinationMarker = (destination) => {
    if (!map) return;

    const marker = new window.google.maps.Marker({
      position: { lat: destination.lat, lng: destination.lng },
      map: map,
      title: destination.name,
      draggable: true,
      icon: {
        url:
          "data:image/svg+xml;base64," +
          btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                        <path fill="#71C19D" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                `),
        scaledSize: new window.google.maps.Size(32, 32),
      },
    });

    marker.addListener("dragend", (e) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();

      console.log("Marker dragged to:", newLat, newLng);
      console.log("Original destination name:", destination.name);

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat: newLat, lng: newLng } },
        (results, status) => {
          if (status === "OK" && results[0]) {
            const newAddress = results[0].formatted_address;

            console.log("Updated location - preserving name:", {
              preservedName: destination.name,
              newAddress,
              newLat,
              newLng,
            });

            if (onUpdateDestination) {
              onUpdateDestination(destination.id, {
                lat: newLat,
                lng: newLng,
                address: newAddress,
              });
            }
          } else {
            console.log(
              "Geocoding failed, using coordinates - preserving name:",
              destination.name
            );
            if (onUpdateDestination) {
              onUpdateDestination(destination.id, {
                lat: newLat,
                lng: newLng,
                address: `${newLat.toFixed(6)}, ${newLng.toFixed(6)}`,
              });
            }
          }
        }
      );
    });

    const infoWindow = new window.google.maps.InfoWindow({
      content: `
                <div style="padding: 12px; font-family: Arial, sans-serif; min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; color: #71C19D; font-weight: 600; font-size: 14px;">${destination.name}</h3>
                    <p style="margin: 0; color: #666; font-size: 12px; font-weight: 300;">${destination.address}</p>
                    <p style="margin: 4px 0 0 0; color: #999; font-size: 11px; font-weight: 300; font-style: italic;">Drag to move this marker</p>
                </div>
            `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    setMarkers((prev) => [...prev, marker]);
    return marker;
  };

  const handleMapClick = (e) => {
    console.log("Map clicked!", e.latLng.lat(), e.latLng.lng());
    console.log("isSelectingMode:", isSelectingMode);
    console.log("onLocationSelect function:", onLocationSelect);

    if (isSelectingMode && onLocationSelect) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      console.log("Selected location:", lat, lng);

      const immediateMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        icon: {
          url:
            "data:image/svg+xml;base64," +
            btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                            <path fill="#71C19D" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        console.log("Geocoding status:", status);

        if (status === "OK" && results[0]) {
          const address = results[0].formatted_address;
          const placeName =
            results[0].address_components.find(
              (comp) =>
                comp.types.includes("establishment") ||
                comp.types.includes("point_of_interest") ||
                comp.types.includes("park")
            )?.long_name ||
            results[0].address_components[0]?.long_name ||
            "Selected Location";

          console.log("Geocoded location:", { placeName, address, lat, lng });

          onLocationSelect({
            lat,
            lng,
            address,
            name: placeName,
          });
        } else {
          console.error("Geocoding failed:", status);
          const fallbackLocation = {
            lat,
            lng,
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            name: "Selected Location",
          };

          console.log("Using fallback location:", fallbackLocation);

          onLocationSelect(fallbackLocation);
        }

        immediateMarker.setMap(null);
      });
    } else {
      console.log("Map click ignored - not in selection mode or no callback");
    }
  };

  const handleOutsideClick = (e) => {
    if (
      ref.current &&
      !ref.current.contains(e.target) &&
      isSelectingMode &&
      onCancelSelection
    ) {
      console.log("Clicked outside map - canceling selection mode");
      onCancelSelection();
    }
  };

  React.useEffect(() => {
    if (ref.current && !map) {
      console.log("Initializing map centered on Manhattan...");
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: 40.7831, lng: -73.9712 },
        zoom: 12,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }],
          },
        ],
      });

      setMap(newMap);
    }
  }, [ref, map]);

  React.useEffect(() => {
    if (!map) return;

    console.log("Updating click listener for selection mode:", isSelectingMode);

    if (clickListener) {
      window.google.maps.event.removeListener(clickListener);
      setClickListener(null);
    }

    if (isSelectingMode) {
      const newClickListener = map.addListener("click", handleMapClick);
      setClickListener(newClickListener);

      document.addEventListener("mousedown", handleOutsideClick);
    }

    if (ref.current) {
      ref.current.style.cursor = isSelectingMode ? "crosshair" : "grab";
    }

    return () => {
      if (clickListener) {
        window.google.maps.event.removeListener(clickListener);
      }
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [map, isSelectingMode, onCancelSelection]);

  React.useEffect(() => {
    if (!map) return;

    console.log("Updating markers for destinations:", selectedDestinations);

    clearMarkers();

    if (selectedDestinations && selectedDestinations.length > 0) {
      selectedDestinations.forEach((destination) => {
        addDestinationMarker(destination);
      });

      if (selectedDestinations.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        selectedDestinations.forEach((destination) => {
          bounds.extend({ lat: destination.lat, lng: destination.lng });
        });
        map.fitBounds(bounds);
      } else if (selectedDestinations.length === 1) {
        map.setCenter({
          lat: selectedDestinations[0].lat,
          lng: selectedDestinations[0].lng,
        });
        map.setZoom(14);
      }
    }
  }, [selectedDestinations, map, onUpdateDestination]);

  return (
    <div className="map-component-wrapper">
      {isSelectingMode && (
        <div className="map-selection-hint">
          <div className="selection-hint-content">
            <div className="hint-text">
              <div className="hint-subtitle">Click anywhere on the map</div>
            </div>
          </div>
        </div>
      )}
      <div ref={ref} className="google-map" />
    </div>
  );
};

export default Map;
