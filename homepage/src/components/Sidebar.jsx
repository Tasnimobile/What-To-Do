import { useState } from "react";
import ItineraryCard from "./ItineraryCard";
import "./Sidebar.css";

export default function Sidebar({ onCreateNew }) {
  const [searchValue, setSearchValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };
  return (
    <div className="sidebar">
      <h1>Itineraries</h1>
      <button id="create-new" onClick={onCreateNew}>
        Create New
      </button>

      <div className="search-filter">
        <input
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button>Filter</button>
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
