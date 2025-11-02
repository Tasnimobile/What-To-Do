// src/components/ViewItineraryPage/ViewItineraryPage.js
import React from "react";
import Header from "../HomePage/Header";
import Map from "../HomePage/Map";
import ViewItinerarySidebar from "./ViewItinerarySidebar";
import "../HomePage/HomePage.css";

function ViewItineraryPage({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onNavigateToCreated,
  onNavigateToSaved,
  onNavigateToCompleted,
  itinerary,
  onLogout,
}) {
  console.log("ViewItineraryPage received itinerary:", itinerary);

  // Navigation handlers for header component
  const handleNavigateToHome = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleNavigateToCreated = () => {
    if (onNavigateToCreated) {
      onNavigateToCreated();
    }
  };

  // Extract destinations for map display
  const mapDestinations = itinerary?.destinations || [];

  return (
    <div className="homepage">
      {/* Left side: Header and Map */}
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
        {/* Map showing itinerary destinations in view-only mode */}
        <Map selectedDestinations={mapDestinations} isViewMode={true} />
      </div>

      {/* Right side: Itinerary details sidebar */}
      <div className="sidebar-container">
        <ViewItinerarySidebar
          itinerary={itinerary}
          onBack={onBack}
          user={user}
          onItineraryUpdated={() => window.location.reload()}
        />
      </div>
    </div>
  );
}

export default ViewItineraryPage;
