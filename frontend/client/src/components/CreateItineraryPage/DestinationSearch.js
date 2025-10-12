// DestinationSearch.js

import React, { useState, useRef } from 'react';
import './DestinationSearch.css';

function DestinationSearch({ currentStep, onDestinationSelected, onMapSelection, onCancel }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchInputRef = useRef(null);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);

    const initializeServices = () => {
        if (!window.google) return;

        if (!autocompleteService.current) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
        if (!placesService.current) {
            const map = new window.google.maps.Map(document.createElement('div'));
            placesService.current = new window.google.maps.places.PlacesService(map);
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);

        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        initializeServices();

        if (autocompleteService.current) {
            setIsSearching(true);
            autocompleteService.current.getPlacePredictions(
                {
                    input: query,
                    types: ['establishment', 'point_of_interest', 'tourist_attraction', 'park', 'museum'],
                    location: new window.google.maps.LatLng(40.7128, -74.0060),
                    radius: 50000
                },
                (predictions, status) => {
                    setIsSearching(false);
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSearchResults(predictions);
                    } else {
                        setSearchResults([]);
                    }
                }
            );
        }
    };

    const handleSelectSearchResult = (placePrediction) => {
        initializeServices();

        if (placesService.current) {
            placesService.current.getDetails(
                {
                    placeId: placePrediction.place_id,
                    fields: ['name', 'formatted_address', 'geometry', 'types', 'rating', 'photos']
                },
                (place, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                        const newDestination = {
                            id: Date.now() + Math.random(),
                            name: place.name,
                            address: place.formatted_address,
                            placeId: placePrediction.place_id,
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                            types: place.types || [],
                            rating: place.rating || null,
                            order: currentStep - 1
                        };

                        onDestinationSelected(newDestination);
                    }
                }
            );
        }
    };

    const handleMapSelection = () => {
        onMapSelection();
        onCancel();
    };

    return (
        <div className="destination-search-mode">
            <div className="search-header">
                <h4>Search for Destination {currentStep}</h4>
                <button className="close-search-btn" onClick={onCancel}>×</button>
            </div>

            <div className="search-input-container">
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for places in NYC..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="search-input"
                />
                {isSearching && (
                    <div className="search-loading">Searching...</div>
                )}
            </div>

            {searchResults.length > 0 && (
                <div className="search-results">
                    {searchResults.map((result) => (
                        <div
                            key={result.place_id}
                            className="search-result-item"
                            onClick={() => handleSelectSearchResult(result)}
                        >
                            <div className="result-icon">📍</div>
                            <div className="result-details">
                                <div className="result-name">{result.structured_formatting.main_text}</div>
                                <div className="result-address">{result.structured_formatting.secondary_text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="search-options">
                <div className="option-divider">or</div>
                <button
                    className="map-selection-btn"
                    onClick={handleMapSelection}
                >
                    Click on Map to Select Location
                </button>
            </div>
        </div>
    );
}

export default DestinationSearch;