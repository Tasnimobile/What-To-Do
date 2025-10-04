import { useState } from "react";
import TextInputField from "./TextInputField";
import "./CreateNewItinerary.css";

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
        <a>+ Add Destinations</a>
        {/* need to change later on to make the button navigate to the itinerary page of the created itinerary */}
        <a href="/sidebar">Save</a>
        <a href="/sidebar">Cancel</a>
      </div>
    </div>
  );
}
