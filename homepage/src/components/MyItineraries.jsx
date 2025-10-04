import { useState } from "react";
import ItineraryCard from "./ItineraryCard";
import "./Sidebar.css";

export default function MyItineraries({ onCreateNew }) {
  const [searchValue, setSearchValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };
  return (
    <div className="sidebar">
      <h1>My Itineraries</h1>

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
