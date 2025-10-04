import React, { useState } from "react";
import CreateNewItinerary from "../components/CreateNewItinerary.jsx";
import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import SavedItineraries from "../components/SavedItineraries.jsx";
import MyItineraries from "../components/MyItineraries.jsx";
import Map from "./Map.jsx";
import "./Homepage.css";

export default function Homepage() {
  const [activeSidebar, setActiveSidebar] = useState("sidebar");
  const goToCreate = () => setActiveSidebar("create");
  const goToSaved = () => setActiveSidebar("saved");
  const goToMy = () => setActiveSidebar("mine");
  const goBack = () => setActiveSidebar("sidebar");

  return (
    <div className="homepage">
      <div className="main-left">
        <Header
          onBack={goBack}
          goToSavedItineraries={goToSaved}
          goToMyItineraries={goToMy}
        />
        <div className="map-placeholder">
          <Map />
        </div>
      </div>

      <div className="sidebar-container">
        {activeSidebar === "sidebar" && <Sidebar onCreateNew={goToCreate} />}
        {activeSidebar === "create" && <CreateNewItinerary onBack={goBack} />}
        {activeSidebar === "saved" && <SavedItineraries onBack={goBack} />}
        {activeSidebar === "mine" && <MyItineraries onBack={goBack} />}
      </div>
    </div>
  );
}
