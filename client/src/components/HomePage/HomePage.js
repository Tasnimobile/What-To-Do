import React from 'react';
import Header from './Header';
import Map from './Map';
import Sidebar from './Sidebar';
import './HomePage.css';

function HomePage({ onBack }) {
    return (
        <div className="homepage">
            <div className="main-left">
                <Header onBack={onBack} />
                <Map />
            </div>

            <div className="sidebar-container">
                <Sidebar />
            </div>
        </div>
    );
}

export default HomePage;