import "./Header.css";
import { useState, useEffect } from "react";

export default function Header({ onBack }) {
  const [showMenu, setShowMenu] = useState(false);
  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="header">
      <button className="back-button" onClick={onBack}>
        ←
      </button>

      <h2>What To Do - New York City</h2>

      <div className="user-menu-container">
        <button className="user-icon" onClick={toggleMenu}>
          👤
        </button>

        {showMenu && (
          <div className="dropdown-menu">
            <a href="/profile">Profile</a>
            <a href="/settings">Created Itineraries</a>
            <a href="/logout">Saved Itineraries</a>
            <a href="/logout">Log Out</a>
          </div>
        )}
      </div>
    </div>
  );
}
