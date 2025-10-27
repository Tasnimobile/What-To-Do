// SavedItinerariesPage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import "../HomePage/HomePage.css";

function SavedItinerariesPage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onViewItinerary,
  onNavigateToSaved,
  onNavigateToCreated,
  onLogout,
  showError,
}) {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const processTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
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

  useEffect(() => {
    loadSavedItineraries();
  }, [user]);

  const loadSavedItineraries = () => {
    setIsLoading(true);
    try {
      const saved = localStorage.getItem("savedItineraries");
      if (saved) {
        const allSaved = JSON.parse(saved);
        const userSaved = allSaved.filter(
          (itinerary) => itinerary.savedBy === (user?.id || "current-user")
        );
        const processedItineraries = userSaved.map((itinerary) => ({
          ...itinerary,
          tags: processTags(itinerary.tags),
          title: itinerary.title || "Untitled Itinerary",
          description: itinerary.description || "",
          duration: itinerary.duration || "1 day",
          price: itinerary.price || "$$",
          rating: itinerary.rating || 0,
          destinations: itinerary.destinations || [],
        }));
        setSavedItineraries(userSaved);
        setSavedItineraries(processedItineraries);
        console.log("User saved itineraries loaded:", userSaved);
      } else {
        console.log("No saved itineraries found in localStorage");
        setSavedItineraries([]);
      }
    } catch (error) {
      console.error("Error loading saved itineraries:", error);
      setSavedItineraries([]);
      if (showError) showError("Failed to load saved itineraries.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleViewItinerary = (itinerary) => {
    if (onViewItinerary) {
      onViewItinerary(itinerary);
    }
  };

  const SavedItinerariesSidebar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
      minRating: 0,
      tags: [],
      maxDuration: "",
      maxPrice: "",
    });

    const handleSearch = (e) => setSearchTerm(e.target.value);
    const handleFilterClick = () => setShowFilterModal(true);
    const handleApplyFilters = (newFilters) => {
      setFilters(newFilters);
      setShowFilterModal(false);
    };
    const handleCloseFilter = () => setShowFilterModal(false);
    const handleClearFilters = () =>
      setFilters({
        minRating: 0,
        tags: [],
        maxDuration: "",
        maxPrice: "",
      });

    const handleItineraryClick = (itineraryId) => {
      const itinerary = filteredItineraries.find(
        (item) => item.id === itineraryId
      );
      if (itinerary) handleViewItinerary(itinerary);
    };

    const durationToHours = (duration) => {
      if (!duration) return 0;
      if (typeof duration !== "string") return 0;
      if (duration.includes("hour")) return parseInt(duration) || 0;
      if (duration.includes("day")) return (parseInt(duration) || 1) * 24;
      return 0;
    };

    const priceToNumber = (price) => {
      if (!price) return 0;
      if (typeof price !== "string") return 0;
      return price.length;
    };

    const filteredItineraries = savedItineraries.filter((itinerary) => {
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
        matchesDuration =
          durationToHours(itinerary.duration) <=
          durationToHours(filters.maxDuration);
      }

      let matchesPrice = true;
      if (filters.maxPrice) {
        matchesPrice =
          priceToNumber(itinerary.price) <= priceToNumber(filters.maxPrice);
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
        <h1>My Saved Itineraries</h1>

        <div className="search-filter">
          <input
            type="text"
            placeholder="Search saved itineraries..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={handleFilterClick}>
            Filter {hasActiveFilters && "•"}
          </button>
        </div>

        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}

        {isLoading ? (
          <div className="no-results">Loading saved itineraries...</div>
        ) : filteredItineraries.length === 0 ? (
          <div className="no-results">
            {savedItineraries.length === 0
              ? "You haven't saved any itineraries yet."
              : "No saved itineraries match your search or filters."}
          </div>
        ) : (
          filteredItineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className="itinerary-card"
              onClick={() => handleItineraryClick(itinerary.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="itinerary-header">
                <h3>{itinerary.title}</h3>
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
              <p className="collapsed-description">{itinerary.description}</p>
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
                <div className="filter-section">
                  <label>Minimum Rating</label>
                  <div className="rating-filter">
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className={`rating-option ${
                          filters.minRating === rating ? "active" : ""
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
                        className={`tag-option ${
                          (filters.tags || []).includes(tag) ? "active" : ""
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
                        className={`duration-option ${
                          filters.maxDuration === option.value ? "active" : ""
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
                        className={`price-option ${
                          filters.maxPrice === option.value ? "active" : ""
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
        <SavedItinerariesSidebar />
      </div>
    </div>
  );
}

export default SavedItinerariesPage;
