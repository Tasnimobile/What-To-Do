// HomePage.js (updated)
import React, { useState } from 'react';
import Header from './Header';
import Map from './Map';
import Sidebar from './Sidebar';
import './HomePage.css';

function HomePage({ onBack, user, onNavigateToProfile, onNavigateToCreate, onViewItinerary }) { // Add onViewItinerary prop
    const [selectedDestinations, setSelectedDestinations] = useState([]);

    const handleNavigateToHome = () => {
        console.log('Already on homepage');
    };

    const handleCreateNew = () => {
        if (onNavigateToCreate) {
            onNavigateToCreate();
        }
    };

    const handleViewItinerary = (itinerary) => {
        if (onViewItinerary) {
            onViewItinerary(itinerary);
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
                    selectedDestinations={selectedDestinations}
                />
            </div>

            <div className="sidebar-container">
                <Sidebar
                    onCreateNew={handleCreateNew}
                    onViewItinerary={handleViewItinerary}
                />
            </div>
        </div>
    );
}

export default HomePage;