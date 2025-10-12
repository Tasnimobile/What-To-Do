// Map.js
import React, { useState, useEffect } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import './Map.css';

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

function Map({ onLocationSelect, isSelectingMode, selectedDestinations }) {
    return (
        <div className="map-container">
            {isSelectingMode && (
                <div className="map-selection-mode">
                    <div className="selection-instruction">
                        Click on the map to select Destination {selectedDestinations ? selectedDestinations.length + 1 : 1}
                    </div>
                </div>
            )}
            <Wrapper
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                render={(status) => render(status, { onLocationSelect, isSelectingMode, selectedDestinations })}
                libraries={["places"]}
            >
            </Wrapper>
        </div>
    );
}

const MapComponent = ({ onLocationSelect, isSelectingMode, selectedDestinations }) => {
    const ref = React.useRef(null);
    const [map, setMap] = React.useState(null);
    const [markers, setMarkers] = React.useState([]);

    const clearMarkers = () => {
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);
    };

    const addDestinationMarker = (destination) => {
        if (!map) return;

        const marker = new window.google.maps.Marker({
            position: { lat: destination.lat, lng: destination.lng },
            map: map,
            title: `${destination.order + 1}. ${destination.name}`,
            icon: {
                url: `data:image/svg+xml;base64,${btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="#71C19D" stroke="white" stroke-width="2"/>
                        <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${destination.order + 1}</text>
                    </svg>
                `)}`,
                scaledSize: new window.google.maps.Size(30, 30),
            }
        });

        const infoWindow = new window.google.maps.InfoWindow({
            content: `
                <div style="padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #71C19D;">${destination.name}</h3>
                    <p style="margin: 0; color: #666; font-size: 12px;">${destination.address}</p>
                    <p style="margin: 4px 0 0 0; color: #999; font-size: 10px;">Stop ${destination.order + 1}</p>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        setMarkers(prev => [...prev, marker]);
        return marker;
    };

    const handleMapClick = (e) => {
        if (isSelectingMode && onLocationSelect) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            const tempMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map: map,
                icon: {
                    url: 'data:image/svg+xml;base64,' + btoa(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="#FF6B6B" stroke="white" stroke-width="2"/>
                            <circle cx="12" cy="12" r="4" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(32, 32),
                },
                animation: window.google.maps.Animation.BOUNCE
            });

            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const address = results[0].formatted_address;
                    const placeName = results[0].address_components[0]?.long_name || 'Selected Location';

                    setTimeout(() => {
                        tempMarker.setMap(null);
                    }, 2000);

                    onLocationSelect({
                        lat,
                        lng,
                        address,
                        name: placeName
                    });
                }
            });
        }
    };

    React.useEffect(() => {
        if (ref.current && !map) {
            const newMap = new window.google.maps.Map(ref.current, {
                center: { lat: 40.7128, lng: -74.0060 },
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
                        stylers: [{ visibility: "on" }]
                    }
                ]
            });

            setMap(newMap);

            newMap.addListener('click', handleMapClick);

            const popularLocations = [
                { lat: 40.7829, lng: -73.9654, title: "Central Park" },
                { lat: 40.6892, lng: -74.0445, title: "Statue of Liberty" },
                { lat: 40.7589, lng: -73.9851, title: "Times Square" },
                { lat: 40.7510, lng: -73.9943, title: "Empire State Building" },
                { lat: 40.7505, lng: -73.9934, title: "Madison Square Garden" }
            ];

            popularLocations.forEach(location => {
                new window.google.maps.Marker({
                    position: { lat: location.lat, lng: location.lng },
                    map: newMap,
                    title: location.title,
                    icon: {
                        url: 'data:image/svg+xml;base64,' + btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                <path fill="#71C19D" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                        `),
                        scaledSize: new window.google.maps.Size(20, 20),
                    }
                });
            });
        }
    }, [ref, map]);

    React.useEffect(() => {
        if (!map) return;

        clearMarkers();

        if (selectedDestinations && selectedDestinations.length > 0) {
            selectedDestinations.forEach(destination => {
                addDestinationMarker(destination);
            });

            if (selectedDestinations.length > 1) {
                const bounds = new window.google.maps.LatLngBounds();
                selectedDestinations.forEach(destination => {
                    bounds.extend({ lat: destination.lat, lng: destination.lng });
                });
                map.fitBounds(bounds);
            } else if (selectedDestinations.length === 1) {
                map.setCenter({
                    lat: selectedDestinations[0].lat,
                    lng: selectedDestinations[0].lng
                });
                map.setZoom(14);
            }
        }
    }, [selectedDestinations, map]);

    React.useEffect(() => {
        if (map && ref.current) {
            if (isSelectingMode) {
                ref.current.style.cursor = 'crosshair';
            } else {
                ref.current.style.cursor = 'grab';
            }
        }
    }, [isSelectingMode, map]);

    return <div ref={ref} className="google-map" />;
};

export default Map;