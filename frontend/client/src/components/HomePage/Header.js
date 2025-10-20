// Header.js
import React, { useState, useRef, useEffect } from "react";
import "./Header.css";

function Header({
  onBack,
  user,
  onNavigateToProfile,
  onNavigateToHome,
  onNavigateToCreated,
  onNavigateToSaved,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const dropdownRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const handleTitleClick = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    } else if (onBack) {
      onBack();
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleHomepageClick = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
    setShowDropdown(false);
  };

  const handleAccountClick = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
    setShowDropdown(false);
  };

  const handleCreatedItinerariesClick = () => {
    if (onNavigateToCreated) {
      onNavigateToCreated();
    }
    setShowDropdown(false);
  };

  const handleSavedItinerariesClick = () => {
    if (onNavigateToSaved) {
      onNavigateToSaved();
    }
    setShowDropdown(false);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setShowDropdown(false);
  };

  const showTitleTooltip = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(true);
  };

  const hideTitleTooltip = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="header">
      <button className="back-button" onClick={handleBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        Back
      </button>

      {/* Clickable Title */}
      <div
        className="header-title-container"
        onMouseEnter={showTitleTooltip}
        onMouseLeave={hideTitleTooltip}
      >
        <h2 className="header-title-clickable" onClick={handleTitleClick}>
          What To Do - New York City
        </h2>
        {showTooltip && <div className="title-tooltip">Go to Homepage</div>}
      </div>

      <div className="account-container" ref={dropdownRef}>
        <button className="account-button" onClick={toggleDropdown}>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          )}
        </button>

        {showDropdown && (
          <div className="dropdown-menu">
            {/* Add Homepage option */}
            <div className="dropdown-item" onClick={handleHomepageClick}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              Homepage
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item" onClick={handleAccountClick}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              Account
            </div>
            <div
              className="dropdown-item"
              onClick={handleCreatedItinerariesClick}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              Created Itineraries
            </div>
            <div
              className="dropdown-item"
              onClick={handleSavedItinerariesClick}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
              Saved Itineraries
            </div>
            <div className="dropdown-divider"></div>
            <div className="dropdown-item logout" onClick={handleLogout}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
