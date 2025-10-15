// CreateItineraryPage.js - Fixed version with onCancelSelection
import React, { useState } from 'react';
import Header from '../HomePage/Header';
import Map from '../HomePage/Map';
import CreateItinerarySidebar from './CreateItinerarySidebar';
import '../HomePage/HomePage.css';

function CreateItineraryPage({ onBack, user, onNavigateToProfile, onNavigateToHome }) {
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [currentItineraryDestinations, setCurrentItineraryDestinations] = useState([]);

    console.log('CreateItineraryPage state:', {
        isSelectingLocation,
        currentItineraryDestinations
    });

    const handleNavigateToHome = () => {
        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const handleStartLocationSelection = () => {
        console.log('Starting location selection');
        setIsSelectingLocation(true);
    };

    const handleLocationSelected = (location) => {
        console.log('Location selected in CreateItineraryPage:', location);

        const newDestination = {
            id: Date.now() + Math.random(),
            name: location.name || 'Selected Location',
            address: location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
            lat: location.lat,
            lng: location.lng,
            order: currentItineraryDestinations.length,
            rating: null
        };

        console.log('New destination created:', newDestination);

        setCurrentItineraryDestinations(prev => {
            const updated = [...prev, newDestination];
            console.log('Updated current destinations:', updated);
            return updated;
        });

        setIsSelectingLocation(false);
    };

    const handleCancelLocationSelection = () => {
        console.log('Location selection canceled by clicking outside map');
        setIsSelectingLocation(false);
    };

    const handleItinerarySave = (itineraryData) => {
        console.log('Saving itinerary:', itineraryData);
        setCurrentItineraryDestinations([]);
        setIsSelectingLocation(false);

        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const handleItineraryCancel = () => {
        console.log('Canceling itinerary creation');
        setCurrentItineraryDestinations([]);
        setIsSelectingLocation(false);

        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const updateItineraryData = (field, value) => {
        console.log('Updating itinerary data:', field, value);
        if (field === 'destinations') {
            setCurrentItineraryDestinations(value);
        }
    };

    const handleUpdateDestination = (destinationId, updates) => {
        console.log('Updating destination location:', destinationId, updates);
        const updatedDestinations = currentItineraryDestinations.map(dest =>
            dest.id === destinationId ? { ...dest, ...updates } : dest
        );
        setCurrentItineraryDestinations(updatedDestinations);
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
                    selectedDestinations={currentItineraryDestinations}
                    onUpdateDestination={handleUpdateDestination}
                    onCancelSelection={handleCancelLocationSelection}
                />
            </div>

            <div className="sidebar-container">
                <CreateItinerarySidebar
                    onStartLocationSelection={handleStartLocationSelection}
                    isSelectingLocation={isSelectingLocation}
                    onItinerarySave={handleItinerarySave}
                    onItineraryCancel={handleItineraryCancel}
                    itineraryData={{
                        destinations: currentItineraryDestinations
                    }}
                    onUpdate={updateItineraryData}
                />
            </div>
        </div>
    );
}

export default CreateItineraryPage;