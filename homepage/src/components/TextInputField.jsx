import { useState } from "react";
import "./TextInputField.css";

export default function TextInputField({
  label = "", // header text to show when text is entered
  initialText = "", // first text to show up when page loads
  id = "",
  type = "itinerary-name", // type can be itinerary-name or description
}) {
  const [text, setText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialText);

  const handleSubmit = () => {
    if (inputValue.trim() === "") {
      setText(initialText);
      setInputValue(initialText);
    } else {
      setText(inputValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    // call handleSubmit() when enter key is pressed
    if (e.key === "Enter" && type !== "description") {
      e.preventDefault(); // prevent new line when enter key is pressed when type is not description
      handleSubmit();
    }
  };

  return (
    <div id={id} className="editable-container">
      {isEditing ? (
        <div className="text-input-field" data-type={type}>
          {type === "description" ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              onFocus={(e) => e.target.select()}
              className="text-input description-input"
              placeholder="Add description"
            />
          ) : (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              onFocus={(e) => e.target.select()}
              className="text-input"
              placeholder="Enter itinerary name"
            />
          )}
          <button onClick={handleSubmit} className="submit-button">
            Enter
          </button>
        </div>
      ) : (
        <div
          className="editable-div"
          onClick={() => {
            setInputValue(text);
            setIsEditing(true);
          }}
        >
          {type === "description" ? (
            text.trim() === "" ? (
              <span className="editable-placeholder">Add description</span>
            ) : (
              <>
                <div className="editable-label">{label}:</div>
                <div className="editable-text">{text}</div>
              </>
            )
          ) : (
            text
          )}
        </div>
      )}
    </div>
  );
}
