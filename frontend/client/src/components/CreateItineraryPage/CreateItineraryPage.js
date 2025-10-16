// CreateItineraryPage.js 
import React, { useState } from 'react';
import Header from '../HomePage/Header';
import Map from '../HomePage/Map';
import CreateItinerarySidebar from './CreateItinerarySidebar';
import '../HomePage/HomePage.css';

function CreateItineraryPage({ onBack, user, onNavigateToProfile, onNavigateToHome, onNavigateToCreated }) {
    const [isSelectingLocation, setIsSelectingLocation] = useState(false);
    const [itineraryData, setItineraryData] = useState({
        title: '',
        description: '',
        tags: [],
        duration: '1 day',
        price: '$$',
        customTag: '',
        destinations: []
    });

    console.log('CreateItineraryPage state:', {
        isSelectingLocation,
        itineraryData
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
            order: itineraryData.destinations.length,
            rating: null
        };

        console.log('New destination created:', newDestination);

        setItineraryData(prev => ({
            ...prev,
            destinations: [...prev.destinations, newDestination]
        }));

        setIsSelectingLocation(false);
    };

    const handleCancelLocationSelection = () => {
        console.log('Location selection canceled by clicking outside map');
        setIsSelectingLocation(false);
    };

    const handleItinerarySave = (itineraryData) => {
        console.log('Saving itinerary:', itineraryData);

        const savedItineraries = JSON.parse(localStorage.getItem('userItineraries') || '[]');
        const updatedItineraries = [...savedItineraries, itineraryData];
        localStorage.setItem('userItineraries', JSON.stringify(updatedItineraries));

        setItineraryData({
            title: '',
            description: '',
            tags: [],
            duration: '1 day',
            price: '$$',
            customTag: '',
            destinations: []
        });
        setIsSelectingLocation(false);

        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const handleItineraryCancel = () => {
        console.log('Canceling itinerary creation');
        setItineraryData({
            title: '',
            description: '',
            tags: [],
            duration: '1 day',
            price: '$$',
            customTag: '',
            destinations: []
        });
        setIsSelectingLocation(false);

        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const updateItineraryData = (field, value) => {
        console.log('Updating itinerary data:', field, value);
        setItineraryData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateDestination = (destinationId, updates) => {
        console.log('Updating destination location:', destinationId, updates);
        const updatedDestinations = itineraryData.destinations.map(dest =>
            dest.id === destinationId ? { ...dest, ...updates } : dest
        );
        setItineraryData(prev => ({
            ...prev,
            destinations: updatedDestinations
        }));
    };

    return (
        <div className="homepage">
            <div className="main-left">
                <Header
                    onBack={onBack}
                    user={user}
                    onNavigateToProfile={onNavigateToProfile}
                    onNavigateToHome={handleNavigateToHome}
                    onNavigateToCreated={onNavigateToCreated}
                />
                <Map
                    onLocationSelect={handleLocationSelected}
                    isSelectingMode={isSelectingLocation}
                    selectedDestinations={itineraryData.destinations}
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
                    itineraryData={itineraryData}
                    onUpdate={updateItineraryData}
                    user={user}
                />
            </div>
        </div>
    );
}

export default CreateItineraryPage;