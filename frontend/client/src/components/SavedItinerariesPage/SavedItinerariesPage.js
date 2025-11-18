// SavedItinerariesPage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import ItineraryCard from "../HomePage/ItineraryCard";
import "../HomePage/HomePage.css";
import "./SavedItinerariesPage.css";

function SavedItinerariesPage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onViewItinerary,
  onNavigateToSaved,
  onNavigateToCreated,
  onNavigateToCompleted,
  onLogout,
  showError,
}) {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process tags from various formats (array, string, JSON string)
  const processTags = (tags) => {
    if (!tags) return [];

    if (Array.isArray(tags)) {
      return tags;
    }

    if (typeof tags === "string") {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn("Failed to parse tags as JSON:", e);
        return [];
      }
    }

    return [];
  };

  // Load saved itineraries from backend API
  useEffect(() => {
    loadSavedItineraries();
  }, [user]);

  const loadSavedItineraries = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching saved itineraries for user:", user?.id);

      const response = await fetch("http://localhost:3000/api/my-saved-itineraries", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API Response for saved itineraries:", data);

        let savedItinerariesFromDB = [];

        if (data.ok && Array.isArray(data.itineraries)) {
          savedItinerariesFromDB = data.itineraries;
        } else {
          console.error("Unexpected API response structure:", data);
          savedItinerariesFromDB = [];
        }

        // Process and format itinerary data for display
        const processedItineraries = savedItinerariesFromDB.map((itinerary) => ({
          ...itinerary,
          tags: processTags(itinerary.tags),
          title: itinerary.title || "Untitled Itinerary",
          description: itinerary.description || "",
          duration: itinerary.duration || "1 day",
          price: itinerary.price || "$$",
          rating: itinerary.rating || 0,
          destinations: itinerary.destinations || [],
          createdBy: itinerary.authorid,
          authorid: itinerary.authorid,
        }));

        console.log("Saved itineraries loaded from database:", processedItineraries);
        setSavedItineraries(processedItineraries);
      } else {
        console.error(
          "Failed to fetch saved itineraries from server, status:",
          response.status
        );
        setSavedItineraries([]);
        if (showError) {
          showError("Failed to load saved itineraries from server.");
        }
      }
    } catch (error) {
      console.error("Error loading saved itineraries from server:", error);
      setSavedItineraries([]);
      if (showError) {
        showError("Error loading saved itineraries. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // Handler for viewing itinerary details
  const handleViewItinerary = (itinerary) => {
    console.log("Viewing saved itinerary:", itinerary);
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  // Handler for clicking on itinerary card
  const handleItineraryClick = (itineraryId) => {
    const itinerary = savedItineraries.find((item) => item.id === itineraryId);
    if (itinerary) {
      handleViewItinerary(itinerary);
    }
  };

  // Sidebar component for displaying saved itineraries
  const SavedItinerariesSidebar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
      minRating: 0,
      tags: [],
      maxDuration: "",
      maxPrice: "",
    });

    // Search handler
    const handleSearch = (e) => {
      setSearchTerm(e.target.value);
    };

    // Filter modal handlers
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
        maxDuration: "",
        maxPrice: "",
      });
    };

    // Utility functions for filtering
    const durationToHours = (duration) => {
      if (!duration) return 0;
      if (typeof duration !== "string") return 0;

      const durationLower = duration.toLowerCase();

      // Extract numbers from duration string
      const hoursMatch = durationLower.match(/(\d+)\s*hour/);
      const daysMatch = durationLower.match(/(\d+)\s*day/);

      if (hoursMatch) {
        return parseInt(hoursMatch[1]) || 0;
      }
      if (daysMatch) {
        return (parseInt(daysMatch[1]) || 1) * 24;
      }

      // Default fallback
      return durationLower.includes("day") ? 24 : 2;
    };

    const priceToNumber = (price) => {
      if (!price) return 0;
      if (typeof price !== "string") return 0;

      // Count the $ symbols
      const dollarCount = (price.match(/\$/g) || []).length;
      return dollarCount;
    };

    // duration comparison function
    const compareDurations = (itineraryDuration, filterDuration) => {
      if (!filterDuration) return true;

      const itineraryHours = durationToHours(itineraryDuration);
      const filterHours = durationToHours(filterDuration);

      return itineraryHours <= filterHours;
    };

    // price comparison function
    const comparePrices = (itineraryPrice, filterPrice) => {
      if (!filterPrice) return true;

      const itineraryPriceValue = priceToNumber(itineraryPrice);
      const filterPriceValue = priceToNumber(filterPrice);

      return itineraryPriceValue <= filterPriceValue;
    };

    // Filter itineraries based on search and filter criteria
    const filteredItineraries = (
      Array.isArray(savedItineraries) ? savedItineraries : []
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

      const itineraryTags = Array.isArray(itinerary.tags) ? itinerary.tags : [];
      const filterTags = Array.isArray(filters.tags) ? filters.tags : [];
      const matchesTags =
        filterTags.length === 0 ||
        filterTags.some((tag) => itineraryTags.includes(tag));

      const matchesDuration = compareDurations(itinerary.duration, filters.maxDuration);
      const matchesPrice = comparePrices(itinerary.price, filters.maxPrice);

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
        <h1>My Saved Itineraries</h1>

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

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}

        {/* Itineraries list or loading/empty states */}
        {isLoading ? (
          <div className="no-results">Loading saved itineraries...</div>
        ) : filteredItineraries.length === 0 ? (
          <div className="no-results">
            {savedItineraries.length === 0
              ? "You haven't saved any itineraries yet."
              : "No saved itineraries match your search or filters."}
            <br />
            {savedItineraries.length === 0 && (
              <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                Browse itineraries on the homepage and save them to see them here!
              </span>
            )}
          </div>
        ) : (
          // Display filtered itineraries using ItineraryCard component
          filteredItineraries.map((itinerary) => (
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
              currentUser={user}
            />
          ))
        )}

        {/* Filter modal */}
        {showFilterModal && (
          <div className="filter-modal-overlay">
            <div className="filter-modal">
              <div className="filter-modal-header">
                <h3>Filter Saved Itineraries</h3>
                <button className="close-btn" onClick={handleCloseFilter}>
                  ×
                </button>
              </div>

              <div className="filter-sections">
                {/* Rating Filter Section */}
                <div className="filter-section">
                  <label>Minimum Rating</label>
                  <div className="rating-filter">
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className={`rating-option ${filters.minRating === rating ? "active" : ""
                          }`}
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, minRating: rating }))
                        }
                      >
                        {rating === 0 ? "Any" : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter Section */}
                <div className="filter-section">
                  <label>Tags</label>
                  <div className="tags-filter">
                    {[
                      "park",
                      "outdoors",
                      "family",
                      "food",
                      "cultural",
                      "walking",
                      "museums",
                      "educational",
                      "indoor",
                    ].map((tag) => (
                      <button
                        key={tag}
                        className={`tag-option ${(filters.tags || []).includes(tag) ? "active" : ""
                          }`}
                        onClick={() => {
                          const currentTags = filters.tags || [];
                          const newTags = currentTags.includes(tag)
                            ? currentTags.filter((t) => t !== tag)
                            : [...currentTags, tag];
                          setFilters((prev) => ({ ...prev, tags: newTags }));
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Filter Section */}
                <div className="filter-section">
                  <label>Maximum Duration</label>
                  <div className="duration-filter">
                    {[
                      { value: "", label: "Any Duration" },
                      { value: "2 hours", label: "2 hours" },
                      { value: "4 hours", label: "4 hours" },
                      { value: "6 hours", label: "6 hours" },
                      { value: "1 day", label: "1 day" },
                      { value: "2 days", label: "2 days" },
                      { value: "3+ days", label: "3+ days" },
                    ].map((option) => (
                      <button
                        key={option.value || "any"}
                        className={`duration-option ${filters.maxDuration === option.value ? "active" : ""
                          }`}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            maxDuration: option.value,
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter Section */}
                <div className="filter-section">
                  <label>Maximum Price</label>
                  <div className="price-filter">
                    {[
                      { value: "", label: "Any Price" },
                      { value: "$", label: "$ - Budget" },
                      { value: "$$", label: "$$ - Moderate" },
                      { value: "$$$", label: "$$$ - Expensive" },
                      { value: "$$$$", label: "$$$$ - Luxury" },
                    ].map((option) => (
                      <button
                        key={option.value || "any"}
                        className={`price-option ${filters.maxPrice === option.value ? "active" : ""
                          }`}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            maxPrice: option.value,
                          }))
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter modal action buttons */}
              <div className="filter-modal-actions">
                <button className="reset-btn" onClick={handleClearFilters}>
                  Reset All
                </button>
                <button
                  className="apply-btn"
                  onClick={() => handleApplyFilters(filters)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Main page layout
  return (
    <div className="homepage">
      <div className="main-left">
        <Header
          onBack={onBack}
          user={user}
          onNavigateToProfile={onNavigateToProfile}
          onNavigateToHome={onNavigateToHome}
          onNavigateToCreated={onNavigateToCreated}
          onNavigateToSaved={onNavigateToSaved}
          onNavigateToCompleted={onNavigateToCompleted}
          onLogout={onLogout}
        />
        <Map selectedDestinations={selectedDestinations} />
      </div>

      <div className="sidebar-container">
        <SavedItinerariesSidebar />
      </div>
    </div>
  );
}

export default SavedItinerariesPage;