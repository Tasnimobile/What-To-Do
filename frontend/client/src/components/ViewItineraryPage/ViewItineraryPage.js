// src/components/ViewItineraryPage/ViewItineraryPage.js
import React from 'react';
import Header from '../HomePage/Header';
import Map from '../HomePage/Map';
import ViewItinerarySidebar from './ViewItinerarySidebar';
import '../HomePage/HomePage.css';

function ViewItineraryPage({ onBack, user, onNavigateToProfile, onNavigateToHome, onNavigateToCreated, itinerary }) {
    console.log('ViewItineraryPage received itinerary:', itinerary);

    const handleNavigateToHome = () => {
        if (onNavigateToHome) {
            onNavigateToHome();
        }
    };

    const handleNavigateToCreated = () => {
        if (onNavigateToCreated) {
            onNavigateToCreated();
        }
    };

    const mapDestinations = itinerary?.destinations || [];

    return (
        <div className="homepage">
            <div className="main-left">
                <Header
                    onBack={onBack}
                    user={user}
                    onNavigateToProfile={onNavigateToProfile}
                    onNavigateToHome={handleNavigateToHome}
                    onNavigateToCreated={handleNavigateToCreated}
                />
                <Map
                    selectedDestinations={mapDestinations}
                    isViewMode={true}
                />
            </div>

            <div className="sidebar-container">
                <ViewItinerarySidebar
                    itinerary={itinerary}
                    onBack={onBack}
                />
            </div>
        </div>
    );
}

export default ViewItineraryPage;