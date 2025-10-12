// Sidebar.js (updated)
import React, { useState } from 'react';
import ItineraryCard from './ItineraryCard';
import FilterModal from './FilterModal';
import './Sidebar.css';

function Sidebar({ onCreateNew }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [itineraries, setItineraries] = useState([
        {
            id: 1,
            title: "Central Park Day",
            rating: 5,
            description: "A perfect day exploring Central Park's hidden gems and main attractions",
            tags: ["park", "outdoors", "family"],
            duration: "1 day",
            price: "$$"
        },
        {
            id: 2,
            title: "Brooklyn Food Tour",
            rating: 4,
            description: "Culinary adventure through Brooklyn's best eateries and food markets",
            tags: ["food", "cultural", "walking"],
            duration: "4 hours",
            price: "$$$"
        },
        {
            id: 3,
            title: "Museum Hopping",
            rating: 3,
            description: "Explore NYC's world-class museums and cultural institutions",
            tags: ["museums", "educational", "indoor"],
            duration: "6 hours",
            price: "$$"
        }
    ]);
    const [filters, setFilters] = useState({
        minRating: 0,
        tags: [],
        maxDuration: '',
        maxPrice: ''
    });

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterClick = () => {
        setShowFilterModal(true);
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setShowFilterModal(false);
    };

    const handleCloseFilter = () => {
        setShowFilterModal(false);
    };

    const handleClearFilters = () => {
        setFilters({
            minRating: 0,
            tags: [],
            maxDuration: '',
            maxPrice: ''
        });
    };

    const durationToHours = (duration) => {
        if (!duration) return 0;
        if (typeof duration !== 'string') return 0;

        if (duration.includes('hour')) {
            return parseInt(duration) || 0;
        }
        if (duration.includes('day')) {
            return (parseInt(duration) || 1) * 24; // Convert days to hours
        }
        return 0;
    };

    const priceToNumber = (price) => {
        if (!price) return 0;
        if (typeof price !== 'string') return 0;
        return price.length; // $=1, $$=2, $$$=3, etc.
    };

    const filteredItineraries = itineraries.filter(itinerary => {
        const matchesSearch = searchTerm === '' ||
            (itinerary.title && itinerary.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (itinerary.description && itinerary.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRating = (itinerary.rating || 0) >= (filters.minRating || 0);

        const itineraryTags = itinerary.tags || [];
        const filterTags = filters.tags || [];
        const matchesTags = filterTags.length === 0 ||
            filterTags.some(tag => itineraryTags.includes(tag));

        let matchesDuration = true;
        if (filters.maxDuration) {
            const itineraryHours = durationToHours(itinerary.duration);
            const filterHours = durationToHours(filters.maxDuration);
            matchesDuration = itineraryHours <= filterHours;
        }

        let matchesPrice = true;
        if (filters.maxPrice) {
            const itineraryPriceValue = priceToNumber(itinerary.price);
            const filterPriceValue = priceToNumber(filters.maxPrice);
            matchesPrice = itineraryPriceValue <= filterPriceValue;
        }

        return matchesSearch && matchesRating && matchesTags && matchesDuration && matchesPrice;
    });

    const hasActiveFilters = filters.minRating > 0 ||
        (filters.tags && filters.tags.length > 0) ||
        filters.maxDuration ||
        filters.maxPrice;

    return (
        <div className="sidebar">
            <h1>Itineraries</h1>

            {/* Create New Button */}
            <h2
                className="create-new-header"
                onClick={onCreateNew}
                style={{ cursor: 'pointer' }}
            >
                Create New
            </h2>

            {/* Search and Filter */}
            <div className="search-filter">
                <input
                    type="text"
                    placeholder="Search itineraries..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <button onClick={handleFilterClick}>
                    Filter {hasActiveFilters && '•'}
                </button>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <button
                    className="clear-filters-btn"
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </button>
            )}

            {/* Itinerary Cards */}
            {filteredItineraries.map(itinerary => (
                <ItineraryCard
                    key={itinerary.id}
                    title={itinerary.title}
                    rating={itinerary.rating}
                    description={itinerary.description}
                    tags={itinerary.tags}
                    duration={itinerary.duration}
                    price={itinerary.price}
                />
            ))}

            {/* No Results Message */}
            {filteredItineraries.length === 0 && (
                <div className="no-results">
                    No itineraries found. Try adjusting your search or filters.
                </div>
            )}

            {/* Filter Modal */}
            {showFilterModal && (
                <FilterModal
                    filters={filters}
                    onApply={handleApplyFilters}
                    onClose={handleCloseFilter}
                />
            )}
        </div>
    );
}

export default Sidebar;