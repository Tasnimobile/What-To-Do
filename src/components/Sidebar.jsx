import { useRef } from "react";
import ItineraryCard from "./ItineraryCard";
import "./Sidebar.css";

export default function Sidebar({ onCreateNew }) {
  const searchRef = useRef();
  const handleSearch = () => {
    console.log("Search term:", searchRef.current.value);
  };

  return (
    <div className="sidebar">
      <h1>Itineraries</h1>
      <button id="create-new" onClick={onCreateNew}>
        Create New Itinerary
      </button>

      <div className="search-filter">
        <input type="text" placeholder ref={searchRef} />
        <button onClick={handleSearch}>Filter</button>
      </div>

      <ItineraryCard
        title="Itinerary 1"
        rating={5}
        description="Description of Itinerary 1"
      />
      <ItineraryCard
        title="Itinerary 2"
        rating={4}
        description="Description of Itinerary 2"
      />
      <ItineraryCard
        title="Itinerary 3"
        rating={3}
        description="Description of Itinerary 3"
      />
    </div>
  );
}
