import { useRef, useState } from "react";
import Destination from "./Destination";
import TextInputField from "./TextInputField";
import AddDestination from "./AddDestination";
import "./CreateNewItinerary.css";

export default function CreateNewItinerary({
  onBack,
  destinations,
  onAddDestinationClick,
  setCurrentPin,
  onUpdateDestination, // New prop to update destination in parent state
}) {
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const [addingDestination, setAddingDestination] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null); // New

  const handleSave = () => {
    console.log("Saving new itinerary:", {
      title: titleRef.current,
      description: descRef.current,
      destinations: destinations.map((d) => d.name),
    });
    onBack();
  };

  const handleAddDestinationClick = () => {
    setCurrentPin(null); // clear temp pin for new destination
    setEditingDestination(null); // not editing
    onAddDestinationClick();
  };

  const handleEditDestination = (dest) => {
    setCurrentPin(dest.coords); // preload pin
    setEditingDestination(dest); // local editing state
    onAddDestinationClick(dest); // pass the destination being edited
  };

  return (
    <div className="create-itinerary">
      <h1>New Itinerary</h1>

      <TextInputField
        id="enter-itinerary"
        initialText="Enter itinerary name"
        type="single-line"
        onChange={(text) => (titleRef.current = text)}
      />

      <TextInputField
        id="enter-description"
        label="Description"
        type="description"
        onChange={(text) => (descRef.current = text)}
      />

      <div className="destinations">
        {destinations.map((dest) => (
          <Destination
            key={dest.id}
            id={dest.id}
            data={dest}
            onChange={() => {}} // optional
            onEdit={() => handleEditDestination(dest)} // existing handler
            onDelete={() => {
              // Minimal delete logic
              const updated = destinations.filter((d) => d.id !== dest.id);
              setDestinations(updated); // assumes you have setDestinations from state
            }}
          />
        ))}
      </div>

      <div className="buttons">
        <button type="button" onClick={handleAddDestinationClick}>
          + Add Destinations
        </button>
        <button onClick={handleSave}>Save</button>
        <button onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}
