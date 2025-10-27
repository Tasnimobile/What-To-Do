// Sidebar.js
import React, { useState } from "react";
import ItineraryCard from "./ItineraryCard";
import FilterModal from "./FilterModal";
import "./Sidebar.css";

function Sidebar({
  onCreateNew,
  onViewItinerary,
  itineraries = [],
  isLoading = false,
  currentUser,
  onRateItinerary,
}) {
  // State for search, filter modal, and filter criteria
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    tags: [],
    maxDuration: "",
    maxPrice: "",
  });

  // Handle search input changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Show/hide filter modal
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

  // Reset all filters to default
  const handleClearFilters = () => {
    setFilters({
      minRating: 0,
      tags: [],
      maxDuration: "",
      maxPrice: "",
    });
  };

  // Handle clicking on an itinerary card
  const handleItineraryClick = (itineraryId) => {
    if (onViewItinerary) {
      const safeItineraries = Array.isArray(itineraries) ? itineraries : [];
      const itinerary = safeItineraries.find((item) => item.id === itineraryId);
      onViewItinerary(itinerary);
    }
  };

  // Convert duration string to hours for filtering
  const durationToHours = (duration) => {
    if (!duration) return 0;
    if (typeof duration !== "string") return 0;

    if (duration.includes("hour")) {
      return parseInt(duration) || 0;
    }
    if (duration.includes("day")) {
      return (parseInt(duration) || 1) * 24;
    }
    return 0;
  };

  // Convert price string to numeric value for filtering
  const priceToNumber = (price) => {
    if (!price) return 0;
    if (typeof price !== "string") return 0;
    return price.length;
  };

  // Filter itineraries based on search and filter criteria
  const filteredItineraries = (
    Array.isArray(itineraries) ? itineraries : []
  ).filter((itinerary) => {
    if (!itinerary || typeof itinerary !== "object") {
      return false;
    }

    const matchesSearch =
      searchTerm === "" ||
      (itinerary.title &&
        itinerary.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (itinerary.description &&
        itinerary.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRating = (itinerary.rating || 0) >= (filters.minRating || 0);

    const itineraryTags = itinerary.tags || [];
    const filterTags = filters.tags || [];
    const matchesTags =
      filterTags.length === 0 ||
      filterTags.some((tag) => itineraryTags.includes(tag));

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

    return (
      matchesSearch &&
      matchesRating &&
      matchesTags &&
      matchesDuration &&
      matchesPrice
    );
  });

  const hasActiveFilters =
    filters.minRating > 0 ||
    (filters.tags && filters.tags.length > 0) ||
    filters.maxDuration ||
    filters.maxPrice;

  return (
    <div className="sidebar">
      {/* Main sidebar header */}
      <h1>Itineraries</h1>

      {/* Create new itinerary button */}
      <h2
        className="create-new-header"
        onClick={onCreateNew}
        style={{ cursor: "pointer" }}
      >
        Create New
      </h2>

      {/* Search and filter controls */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search itineraries..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={handleFilterClick}>
          Filter {hasActiveFilters && "•"}
        </button>
      </div>

      {/* Clear filters button when filters are active */}
      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={handleClearFilters}>
          Clear Filters
        </button>
      )}

      {/* Itineraries list */}
      <div className="itineraries-list">
        {isLoading ? (
          <div className="no-results">Loading itineraries...</div>
        ) : (
          <>
            {/* Display filtered itineraries */}
            {filteredItineraries.map((itinerary) => (
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
                createdBy={itinerary.createdBy}
                currentUser={currentUser}
                onRateItinerary={onRateItinerary}
              />
            ))}

            {/* No results message */}
            {filteredItineraries.length === 0 && (
              <div className="no-results">
                No itineraries found. Try adjusting your search or filters.
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter modal */}
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
