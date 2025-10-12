import React from 'react';
import Header from './Header';
import Map from './Map';
import Sidebar from './Sidebar';
import './HomePage.css';

function HomePage({ onBack, user, onNavigateToProfile }) {

    const handleNavigateToHome = () => {
        console.log('Already on homepage');
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
                <Map />
            </div>

            <div className="sidebar-container">
                <Sidebar />
            </div>
        </div>
    );
}

export default HomePage;