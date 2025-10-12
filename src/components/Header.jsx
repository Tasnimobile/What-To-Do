import "./Header.css";
import { useState, useEffect, useRef } from "react";

export default function Header({
  goHome,
  goToPrevious,
  goToSavedItineraries,
  goToMyItineraries,
  goToProfile,
  logOut,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const userIconRef = useRef(null);

  const toggleMenu = () => setShowMenu((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !userIconRef.current?.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleMenuClick = (action) => {
    setShowMenu(false);
    if (typeof action === "function") action();
  };

  return (
    <div className="header">
      <button
        className="back-button"
        onClick={goToPrevious || undefined}
        disabled={!goToPrevious}
      >
        ←
      </button>
      <h2
        className="header-title"
        onClick={goHome}
        style={{ cursor: "pointer" }}
      >
        What To Do - New York City
      </h2>

      <div className="user-menu-container">
        <button className="user-icon" onClick={toggleMenu} ref={userIconRef}>
          👤
        </button>
        {showMenu && (
          <div className="dropdown-menu" ref={menuRef}>
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
