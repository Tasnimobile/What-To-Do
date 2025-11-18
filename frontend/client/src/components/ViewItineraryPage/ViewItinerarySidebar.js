// ViewItinerarySidebar.js 
import React, { useState, useEffect, useMemo } from "react";
import "./ViewItinerarySidebar.css";

function ViewItinerarySidebar({
  itinerary,
  onBack,
  user,
  onNavigateToEdit,
  onRateItinerary,
}) {
  const [completed, setCompleted] = useState(false);
  const [currentUserRating, setCurrentUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const LS_KEY = "rated_itins";
  const getMap = () => JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  const setMap = (m) => localStorage.setItem(LS_KEY, JSON.stringify(m));
  const hasRatedLocal = (userId, itineraryId) => {
    const u = String(userId || "anon");
    const m = getMap();
    return !!m[u]?.[String(itineraryId)];
  };
  const markRatedLocal = (userId, itineraryId) => {
    const u = String(userId || "anon");
    const m = getMap();
    m[u] = m[u] || {};
    m[u][String(itineraryId)] = true;
    setMap(m);
  };

  // Use the itinerary data directly
  const normalized = useMemo(() => {
    if (!itinerary) return null;

    console.log("ViewItinerarySidebar received itinerary:", itinerary);

    return {
      ...itinerary,
      tags: Array.isArray(itinerary.tags) ? itinerary.tags : [],
      destinations: Array.isArray(itinerary.destinations) ? itinerary.destinations : [],
      title: itinerary.title || "Untitled Itinerary",
      description: itinerary.description || "No description",
      duration: itinerary.duration || "1 day",
      price: itinerary.price || "$$",
      rating: parseFloat(itinerary.rating) || 0,
      overallRating: parseFloat(itinerary.rating) || 0,
      userRating: itinerary.userRating || 0,
      authorname: itinerary.authorname || "Unknown",
      authorid: itinerary.authorid,
    };
  }, [itinerary]);

  // Sync local ratings when itinerary changes
  useEffect(() => {
    if (normalized) {
      setCurrentUserRating(normalized.userRating);
      console.log("Setting ratings:", {
        userRating: normalized.userRating,
        overallRating: normalized.overallRating
      });
    }
  }, [normalized?.id, normalized?.userRating, normalized?.overallRating]);

  const savedIds = useMemo(() => {
    if (!user || !user.saved_itineraries) return [];
    try {
      const arr = JSON.parse(user.saved_itineraries);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, [user?.saved_itineraries]);

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
    title,
    authorname,
    description,
    tags,
    duration,
    price,
    destinations,
    authorid,
    rating,
    overallRating,
  } = normalized;

  const isBookmarked = savedIds.includes(id);

  const canRate =
    user &&
    authorid !== undefined &&
    user.id !== undefined &&
    authorid.toString() !== user.id.toString() &&
    !hasRatedLocal(user?.id, id);
  const isAuthor = String(user?.id) === String(authorid);

  // Rating handler
  const handleRate = async (rating) => {
    if (!canRate) return;
    setCurrentUserRating(rating);
    try {
      const updated = await onRateItinerary(id, rating);
      if (updated && updated.ok) {
        markRatedLocal(user?.id, id);
      } else if (updated && updated.status === 409) {
        markRatedLocal(user?.id, id);
      }
    } catch (err) {
      console.error("Error updating rating:", err);
    }
  };

  function ItineraryBookmark({ id, initialBookmarked }) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);

    useEffect(() => {
      setBookmarked(initialBookmarked);
    }, [initialBookmarked]);

    const handleClick = async () => {
      setBookmarked((prev) => !prev);
      try {
        await fetch("http://localhost:3000/api/save-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ saved_itinerary: id }),
        });
      } catch (err) {
        console.error(err);
        alert("Error saving itinerary");
      }
    };

    return (
      <button
        className="bookmark-icon"
        onClick={handleClick}
      >
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

  const handleToggleCompleted = () => setCompleted((prev) => !prev);
  const handleEdit = () => onNavigateToEdit && onNavigateToEdit(itinerary);
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this itinerary?"))
      return;
    try {
      await fetch("http://localhost:3000/api/delete-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      onBack();
    } catch (err) {
      console.error(err);
      alert("Error deleting itinerary");
    }
  };

  console.log("Rendering ViewItinerarySidebar with:", {
    destinations,
    tags,
    overallRating,
    currentUserRating,
    rating
  });

  return (
    <div className="view-itinerary-sidebar">
      <div className="create-header">
        <div className="title-row">
          <ItineraryBookmark id={id} initialBookmarked={isBookmarked} />
          <h1 className="itinerary-main-title">{title}</h1>
        </div>
        <p className="itinerary-author">Created by: {authorname}</p>
      </div>

      <div className="create-form-card">
        <div className="form-section">
          <label className="form-label">Description</label>
          <div className="view-value description">{description}</div>
        </div>

        <div className="form-row">
          <div className="input-group">
            <label className="form-label">Duration</label>
            <div className="view-value">{duration}</div>
          </div>
          <div className="input-group">
            <label className="form-label">Price Level</label>
            <div className="view-value">{price}</div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="form-section">
          <label className="form-label">Rating</label>
          <div className="rating-display">
            {[1, 2, 3, 4, 5].map((star) => {
              // Use the actual rating from the itinerary
              const displayRating = hoverRating || currentUserRating || overallRating || rating || 0;
              const isFilled = star <= displayRating;

              return (
                <span
                  key={star}
                  className={`star ${isFilled ? "filled" : ""} ${canRate ? "clickable" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canRate) handleRate(star);
                  }}
                  onMouseEnter={() => canRate && setHoverRating(star)}
                  onMouseLeave={() => canRate && setHoverRating(0)}
                  style={{ cursor: canRate ? "pointer" : "default" }}
                  title={
                    canRate
                      ? `Rate ${star} star(s)`
                      : `Overall rating: ${(overallRating || rating || 0).toFixed(1)}`
                  }
                >
                  ★
                </span>
              );
            })}
            <span className="rating-text">({(overallRating || rating || 0).toFixed(1)}/5)</span>
          </div>
          {canRate && (
            <p className="rating-hint">Click to rate this itinerary</p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="form-section">
            <label className="form-label">Tags</label>
            <div className="tags-container">
              {tags.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Destinations */}
        <div className="form-section">
          <label className="form-label">
            Destinations ({destinations.length})
          </label>
          {destinations.length > 0 ? (
            <div className="destinations-list">
              {destinations.map((d, i) => (
                <div
                  key={d.id || i}
                  className="destination-item view-destination"
                >
                  <div className="destination-order">{i + 1}</div>
                  <div className="destination-info">
                    <div className="destination-name">
                      {d.name || `Destination ${i + 1}`}
                    </div>
                    {d.address && (
                      <div className="destination-address">{d.address}</div>
                    )}
                    {d.rating && (
                      <div className="destination-rating">
                        <span className="star-icon">★</span>
                        <span>{d.rating}</span>
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