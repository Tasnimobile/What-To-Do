// DestinationSearch.js 
import React, { useState, useRef } from 'react';
import './DestinationSearch.css';

function DestinationSearch({ onDestinationSelected, onMapSelection, onCancel }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const searchInputRef = useRef(null);
    const searchContainerRef = useRef(null);
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

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        initializeServices();

        if (autocompleteService.current) {
            setIsSearching(true);

            const request = {
                input: query,
                types: ['establishment']
            };

            autocompleteService.current.getPlacePredictions(
                request,
                (predictions, status) => {
                    setIsSearching(false);
                    console.log('Search status:', status, 'Results:', predictions);

                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSearchResults(predictions);
                    } else {
                        setSearchResults([]);
                        if (status === 'INVALID_REQUEST') {
                            tryAlternativeSearch(query);
                        }
                    }
                }
            );
        }
    };

    const tryAlternativeSearch = (query) => {
        if (!autocompleteService.current) return;

        const simpleRequest = {
            input: query
        };

        autocompleteService.current.getPlacePredictions(
            simpleRequest,
            (predictions, status) => {
                console.log('Alternative search status:', status, 'Results:', predictions);

                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSearchResults(predictions);
                }
            }
        );
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
                            order: 0
                        };

                        onDestinationSelected(newDestination);
                        setSearchResults([]);
                    } else {
                        const fallbackDestination = {
                            id: Date.now() + Math.random(),
                            name: placePrediction.structured_formatting.main_text,
                            address: placePrediction.structured_formatting.secondary_text,
                            placeId: placePrediction.place_id,
                            lat: 40.7128,
                            lng: -74.0060,
                            types: placePrediction.types || [],
                            rating: null,
                            order: 0
                        };
                        onDestinationSelected(fallbackDestination);
                        setSearchResults([]);
                    }
                }
            );
        }
    };

    const handleMapSelection = () => {
        console.log('Map selection clicked in DestinationSearch');
        onMapSelection();
    };

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="destination-search-mode" ref={searchContainerRef}>
            <div className="search-header">
                <h4>Search for Destination</h4>
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

                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((result) => (
                            <div
                                key={result.place_id}
                                className="search-result-item"
                                onClick={() => handleSelectSearchResult(result)}
                            >
                                <div className="result-details">
                                    <div className="result-name">{result.structured_formatting.main_text}</div>
                                    <div className="result-address">{result.structured_formatting.secondary_text}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="no-results">
                    No places found. Try a different search term.
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