import "./Header.css";
import { useState, useEffect } from "react";

export default function Header({
  onBack,
  goToSavedItineraries,
  goToMyItineraries,
  goToProfile,
  logOut,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => setShowMenu((prev) => !prev);

  const handleMenuClick = (action) => {
    setShowMenu(false);
    if (typeof action === "function") action();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".user-icon") &&
        !event.target.closest(".dropdown-menu")
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div className="header">
      <button className="back-button" onClick={onBack}>
        ←
      </button>

      <h2
        className="header-title"
        onClick={onBack} // runs the same callback as the back button
        style={{ cursor: "pointer" }} // makes it clickable
      >
        What To Do - New York City
      </h2>

      <div className="user-menu-container">
        <button className="user-icon" onClick={toggleMenu}>
          👤
        </button>

        {showMenu && (
          <div className="dropdown-menu">
            <button onClick={() => handleMenuClick(goToProfile)}>
              Profile
            </button>
            <button onClick={() => handleMenuClick(goToMyItineraries)}>
              My Itineraries
            </button>
            <button onClick={() => handleMenuClick(goToSavedItineraries)}>
              Saved Itineraries
            </button>
            <button onClick={() => handleMenuClick(logOut)}>Log Out</button>
          </div>
        )}
      </div>
    </div>
  );
}
