import { useState } from "react";
import CreateNewItinerary from "../components/CreateNewItinerary";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./Homepage.css";
import SavedItineraries from "../components/SavedItineraries";

export default function Homepage() {
  const [activeSidebar, setActiveSidebar] = useState("sidebar");
  const goToCreate = () => setActiveSidebar("create");
  const goToSaved = () => setActiveSidebar("saved");
  const goBack = () => setActiveSidebar("sidebar");

  return (
    <div className="homepage">
      <div className="main-left">
        <Header onBack={goBack} goToSavedItineraries={goToSaved} />
        <div className="map-placeholder">
          <p>Map Placeholder</p>
        </div>
      </div>

      <div className="sidebar-container">
        {activeSidebar === "sidebar" && <Sidebar onCreateNew={goToCreate} />}
        {activeSidebar === "create" && <CreateNewItinerary onBack={goBack} />}
        {activeSidebar === "saved" && <SavedItineraries onBack={goBack} />}
      </div>
    </div>
  );
}
