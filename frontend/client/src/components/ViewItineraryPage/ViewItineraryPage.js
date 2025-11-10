// ViewItineraryPage.js
import React, { useState, useEffect } from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import ViewItinerarySidebar from "./ViewItinerarySidebar";
import "../HomePage/HomePage.css";

function ViewItineraryPage({
  itinerary,
  user,
  onBack,
  onNavigateToProfile,
  onNavigateToHome,
  onNavigateToCreated,
  onNavigateToSaved,
  onNavigateToCompleted,
  onNavigateToEdit,
  onRateItinerary,
  onLogout,
}) {
  const [currentItinerary, setCurrentItinerary] = useState(itinerary);

  // Sync local state when itinerary prop changes
  useEffect(() => {
    setCurrentItinerary(itinerary);
  }, [itinerary]);

  // Lifted rating handler
  const handleRateItinerary = async (id, rating) => {
    if (!onRateItinerary) return;

    try {
      const updated = await onRateItinerary(id, rating);

      // Update local state to trigger re-render everywhere
      setCurrentItinerary((prev) => ({
        ...prev,
        userRating: rating,
        rating: updated?.overallRating ?? prev.rating,
      }));

      return updated;
    } catch (err) {
      console.error("Error updating rating:", err);
      return null;
    }
  };

  // Map destinations for map display
  const mapDestinations = currentItinerary?.destinations || [];

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
        <Map selectedDestinations={mapDestinations} isViewMode={true} />
      </div>

      <div className="sidebar-container">
        <ViewItinerarySidebar
          itinerary={currentItinerary}
          onBack={onBack}
          user={user}
          onNavigateToEdit={onNavigateToEdit}
          onRateItinerary={handleRateItinerary}
        />
      </div>
    </div>
  );
}

export default ViewItineraryPage;
