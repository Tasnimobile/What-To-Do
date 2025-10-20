import { useRef, useState } from "react";
import Destination from "./Destination";
import TextInputField from "./TextInputField";
import AddDestination from "./AddDestination";
import "./CreateNewItinerary.css";

export default function CreateNewItinerary({
  newItinerary,
  setNewItinerary,
  destinations,
  onAddDestinationClick,
  setCurrentPin,
  onSaveItinerary,
  onBack,
}) {
  const ITINERARY_THEMES = [
    "Activity",
    "Date",
    "Foodie",
    "Museum",
    "Nature",
    "Solo",
  ];

  const handleThemeChange = (e) => {
    const value = e.target.value;
    const newThemes = newItinerary.themes.includes(value)
      ? newItinerary.themes.filter((theme) => theme !== value)
      : [...newItinerary.themes, value];
    setNewItinerary((prev) => ({ ...prev, themes: newThemes }));
  };

  const saveThemes = () =>
    setNewItinerary((prev) => ({ ...prev, themesLocked: true }));

  const editThemes = () =>
    setNewItinerary((prev) => ({ ...prev, themesLocked: false }));

  const handleSave = () => {
    if (onSaveItinerary) {
      onSaveItinerary({
        ...newItinerary,
        destinations,
      });
    }
  };

  return (
    <div className="create-itinerary">
      <h1>New Itinerary</h1>

      <TextInputField
        id="enter-itinerary"
        type="single-line"
        value={newItinerary.name}
        onChange={(text) =>
          setNewItinerary((prev) => ({ ...prev, name: text }))
        }
      />

      <div className="theme-selector-wrapper">
        {!newItinerary.themesLocked ? (
          <div className="theme-selector">
            {ITINERARY_THEMES.map((theme) => (
              <label key={theme}>
                <input
                  type="checkbox"
                  value={theme}
                  checked={newItinerary.themes.includes(theme)}
                  onChange={handleThemeChange}
                />
                {theme}
              </label>
            ))}
            <button onClick={saveThemes}>Save Themes</button>
          </div>
        ) : (
          <div className="saved-themes">
            {newItinerary.themes.map((theme) => (
              <span key={theme} className="theme-tag">
                {theme}
              </span>
            ))}
            <button className="edit-themes-button" onClick={editThemes}>
              Edit
            </button>
          </div>
        )}
      </div>

      <TextInputField
        id="enter-description"
        type="description"
        value={newItinerary.description}
        onChange={(text) =>
          setNewItinerary((prev) => ({ ...prev, description: text }))
        }
      />

      <div className="destinations">
        {destinations.map((dest) => (
          <Destination
            key={dest.id}
            data={dest}
            onEdit={() => onAddDestinationClick(dest)}
            onDelete={() => onAddDestinationClick(dest, true)}
          />
        ))}
      </div>

      <div className="buttons">
        <button type="button" onClick={onAddDestinationClick}>
          + Add Destinations
        </button>
        <button onClick={handleSave}>Save</button>
        <button onClick={() => onBack && onBack(null)}>Cancel</button>
      </div>
    </div>
  );
}
