import { useState, useEffect, useRef } from "react";
import "./TextInputField.css";

export default function TextInputField({
  label = "Description",
  value = "",
  onChange,
  id = "",
  type = "itinerary-name",
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [text, setText] = useState(value);
  const inputRef = useRef(null);

  const placeholderText =
    type === "description" ? "Add description" : "Add itinerary name";

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value);
      setText(value);
    }
  }, [value, isEditing]);

  const handleSubmit = () => {
    const finalValue = inputValue.trim() === "" ? text : inputValue.trim();
    setText(finalValue);
    setInputValue(finalValue);
    if (onChange) onChange(finalValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && type !== "description") {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  return (
    <div id={id} className="editable-container">
      {isEditing ? (
        <div
          className={`text-input-field ${
            type === "description" ? "description-mode" : "itinerary-name-mode"
          }`}
        >
          {type === "description" ? (
            <>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-input description-input"
                placeholder={placeholderText}
              />
              <button className="submit-button wide" onClick={handleSubmit}>
                Enter
              </button>
            </>
          ) : (
            <>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-input"
                placeholder={placeholderText}
              />
              <button className="submit-button" onClick={handleSubmit}>
                Enter
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          className="editable-div"
          onClick={() => {
            setInputValue(text);
            setIsEditing(true);
          }}
        >
          {text.trim() === "" ? (
            <span className="editable-placeholder">{placeholderText}</span>
          ) : type === "description" ? (
            <>
              {label && <div className="editable-label">{label}:</div>}
              <div className="editable-text">{text}</div>
            </>
          ) : (
            text
          )}
        </div>
      )}
    </div>
  );
}
