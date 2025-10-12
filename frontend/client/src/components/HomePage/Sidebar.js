import React from 'react';
import ItineraryCard from './ItineraryCard';
import './Sidebar.css';

function Sidebar() {
    return (
        <div className="sidebar">
            <h1>Itineraries</h1>
            <h2>Create New</h2>

            <div className="search-filter">
                <input type="text" placeholder="Search itineraries..." />
                <button>Filter</button>
            </div>

            <ItineraryCard
                title="Central Park Day"
                rating={5}
                description="A perfect day exploring Central Park's hidden gems and main attractions"
            />
            <ItineraryCard
                title="Brooklyn Food Tour"
                rating={4}
                description="Culinary adventure through Brooklyn's best eateries and food markets"
            />
            <ItineraryCard
                title="Museum Hopping"
                rating={3}
                description="Explore NYC's world-class museums and cultural institutions"
            />
        </div>
    );
}

export default Sidebar;