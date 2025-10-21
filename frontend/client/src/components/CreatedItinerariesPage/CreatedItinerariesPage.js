// CreatedItinerariesPage.js 
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import "../HomePage/HomePage.css";
import "./CreatedItinerariesPage.css";

function CreatedItinerariesPage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onViewItinerary,
  onNavigateToCreate,
  onNavigateToSaved,
  onLogout,
  onNavigateToCreated,
  showError,
}) {
  // State for user's created itineraries
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [userItineraries, setUserItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Process tags from various formats (array, string, JSON string)
  const processTags = (tags) => {
    if (!tags) return [];

    if (Array.isArray(tags)) {
      return tags;
    }

    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Failed to parse tags as JSON:', e);
        return [];
      }
    }

    return [];
  };

  // Load user's created itineraries on component mount
  useEffect(() => {
    loadUserItineraries();
  }, [user]);

  // Debug function to check itinerary data
  const debugUserItineraries = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/debug/my-itineraries", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      const debugData = await response.json();
      console.log('Debug API response:', debugData);

      if (debugData.itineraries && Array.isArray(debugData.itineraries)) {
        const processed = debugData.itineraries.map(itinerary => ({
          ...itinerary,
          tags: processTags(itinerary.tags),
          title: itinerary.title || 'Untitled Itinerary',
          description: itinerary.description || '',
          duration: itinerary.duration || '1 day',
          price: itinerary.price || '$$',
          rating: 0,
          destinations: [],
          createdBy: itinerary.authorid || user?.id
        }));

        setUserItineraries(processed);
      } else {
        setUserItineraries([]);
      }
    } catch (error) {
      console.error('Debug fetch failed:', error);
      setUserItineraries([]);
    }
  };

  // Main function to load user itineraries from API
  const loadUserItineraries = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching user itineraries for user:', user?.id);

      const response = await fetch("http://localhost:3000/api/my-itineraries", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        console.log('API Response for user itineraries:', data);

        let userItinerariesFromDB = [];

        if (data.ok && Array.isArray(data.itineraries)) {
          userItinerariesFromDB = data.itineraries;
        } else {
          console.error('Unexpected API response structure:', data);
          userItinerariesFromDB = [];
        }

        // Process and format itinerary data for display
        const processedItineraries = userItinerariesFromDB.map(itinerary => ({
          ...itinerary,
          tags: processTags(itinerary.tags),
          title: itinerary.title || 'Untitled Itinerary',
          description: itinerary.description || '',
          duration: itinerary.duration || '1 day',
          price: itinerary.price || '$$',
          rating: itinerary.rating || 0,
          destinations: itinerary.destinations || [],
          createdBy: itinerary.createdBy || itinerary.authorid || user?.id || 'unknown'
        }));

        console.log('User itineraries loaded from database:', processedItineraries);
        setUserItineraries(processedItineraries);
      } else {
        console.error('Failed to fetch user itineraries from server, status:', response.status);
        setUserItineraries([]);
        if (showError) {
          showError('Failed to load your itineraries from server.');
        }
      }
    } catch (error) {
      console.error('Error loading user itineraries from server:', error);
      setUserItineraries([]);
      if (showError) {
        showError('Error loading your itineraries. Please check your connection.');
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
    console.log('Viewing itinerary:', itinerary);
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  // Handler for creating new itinerary
  const handleCreateNew = () => {
    console.log("Create new clicked in CreatedItinerariesPage");
    if (onNavigateToCreate) {
      onNavigateToCreate();
    } else {
      console.error("onNavigateToCreate is not defined");
    }
  };

  // Sidebar component for displaying user's itineraries
  const CreatedItinerariesSidebar = () => {
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

    // Handler for clicking on itinerary card
    const handleItineraryClick = (itineraryId) => {
      const itinerary = filteredItineraries.find(
        (item) => item.id === itineraryId
      );
      if (itinerary) {
        handleViewItinerary(itinerary);
      }
    };

    // Utility functions for filtering
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

    const priceToNumber = (price) => {
      if (!price) return 0;
      if (typeof price !== "string") return 0;
      return price.length;
    };

    // Filter itineraries based on search and filter criteria
    const filteredItineraries = (Array.isArray(userItineraries) ? userItineraries : []).filter((itinerary) => {
      if (!itinerary || typeof itinerary !== 'object') {
        return false;
      }

      const matchesSearch =
        searchTerm === "" ||
        (itinerary.title &&
          itinerary.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (itinerary.description &&
          itinerary.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

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
        <h1>My Created Itineraries</h1>

        {/* Create new itinerary header */}
        <h2
          className="create-new-header"
          onClick={handleCreateNew}
          style={{ cursor: "pointer" }}
        >
          Create New
        </h2>

        {/* Search and filter controls */}
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search my itineraries..."
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
          <div className="no-results">
            Loading your itineraries...
          </div>
        ) : filteredItineraries.length === 0 ? (
          <div className="no-results">
            {userItineraries.length === 0
              ? "You haven't created any itineraries yet."
              : "No itineraries match your search or filters."}
            <br />
            {userItineraries.length === 0 && (
              <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                Create your first itinerary to see it here!
              </span>
            )}
          </div>
        ) : (
          // Display filtered itineraries as cards
          filteredItineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="itinerary-card"
              onClick={() => handleItineraryClick(itinerary.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="itinerary-header">
                <h3>{itinerary.title || 'Untitled Itinerary'}</h3>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= (itinerary.rating || 0) ? "star filled" : "star"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="collapsed-description">
                {itinerary.description || 'No description provided.'}
              </p>
              <div className="itinerary-meta">
                <span className="meta-item">{itinerary.duration}</span>
                <span className="meta-item">{itinerary.price}</span>
                <span className="meta-item">
                  {(itinerary.destinations || []).length} destinations
                </span>
              </div>
              <button
                className="read-more"
                onClick={(e) => {
                  e.stopPropagation();
                  handleItineraryClick(itinerary.id);
                }}
              >
                View Details
              </button>
            </div>
          ))
        )}

        {/* Filter modal */}
        {showFilterModal && (
          <div className="filter-modal-overlay">
            <div className="filter-modal">
              <div className="filter-modal-header">
                <h3>Filter My Itineraries</h3>
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
                <button className="apply-btn" onClick={handleApplyFilters}>
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
          onLogout={onLogout}
        />
        <Map selectedDestinations={selectedDestinations} />
      </div>

      <div className="sidebar-container">
        <CreatedItinerariesSidebar />
      </div>
    </div>
  );
}

export default CreatedItinerariesPage;