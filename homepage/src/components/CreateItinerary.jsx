import { useState } from "react";
import TextInputField from "./TextInputField";
import "./CreateItinerary.css";

export default function CreateItinerary() {
  return (
    <div className="create-itinerary">
      <h1>New Itinerary</h1>

      <TextInputField
        id="enter-itinerary"
        initialText="Enter itinerary name"
        type="single-line"
      />

      <TextInputField
        id="enter-description"
        label="Description"
        type="description"
      />

      <div className="buttons">
        <button>+ Add Destinations</button>
        <button>Save</button>
      </div>
    </div>
  );
}
