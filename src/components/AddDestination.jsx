import React, { useState, useRef, useEffect } from "react";
import "./AddDestination.css";

export default function AddDestination({
  onSave,
  onCancel,
  mapCoords,
  setMapCoords,
  initialData,
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setCategory(initialData.category || "");
      setNotes(initialData.notes || "");
      if (initialData.coords) {
        setMapCoords(initialData.coords);
      }
    } else {
      setName("");
      setCategory("");
      setNotes("");
      setMapCoords(null);
    }
  }, [initialData, setMapCoords]);

  useEffect(() => {
    if (window.google && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["establishment", "geocode"],
          fields: ["geometry", "name", "formatted_address"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          setMapCoords({ lat, lng });
          setName(place.name || place.formatted_address || "");
        }
      });
    }
  }, [setMapCoords]);

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a destination name.");
      return;
    }
    if (!category) {
      alert("Please select a category.");
      return;
    }
    if (!mapCoords) {
      alert("Please drop a pin or select a location on the map.");
      return;
    }

    onSave({
      id: initialData?.id || Date.now(),
      name,
      coords: mapCoords,
      category,
      notes,
    });
  };

  return (
    <div className="add-destination-page">
      <h1>{initialData ? "Edit Destination" : "Add New Destination"}</h1>

      <div className="input-group">
        <label>Destination:</label>
        <input
          type="text"
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Search or drop a pin on the map"
        />
      </div>

      <div className="input-group">
        <label>Category:</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select category</option>
          <option value="bakery">Bakery</option>
          <option value="bar">Bar</option>
          <option value="cafe">Cafe</option>
          <option value="museum">Museum</option>
          <option value="park">Park</option>
          <option value="restaurant">Restaurant</option>
          <option value="store">Store</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="input-group">
        <label>Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this location..."
        />
      </div>

      <div className="buttons">
        <button onClick={handleSave}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
