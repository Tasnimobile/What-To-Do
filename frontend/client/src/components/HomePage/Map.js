import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import './Map.css';

const render = (status) => {
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

function Map() {
    return (
        <div className="map-container">
            <Wrapper
                apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                render={render}
                libraries={["places"]}
            >
            </Wrapper>
        </div>
    );
}

const MapComponent = () => {
    const ref = React.useRef(null);
    const [map, setMap] = React.useState();

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
                fullscreenControl: true
            });

            setMap(newMap);

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
                    title: location.title
                });
            });
        }
    }, [ref, map]);

    return <div ref={ref} className="google-map" />;
};

export default Map;