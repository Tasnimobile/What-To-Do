// CreateItineraryPage.js
import React, { useState } from 'react';
import Header from '../HomePage/Header';
import Map from '../HomePage/Map';
import CreateItinerarySidebar from './CreateItinerarySidebar';
import '../HomePage/HomePage.css';

function CreateItineraryPage({ onBack, user, onNavigateToProfile, onNavigateToHome }) {
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [selectedDestinations, setSelectedDestinations] = useState([]);
    const [currentItineraryDestinations, setCurrentItineraryDestinations] = useState([]);

    const handleNavigateToHome = () => {
        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const handleStartLocationSelection = () => {
        setIsSelectingLocation(true);
    };

    const handleLocationSelected = (location) => {
        const newDestination = {
            id: Date.now() + Math.random(),
            name: location.name,
            address: location.address,
            lat: location.lat,
            lng: location.lng,
            order: currentItineraryDestinations.length
        };

        setCurrentItineraryDestinations(prev => [...prev, newDestination]);
        setSelectedDestinations(prev => [...prev, newDestination]);
        setIsSelectingLocation(false);
    };

    const handleItinerarySave = (itineraryData) => {
        setCurrentItineraryDestinations([]);
        setSelectedDestinations([]);
        console.log('Itinerary saved:', itineraryData);

        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const handleItineraryCancel = () => {
        setCurrentItineraryDestinations([]);
        setSelectedDestinations([]);

        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    return (
        <div className="homepage">
            <div className="main-left">
                <Header
                    onBack={onBack}
                    user={user}
                    onNavigateToProfile={onNavigateToProfile}
                    onNavigateToHome={handleNavigateToHome}
                />
                <Map
                    onLocationSelect={handleLocationSelected}
                    isSelectingMode={isSelectingLocation}
                    selectedDestinations={selectedDestinations}
                />
            </div>

            <div className="sidebar-container">
                <CreateItinerarySidebar
                    onStartLocationSelection={handleStartLocationSelection}
                    isSelectingLocation={isSelectingLocation}
                    onItinerarySave={handleItinerarySave}
                    onItineraryCancel={handleItineraryCancel}
                />
            </div>
        </div>
    );
}

export default CreateItineraryPage;