// src/components/UserProfilePage/ItineraryView.js
import React from 'react';
import ItineraryCard from '../HomePage/ItineraryCard';
import './ItineraryView.css';

const ItineraryView = ({ activeTab, onTabClick, userItineraries = [], user, onViewItinerary }) => { // Add onViewItinerary prop

    const handleItineraryClick = (itineraryId) => {
        console.log('Itinerary clicked:', itineraryId);
        const itinerary = userItineraries.find(item => item.id === itineraryId);
        if (itinerary && onViewItinerary) {
            onViewItinerary(itinerary);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'itineraries':
                if (userItineraries.length === 0) {
                    return (
                        <div className="grid-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 9h14V7H3v2zm0 4h14v-2H3v2zm0 4h14v-2H3v2zm16 0h2v-2h-2v2zm0-10v2h2V7h-2zm0 6h2v-2h-2v2z" />
                            </svg>
                            <p>You haven't created any itineraries yet.</p>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '10px' }}>
                                Create your first itinerary to see it here!
                            </p>
                        </div>
                    );
                }
                return (
                    <div className="itineraries-grid">
                        {userItineraries.map(itinerary => (
                            <div key={itinerary.id} className="itinerary-grid-item">
                                <ItineraryCard
                                    itineraryId={itinerary.id}
                                    title={itinerary.title}
                                    rating={itinerary.rating}
                                    description={itinerary.description}
                                    tags={itinerary.tags}
                                    duration={itinerary.duration}
                                    price={itinerary.price}
                                    onClick={handleItineraryClick}
                                />
                            </div>
                        ))}
                    </div>
                );

            case 'saved':
                return (
                    <div className="grid-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                        </svg>
                        <p>Your saved itineraries will appear here</p>
                    </div>
                );

            case 'recent':
                const recentItineraries = userItineraries.filter(itin => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return new Date(itin.createdAt) > oneWeekAgo;
                });

                if (recentItineraries.length === 0) {
                    return (
                        <div className="grid-placeholder">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                            </svg>
                            <p>No recently created itineraries</p>
                        </div>
                    );
                }
                return (
                    <div className="itineraries-grid">
                        {recentItineraries.map(itinerary => (
                            <div key={itinerary.id} className="itinerary-grid-item">
                                <ItineraryCard
                                    itineraryId={itinerary.id}
                                    title={itinerary.title}
                                    rating={itinerary.rating}
                                    description={itinerary.description}
                                    tags={itinerary.tags}
                                    duration={itinerary.duration}
                                    price={itinerary.price}
                                    onClick={handleItineraryClick}
                                />
                            </div>
                        ))}
                    </div>
                );

            default:
                return (
                    <div className="grid-placeholder">
                        <p>Select a tab to view content</p>
                    </div>
                );
        }
    };

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
                    Itineraries ({userItineraries.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => onTabClick('saved')}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                    </svg>
                    Saved (0)
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
                {renderContent()}
            </div>
        </div>
    );
};

export default ItineraryView;