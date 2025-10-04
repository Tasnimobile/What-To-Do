import React from "react";
import Homepage from "./pages/Homepage.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID}>
      <Homepage />
    </GoogleOAuthProvider>
  );
}

export default App;
