// App.js
import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import WelcomePage from "./components/WelcomePage/WelcomePage.js";
import LoginPage from "./components/LoginPage/LoginPage";
import SignupPage from "./components/SignupPage/SignupPage";
import AccountSetupPage from "./components/AccountSetupPage/AccountSetupPage";
import UserProfilePage from "./components/UserProfilePage/UserProfilePage";
import Homepage from "./components/HomePage/HomePage";
import CreateItineraryPage from "./components/CreateItineraryPage/CreateItineraryPage";
import ViewItineraryPage from "./components/ViewItineraryPage/ViewItineraryPage";
import CreatedItinerariesPage from "./components/CreatedItinerariesPage/CreatedItinerariesPage";
import SavedItinerariesPage from "./components/SavedItinerariesPage/SavedItinerariesPage.js";
import UniversalErrorPopup from "./components/UniversalErrorPopup/UniversalErrorPopup";

function App() {
  const [currentPage, setCurrentPage] = useState("welcome");
  const [pageHistory, setPageHistory] = useState(["welcome"]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  const clearGlobalError = () => {
    setGlobalError("");
  };

  const showGlobalError = (message) => {
    setGlobalError(message);
  };

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/user/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            if (!data.user.username || !data.user.bio) {
              setCurrentPage("setup");
            } else {
              setCurrentPage("homepage");
            }
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        showGlobalError("Failed to check user session. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const navigateTo = (page) => {
    setPageHistory((prev) => [...prev, page]);
    setCurrentPage(page);
  };

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCurrentPage(previousPage);
    } else {
      setCurrentPage("welcome");
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    console.log("User logged in:", userData);

    if (!userData.username || !userData.bio) {
      navigateTo("setup");
    } else {
      navigateTo("homepage");
    }
  };

  const handleSignup = (userData) => {
    setUser(userData);
    console.log("User signed up:", userData);
    navigateTo("setup");
  };

  const handleSetupComplete = (userData) => {
    setUser(userData);
    console.log("User setup completed:", userData);
    navigateTo("homepage");
  };

  const handleProfileUpdate = (userData) => {
    setUser(userData);
    console.log("User profile updated:", userData);
  };

  const handleGoogleLogin = (googleData) => {
    console.log("Google login successful:", googleData);
    const userObject = parseJwt(googleData.credential);
    const userData = {
      id: userObject.sub,
      name: userObject.name,
      email: userObject.email,
      picture: userObject.picture,
      provider: "google",
    };
    setUser(userData);
    console.log("User data:", userData);

    if (!userData.username) {
      navigateTo("setup");
    } else {
      navigateTo("homepage");
    }
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      showGlobalError("Failed to process login. Please try again.");
      return null;
    }
  };

  const switchToSignup = () => {
    navigateTo("signup");
  };

  const switchToLogin = () => {
    navigateTo("login");
  };

  const switchToHomepage = () => {
    navigateTo("homepage");
  };

  const switchToProfile = () => {
    if (user) {
      navigateTo("profile");
    } else {
      showGlobalError("Please log in to view your profile.");
      navigateTo("login");
    }
  };

  const switchToAccountSetup = () => {
    navigateTo("setup");
  };

  const switchToCreateItinerary = () => {
    navigateTo("create-itinerary");
  };

  const switchToViewItinerary = (itinerary) => {
    setSelectedItinerary(itinerary);
    navigateTo("view-itinerary");
  };

  const switchToCreatedItineraries = () => {
    if (user) {
      navigateTo("created-itineraries");
    } else {
      showGlobalError("Please log in to view your created itineraries.");
      navigateTo("login");
    }
  };

  const switchToSavedItineraries = () => {
    if (user) {
      navigateTo("saved-itineraries");
    } else {
      showGlobalError("Please log in to view your saved itineraries.");
      navigateTo("login");
    }
  };

  if (isLoading) {
    return (
      <div className="app">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            backgroundColor: "#FFFDF0",
            fontFamily: "PoiretOne, cursive",
            fontSize: "1.2rem",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={switchToSignup}
            onBack={handleBack}
            onGoogleLogin={handleGoogleLogin}
          />
        );
      case "signup":
        return (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={switchToLogin}
            onBack={handleBack}
            onGoogleLogin={handleGoogleLogin}
          />
        );
      case "setup":
        return (
          <AccountSetupPage
            user={user}
            onComplete={handleSetupComplete}
            onBack={handleBack}
          />
        );
      case "profile":
        return (
          <UserProfilePage
            user={user}
            onBack={handleBack}
            onUpdate={handleProfileUpdate}
            onNavigateToCreated={switchToCreatedItineraries}
            onViewItinerary={switchToViewItinerary}
            onNavigateToHome={switchToHomepage}
            onNavigateToSaved={switchToSavedItineraries}
          />
        );
      case "homepage":
        return (
          <Homepage
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToCreate={switchToCreateItinerary}
            onViewItinerary={switchToViewItinerary}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
          />
        );
      case "create-itinerary":
        return (
          <CreateItineraryPage
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
          />
        );
      case "view-itinerary":
        return (
          <ViewItineraryPage
            itinerary={selectedItinerary}
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
          />
        );

      case "created-itineraries":
        return (
          <CreatedItinerariesPage
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onViewItinerary={switchToViewItinerary}
            onNavigateToCreate={switchToCreateItinerary}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
          />
        );

      case "saved-itineraries":
        return (
          <SavedItinerariesPage
            onBack={handleBack}
            user={user}
            onNavigateToProfile={switchToProfile}
            onNavigateToHome={switchToHomepage}
            onViewItinerary={switchToViewItinerary}
            onNavigateToCreated={switchToCreatedItineraries}
            onNavigateToSaved={switchToSavedItineraries}
          />
        );

      case "welcome":
      default:
        return (
          <WelcomePage
            onSwitchToLogin={switchToLogin}
            onSwitchToSignup={switchToSignup}
            onSwitchToHomepage={switchToHomepage}
            onSwitchToAccountSetup={switchToAccountSetup}
          />
        );
    }
  };

  return (
    <GoogleOAuthProvider
      clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}
    >
      <div className="app">
        {renderCurrentPage()}

        <UniversalErrorPopup
          message={globalError}
          onClose={clearGlobalError}
          duration={6000}
        />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
