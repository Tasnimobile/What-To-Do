// CustomDropdown.js
import React, { useState, useRef, useEffect } from "react";
import "./CustomDropdown.css";

function CustomDropdown({ options, value, onChange, placeholder, className }) {
  // State for dropdown open/close and selected value
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef(null);

  // Update selected value when parent value changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle selecting an option
  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    onChange(optionValue);
    setIsOpen(false);
  };

  // Find the currently selected option for display
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className={`custom - dropdown ${className || ""} `} ref={dropdownRef}>
      {/* Dropdown trigger/header */}
      <div
        className={`dropdown - header ${isOpen ? "open" : ""} `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="dropdown-arrow">▼</span>
      </div>

      {/* Dropdown options list */}
      {isOpen && (
        <div className="dropdown-list">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown - item ${selectedValue === option.value ? "selected" : ""
                } `}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;