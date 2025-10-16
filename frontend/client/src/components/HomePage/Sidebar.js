// Sidebar.js
import React, { useState } from 'react';
import ItineraryCard from './ItineraryCard';
import FilterModal from './FilterModal';
import './Sidebar.css';

function Sidebar({ onCreateNew, onViewItinerary, itineraries = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
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

    const handleItineraryClick = (itineraryId) => {
        if (onViewItinerary) {
            const itinerary = itineraries.find(item => item.id === itineraryId);
            onViewItinerary(itinerary);
        }
    };

    const durationToHours = (duration) => {
        if (!duration) return 0;
        if (typeof duration !== 'string') return 0;

        if (duration.includes('hour')) {
            return parseInt(duration) || 0;
        }
        if (duration.includes('day')) {
            return (parseInt(duration) || 1) * 24;
        }
        return 0;
    };

    const priceToNumber = (price) => {
        if (!price) return 0;
        if (typeof price !== 'string') return 0;
        return price.length;
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

            <h2
                className="create-new-header"
                onClick={onCreateNew}
                style={{ cursor: 'pointer' }}
            >
                Create New
            </h2>

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

            {hasActiveFilters && (
                <button
                    className="clear-filters-btn"
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </button>
            )}

            {filteredItineraries.map(itinerary => (
                <ItineraryCard
                    key={itinerary.id}
                    itineraryId={itinerary.id}
                    title={itinerary.title}
                    rating={itinerary.rating}
                    description={itinerary.description}
                    tags={itinerary.tags}
                    duration={itinerary.duration}
                    price={itinerary.price}
                    onClick={handleItineraryClick}
                />
            ))}

            {filteredItineraries.length === 0 && (
                <div className="no-results">
                    No itineraries found. Try adjusting your search or filters.
                </div>
            )}

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