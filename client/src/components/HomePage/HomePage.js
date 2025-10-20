import React, { useState, useRef } from "react";
import Header from "./Header";
import Map from "./Map";
import Sidebar from "./Sidebar";
import "./HomePage.css";
import CreateNewItinerary from "./CreateNewItinerary";
import AddDestination from "./AddDestination";
import ItineraryPage from "./ItineraryPage";

function HomePage({ onBack }) {
  const [activeSidebar, setActiveSidebar] = useState("home");
  const historyRef = useRef(["home"]);
  const [destinations, setDestinations] = useState([]);
  const [currentPin, setCurrentPin] = useState(null);
  const [editingDestination, setEditingDestination] = useState(null);
  const [currentItinerary, setCurrentItinerary] = useState(null);
  const [newItinerary, setNewItinerary] = useState({
    name: "",
    description: "",
    themes: [],
    themesLocked: false,
  });

  const navigateTo = (newSidebar) => {
    if (newSidebar !== activeSidebar) {
      historyRef.current.push(activeSidebar);
      setActiveSidebar(newSidebar);
    }
  };

  const goToPrevious = () => {
    if (historyRef.current.length > 0) {
      const prev = historyRef.current.pop();
      setActiveSidebar(prev);
    }
  };

  const goHome = () => navigateTo("home");
  const goToCreate = () => navigateTo("createNew");
  const goToProfile = () => navigateTo("profile");
  const goToMy = () => navigateTo("mine");
  const goToSaved = () => navigateTo("saved");
  const logOut = () => {
    console.log("User logged out");
    navigateTo("home");
  };

  const handleAddDestinationSave = (newDest) => {
    setDestinations((prev) => {
      const exists = prev.find((d) => d.id === newDest.id);
      if (exists) {
        return prev.map((d) => (d.id === newDest.id ? newDest : d));
      } else {
        return [...prev, newDest];
      }
    });
    setCurrentPin(null);
    setEditingDestination(null);
    setActiveSidebar("createNew");
  };

  const handleAddDestinationCancel = () => {
    setCurrentPin(null);
    setActiveSidebar("createNew");
  };

  const handleSaveItinerary = ({ name, description, themes, destinations }) => {
    setCurrentItinerary({ name, description, themes, destinations });
    setActiveSidebar("viewItinerary");
  };

  const renderSidebar = () => {
    switch (activeSidebar) {
      //   case "mine":
      //     return <MyItineraries onBack={goToPrevious} />;
      //   case "saved":
      //     return <SavedItineraries onBack={goToPrevious} />;
      case "createNew":
        return (
          <CreateNewItinerary
            newItinerary={newItinerary}
            setNewItinerary={setNewItinerary}
            destinations={destinations}
            onAddDestinationClick={() => setActiveSidebar("addDestination")}
            setCurrentPin={setCurrentPin}
            onSaveItinerary={handleSaveItinerary}
            onBack={goToPrevious}
          />
        );

      case "addDestination":
        return (
          <AddDestination
            onSave={handleAddDestinationSave}
            onCancel={() => {
              setCurrentPin(null);
              setEditingDestination(null);
              setActiveSidebar("createNew");
            }}
            mapCoords={currentPin}
            setMapCoords={setCurrentPin}
            initialData={editingDestination}
          />
        );
      case "viewItinerary":
        return <ItineraryPage itinerary={currentItinerary} />;
      case "home":
      default:
        return <Sidebar onCreateNew={goToCreate} />;
    }
  };

  const mapSelectedCoords =
    activeSidebar === "addDestination"
      ? currentPin
        ? [currentPin]
        : []
      : destinations.map((d) => d.coords);

  return (
    <div className="homepage">
      <div className="main-left">
        <Header
          goHome={goHome}
          goToPrevious={historyRef.current.length > 0 ? goToPrevious : null}
          goToProfile={goToProfile}
          goToMyItineraries={goToMy}
          goToSavedItineraries={goToSaved}
          logOut={logOut}
        />
        <Map selectedCoords={mapSelectedCoords} onClick={setCurrentPin} />
      </div>

      <div className="sidebar-container">
        {renderSidebar()}
        {/* <CreateNewItinerary
          newItinerary={newItinerary}
          setNewItinerary={setNewItinerary}
          destinations={destinations}
          onAddDestinationClick={() => setActiveSidebar("addDestination")}
          setCurrentPin={setCurrentPin}
          onSaveItinerary={handleSaveItinerary}
          onBack={goToPrevious}
        /> */}
      </div>
    </div>
  );
}

export default HomePage;
