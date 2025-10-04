import { useState } from "react";
import ItineraryCard from "./ItineraryCard";
import "./Sidebar.css";

export default function SavedItineraries({ onCreateNew }) {
  const [searchValue, setSearchValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };
  return (
    <div className="sidebar">
      <h1>Saved Itineraries</h1>

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
