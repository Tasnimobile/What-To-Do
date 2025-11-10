// src/components/ViewItineraryPage/ViewItinerarySidebar.js
import React, { useState, useEffect } from "react";
import "./ViewItinerarySidebar.css";
import { useNavigate } from "react-router-dom";

const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    let s = v.trim();
    if (s.startsWith("`") && s.endsWith("`")) s = s.slice(1, -1); // strip stray backticks
    try {
      const p = JSON.parse(s);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
};
const toNumber = (v, d = 0) => (v == null ? d : Number(v) || d);

function ItineraryBookmark() {
  const [bookmarked, setBookmarked] = useState(false);

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <button className="bookmark-icon" onClick={toggleBookmark}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          d="M19 21l-7-5-7 5V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v16z"
          fill={bookmarked ? "#E71D36" : "#5f5f5f"}
        />
      </svg>
    </button>
  );
}

function ViewItinerarySidebar({ itinerary, onBack, user, onNavigateToEdit }) {
  // State for completed status
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    if (itinerary) {
      console.log("Current user ID:", user?.id);
      console.log("Itinerary author username:", itinerary.authorname);
    }
  }, [user, itinerary]);

  const normalized = React.useMemo(() => {
    if (!itinerary) return null;
    return {
      ...itinerary,
      tags: toArray(itinerary.tags),
      destinations: toArray(itinerary.destinations),
      rating: toNumber(itinerary.rating, 0),
    };
  }, [itinerary]);

  if (!normalized) {
    return (
      <div className="view-itinerary-sidebar">
        <div className="create-header">
          <h1>View Itinerary</h1>
        </div>
        <div className="create-form-card">
          <div className="error-message">
            <h2>Itinerary Not Found</h2>
            <p>The requested itinerary could not be loaded.</p>
          </div>
        </div>
        <div className="create-actions">
          <button className="save-btn" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const {
    id,
    title = "Untitled Itinerary",
    authorname = "",
    description = "No description provided.",
    rating = 0,
    tags = [],
    duration = "Not specified",
    price = "Not specified",
    destinations = [],
    authorid,
  } = normalized;

  // Handler for toggling completed itineraries
  const handleToggleCompleted = () => {
    setCompleted((prev) => !prev);
  };

  // Only show author options to edit/delete
  const isAuthor = String(user?.id) === String(authorid);
  const handleEdit = () => {
    console.log("Edit button clicked for itinerary:", id);
    if (onNavigateToEdit) {
      onNavigateToEdit(itinerary);
    }
  };
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this itinerary?"))
      return;
    try {
      const res = await fetch(`http://localhost:3000/api/delete-itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: id
        }),
      });
      onBack()


    } catch (err) {
      console.error(err);
      alert("Error deleting itinerary");
    }
  };

  return (
    <div className="view-itinerary-sidebar">
      {/* Itinerary Title Header */}
      <div className="create-header">
        <div className="title-row">
          <ItineraryBookmark />
          <h1 className="itinerary-main-title">{title}</h1>
        </div>
        <p className="itinerary-author">Created by: {authorname}</p>
      </div>

      {/* Main Itinerary Details Card */}
      <div className="create-form-card">
        {/* Description Section */}
        <div className="form-section">
          <div className="input-group">
            <div className="view-field">
              <label className="form-label">Description</label>
              <div className="view-value description">{description}</div>
            </div>
          </div>

          {/* Duration and Price Section */}
          <div className="form-row">
            <div className="input-group duration-dropdown-wrapper">
              <div className="view-field">
                <label className="form-label">Duration</label>
                <div className="view-value">{duration}</div>
              </div>
            </div>

            <div className="input-group price-select-wrapper">
              <div className="view-field">
                <label className="form-label">Price Level</label>
                <div className="view-value">{price}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Section with Star Display */}
        <div className="form-section">
          <div className="input-group">
            <div className="view-field">
              <label className="form-label">Rating</label>
              <div className="rating-display">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < rating ? "star filled" : "star"}>
                    ★
                  </span>
                ))}
                <span className="rating-text">({rating}/5)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section (only shown if tags exist) */}
        {tags.length > 0 && (
          <div className="form-section">
            <div className="input-group">
              <div className="view-field">
                <label className="form-label">Tags</label>
                <div className="tags-container">
                  {tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Destinations Section */}
        <div className="form-section">
          <div className="input-group">
            <div className="view-field">
              <label className="form-label">
                Destinations ({destinations.length})
              </label>
              {destinations.length > 0 ? (
                <div className="destinations-list">
                  {destinations.map((destination, index) => (
                    <div
                      key={destination.id || index}
                      className="destination-item view-destination"
                    >
                      <div className="destination-order">{index + 1}</div>
                      <div className="destination-info">
                        <div className="destination-name">
                          {destination.name || `Destination ${index + 1}`}
                        </div>
                        {destination.address && (
                          <div className="destination-address">
                            {destination.address}
                          </div>
                        )}
                        {destination.rating && (
                          <div className="destination-rating">
                            <span className="star-icon">★</span>
                            <span>{destination.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-destinations">
                  No destinations added to this itinerary.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button (Save Itinerary and Mark as Completed) */}
      <div className="create-actions">
        <button className="completed-btn" onClick={handleToggleCompleted}>
          {completed ? "Completed!" : "Completed?"}
        </button>
        {isAuthor && (
          <>
            <button className="save-btn" onClick={handleEdit}>
              Edit
            </button>
            <button className="save-btn" onClick={handleDelete}>
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewItinerarySidebar;