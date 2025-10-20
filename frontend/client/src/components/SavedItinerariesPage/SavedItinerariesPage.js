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
}) {
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [savedItineraries, setSavedItineraries] = useState([]);

  useEffect(() => {
    loadSavedItineraries();
  }, [user]);

  const loadSavedItineraries = () => {
    try {
      const saved = localStorage.getItem("savedItineraries");
      if (saved) {
        const allSaved = JSON.parse(saved);
        const userSaved = allSaved.filter(
          (itinerary) => itinerary.savedBy === (user?.id || "current-user")
        );
        setSavedItineraries(userSaved);
        console.log("User saved itineraries loaded:", userSaved);
      } else {
        console.log("No saved itineraries found in localStorage");
        setSavedItineraries([]);
      }
    } catch (error) {
      console.error("Error loading saved itineraries:", error);
      setSavedItineraries([]);
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

        {filteredItineraries.length === 0 ? (
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
              {/* Same filter sections as CreatedItinerariesSidebar */}
              {/* ...reuse your existing filter modal JSX here... */}
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
