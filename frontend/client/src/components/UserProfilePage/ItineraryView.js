// src/components/UserProfilePage/ItineraryView.js
import React from 'react';
import './ItineraryView.css';

const ItineraryView = ({ activeTab, onTabClick }) => {
    return (
        <div className="itinerary-container">
            {/* Profile Tabs */}
            <div className="profile-tabs">
                <button
                    className={`tab-button ${activeTab === 'itineraries' ? 'active' : ''}`}
                    onClick={() => onTabClick('itineraries')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z" />
                    </svg>
                    Itineraries
                </button>
                <button
                    className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => onTabClick('saved')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                    </svg>
                    Saved
                </button>
                <button
                    className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
                    onClick={() => onTabClick('recent')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    Recently Viewed
                </button>
            </div>

            {/* Content based on active tab */}
            <div className="content-grid">
                <div className="grid-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z" />
                    </svg>
                    <p>
                        {activeTab === 'itineraries' && 'Your created itineraries will appear here'}
                        {activeTab === 'saved' && 'Your saved itineraries will appear here'}
                        {activeTab === 'recent' && 'Your recently viewed itineraries will appear here'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ItineraryView;