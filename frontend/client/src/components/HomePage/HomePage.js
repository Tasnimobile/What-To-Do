// HomePage.js
import React, { useState } from 'react';
import Header from './Header';
import Map from './Map';
import Sidebar from './Sidebar';
import './HomePage.css';

function HomePage({ onBack, user, onNavigateToProfile, onNavigateToCreate }) {
    const [selectedDestinations, setSelectedDestinations] = useState([]);

    const handleNavigateToHome = () => {
        console.log('Already on homepage');
    };

    const handleCreateNew = () => {
        if (onNavigateToCreate) {
            onNavigateToCreate();
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
                />
            </div>
        </div>
    );
}

export default HomePage;