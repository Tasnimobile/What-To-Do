import { useRef } from "react";
import ItineraryCard from "./ItineraryCard";
import "./Sidebar.css";

export default function SavedItineraries() {
  const searchRef = useRef();

  const handleSearch = () => {
    console.log("Search Saved Itineraries:", searchRef.current.value);
  };

  return (
    <div className="sidebar">
      <h1>Saved Itineraries</h1>
      <div className="search-filter">
        <input type="text" placeholder="Search" ref={searchRef} />
        <button onClick={handleSearch}>Filter</button>
      </div>

      <ItineraryCard
        title="Saved Itinerary 1"
        rating={5}
        description="Description of Saved Itinerary 1"
      />
      <ItineraryCard
        title="Saved Itinerary 2"
        rating={4}
        description="Description of Saved Itinerary 2"
      />
      <ItineraryCard
        title="Saved Itinerary 3"
        rating={3}
        description="Description of Saved Itinerary 3"
      />
    </div>
  );
}
