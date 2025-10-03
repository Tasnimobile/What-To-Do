import { useState } from "react";
import CreateNewItinerary from "../components/CreateNewItinerary";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./Homepage.css";

export default function Homepage() {
  const [activeSidebar, setActiveSidebar] = useState("sidebar");
  const goToCreate = () => setActiveSidebar("create");
  const goBack = () => setActiveSidebar("sidebar");

  return (
    <div className="homepage">
      <div className="main-left">
        <Header onBack={goBack} />
        <div className="map-placeholder">
          <p>Map Placeholder</p>
        </div>
      </div>

      <div className="sidebar-container">
        {activeSidebar === "sidebar" && <Sidebar onCreateNew={goToCreate} />}
        {activeSidebar === "create" && <CreateNewItinerary onBack={goBack} />}
      </div>
    </div>
  );
}
