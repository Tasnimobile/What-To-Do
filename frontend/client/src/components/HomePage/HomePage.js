// HomePage.js 
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Map from './Map';
import Sidebar from './Sidebar';
import './HomePage.css';

function HomePage({ onBack, user, onNavigateToProfile, onNavigateToCreate, onViewItinerary, onNavigateToCreated }) {
    const [selectedDestinations, setSelectedDestinations] = useState([]);
    const [allItineraries, setAllItineraries] = useState([]);

    useEffect(() => {
        loadItineraries();
    }, []);

    const loadItineraries = () => {
        try {
            const savedItineraries = localStorage.getItem('userItineraries');
            if (savedItineraries) {
                setAllItineraries(JSON.parse(savedItineraries));
            } else {
                const defaultItineraries = [
                    {
                        id: 1,
                        title: "Central Park Day",
                        rating: 5,
                        description: "A perfect day exploring Central Park's hidden gems and main attractions",
                        tags: ["park", "outdoors", "family"],
                        duration: "1 day",
                        price: "$$",
                        createdBy: 'system'
                    },
                    {
                        id: 2,
                        title: "Brooklyn Food Tour",
                        rating: 4,
                        description: "Culinary adventure through Brooklyn's best eateries and food markets",
                        tags: ["food", "cultural", "walking"],
                        duration: "4 hours",
                        price: "$$$",
                        createdBy: 'system'
                    },
                    {
                        id: 3,
                        title: "Museum Hopping",
                        rating: 3,
                        description: "Explore NYC's world-class museums and cultural institutions",
                        tags: ["museums", "educational", "indoor"],
                        duration: "6 hours",
                        price: "$$",
                        createdBy: 'system'
                    }
                ];
                setAllItineraries(defaultItineraries);
                localStorage.setItem('userItineraries', JSON.stringify(defaultItineraries));
            }
        } catch (error) {
            console.error('Error loading itineraries:', error);
        }
    };

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

    const addNewItinerary = (newItinerary) => {
        const itineraryWithId = {
            ...newItinerary,
            id: Date.now(),
            rating: 0,
            createdAt: new Date().toISOString(),
            createdBy: user?.id || 'current-user'
        };

        const updatedItineraries = [...allItineraries, itineraryWithId];
        setAllItineraries(updatedItineraries);

        // Save to localStorage
        localStorage.setItem('userItineraries', JSON.stringify(updatedItineraries));

        console.log('New itinerary added to homepage:', itineraryWithId);
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
                    selectedDestinations={selectedDestinations}
                />
            </div>

            <div className="sidebar-container">
                <Sidebar
                    onCreateNew={handleCreateNew}
                    onViewItinerary={handleViewItinerary}
                    itineraries={allItineraries}
                    onNewItinerary={addNewItinerary}
                />
            </div>
        </div>
    );
}

export default HomePage;