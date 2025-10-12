import { useRef } from "react";
import ItineraryCard from "./ItineraryCard";
import "./Sidebar.css";

export default function MyItineraries({ onCreateNew }) {
  const searchRef = useRef();

  const handleSearch = () => {
    console.log("Search My Itineraries:", searchRef.current.value);
  };

  return (
    <div className="sidebar">
      <h1>My Itineraries</h1>
      <div className="search-filter">
        <input type="text" placeholder="Search" ref={searchRef} />
        <button onClick={handleSearch}>Filter</button>
      </div>

      <ItineraryCard
        title="My Itinerary 1"
        rating={5}
        description="Description of My Itinerary 1"
      />
      <ItineraryCard
        title="My Itinerary 2"
        rating={4}
        description="Description of My Itinerary 2"
      />
      <ItineraryCard
        title="My Itinerary 3"
        rating={3}
        description="Description of My Itinerary 3"
      />
    </div>
  );
}
